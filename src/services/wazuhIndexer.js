/**
 * Service Wazuh Indexer (OpenSearch)
 * 
 * Récupère les alertes de sécurité stockées dans l'indexer OpenSearch.
 * L'indexer contient toutes les alertes générées par les agents Wazuh.
 */

import { 
  API_CONFIG, 
  mapRuleLevelToSeverity, 
  detectCloudProvider 
} from '../config/api.config';

const { baseUrl, credentials, indices } = API_CONFIG.WAZUH_INDEXER;

class WazuhIndexerService {
  constructor() {
    this.baseUrl = baseUrl;
    this.authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }

  // ============================================
  // MÉTHODES PUBLIQUES
  // ============================================

  /**
   * Récupère les alertes avec pagination
   */
  async getAlerts({ limit = 100, offset = 0, ...filters } = {}) {
    const query = {
      query: this.#buildQuery(filters),
      sort: [{ timestamp: { order: 'desc' } }],
      size: limit,
      from: offset
    };

    const response = await this.#request(`/${indices.alerts}/_search`, {
      method: 'POST',
      body: JSON.stringify(query)
    });

    return (response.hits?.hits || []).map(hit => 
      this.#transformAlert(hit._source, hit._id)
    );
  }

  /**
   * Compte le nombre total d'alertes
   */
  async getAlertsCount(filters = {}) {
    const response = await this.#request(`/${indices.alerts}/_count`, {
      method: 'POST',
      body: JSON.stringify({ query: this.#buildQuery(filters) })
    });
    return response.count || 0;
  }

  /**
   * Récupère la distribution par sévérité
   */
  async getAlertsBySeverity() {
    const response = await this.#aggregate({
      severity: {
        range: {
          field: 'rule.level',
          ranges: [
            { key: 'Low', from: 0, to: 4 },
            { key: 'Medium', from: 4, to: 7 },
            { key: 'High', from: 7, to: 12 },
            { key: 'Critical', from: 12 }
          ]
        }
      }
    });

    return this.#bucketsToObject(response.severity?.buckets);
  }

  /**
   * Récupère la distribution par agent
   */
  async getAlertsByAgent(size = 20) {
    const response = await this.#aggregate({
      agents: { terms: { field: 'agent.name', size } }
    });
    return response.agents?.buckets || [];
  }

  /**
   * Récupère la distribution par tactique MITRE
   */
  async getAlertsByMitre(size = 20) {
    const response = await this.#aggregate({
      mitre: { terms: { field: 'rule.mitre.tactic', size } }
    });
    return response.mitre?.buckets || [];
  }

  /**
   * Récupère la distribution par cloud provider
   * Utilise agent.labels.source (gcp, aws, azure) ou fallback sur le nom d'agent
   */
  async getAlertsByCloudProvider() {
    // 1. Agréger par agent.labels.source
    const labelResponse = await this.#aggregate({
      sources: { terms: { field: 'agent.labels.source', size: 20 } }
    });
    
    const results = {};
    const labelBuckets = labelResponse.sources?.buckets || [];
    let labeledCount = 0;
    
    // Compter les alertes avec labels
    for (const bucket of labelBuckets) {
      const source = bucket.key.toLowerCase();
      let provider = 'Wazuh';
      
      if (source.includes('aws') || source.includes('amazon')) provider = 'AWS';
      else if (source.includes('azure') || source.includes('microsoft')) provider = 'Azure';
      else if (source.includes('gcp') || source.includes('google')) provider = 'GCP';
      else provider = bucket.key; // Utiliser le label tel quel
      
      results[provider] = (results[provider] || 0) + bucket.doc_count;
      labeledCount += bucket.doc_count;
    }

    // 2. Agréger par nom d'agent pour détecter les patterns cloud
    const agentResponse = await this.#aggregate({
      agents: { terms: { field: 'agent.name', size: 50 } }
    });
    
    const agentBuckets = agentResponse.agents?.buckets || [];
    let wazuhCount = 0;
    
    for (const bucket of agentBuckets) {
      const agentName = bucket.key.toLowerCase();
      let provider = null;
      
      if (agentName.includes('aws') || agentName.includes('amazon')) provider = 'AWS';
      else if (agentName.includes('azure')) provider = 'Azure';
      else if (agentName.includes('gcp') || agentName.includes('google')) provider = 'GCP';
      
      if (provider) {
        results[provider] = (results[provider] || 0) + bucket.doc_count;
      } else {
        wazuhCount += bucket.doc_count;
      }
    }
    
    // Ajouter les alertes locales (On-Premise)
    if (wazuhCount > 0) {
      // Éviter de compter deux fois les alertes avec labels
      results['On_Premise'] = Math.max(0, wazuhCount - labeledCount);
    }

    return results;
  }

  /**
   * Récupère la timeline par cloud provider
   * Utilise agent.labels.source et agent.name pour la classification
   */
  async getTimelineByCloudProvider(hours = 24) {
    const query = {
      size: 0,
      query: {
        range: { timestamp: { gte: `now-${hours}h`, lte: 'now' } }
      },
      aggs: {
        timeline: {
          date_histogram: { field: 'timestamp', fixed_interval: '1h' },
          aggs: {
            by_source: { terms: { field: 'agent.labels.source', size: 20 } },
            by_agent: { terms: { field: 'agent.name', size: 30 } }
          }
        }
      }
    };

    const response = await this.#request(`/${indices.alerts}/_search`, {
      method: 'POST',
      body: JSON.stringify(query)
    });

    const buckets = response.aggregations?.timeline?.buckets || [];
    
    return buckets.map(bucket => {
      const result = {
        time: bucket.key_as_string || bucket.key,
        AWS: 0,
        Azure: 0,
        GCP: 0,
        On_Premise: 0
      };

      // Compter par agent.labels.source
      const sources = bucket.by_source?.buckets || [];
      let labeledCount = 0;
      
      for (const src of sources) {
        const source = src.key.toLowerCase();
        if (source.includes('aws') || source.includes('amazon')) {
          result.AWS += src.doc_count;
        } else if (source.includes('azure')) {
          result.Azure += src.doc_count;
        } else if (source.includes('gcp') || source.includes('google')) {
          result.GCP += src.doc_count;
        }
        labeledCount += src.doc_count;
      }

      // Compter par nom d'agent
      const agents = bucket.by_agent?.buckets || [];
      let totalFromAgents = 0;
      
      for (const agent of agents) {
        const name = agent.key.toLowerCase();
        if (name.includes('aws') || name.includes('amazon')) {
          result.AWS += agent.doc_count;
        } else if (name.includes('azure')) {
          result.Azure += agent.doc_count;
        } else if (name.includes('gcp') || name.includes('google')) {
          result.GCP += agent.doc_count;
        } else {
          totalFromAgents += agent.doc_count;
        }
      }
      
      // On_Premise = alertes locales (sans labels cloud)
      result.On_Premise = Math.max(0, totalFromAgents - labeledCount);

      return result;
    });
  }

  /**
   * Récupère l'historique des alertes par heure
   */
  async getAlertsTimeline(hours = 24) {
    const query = {
      size: 0,
      query: {
        range: { timestamp: { gte: `now-${hours}h`, lte: 'now' } }
      },
      aggs: {
        timeline: {
          date_histogram: { field: 'timestamp', fixed_interval: '1h' }
        }
      }
    };

    const response = await this.#request(`/${indices.alerts}/_search`, {
      method: 'POST',
      body: JSON.stringify(query)
    });

    return response.aggregations?.timeline?.buckets || [];
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  /**
   * Effectue une requête HTTP vers l'indexer
   */
  async #request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.reason || `Indexer Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Exécute une requête d'agrégation
   */
  async #aggregate(aggs, query = { match_all: {} }) {
    const response = await this.#request(`/${indices.alerts}/_search`, {
      method: 'POST',
      body: JSON.stringify({ size: 0, query, aggs })
    });
    return response.aggregations || {};
  }

  /**
   * Construit une requête de filtre OpenSearch
   */
  #buildQuery({ level, agentId, search, ruleGroup } = {}) {
    const must = [];

    if (level) {
      must.push({ range: { 'rule.level': { gte: level } } });
    }
    if (agentId) {
      must.push({ term: { 'agent.id': agentId } });
    }
    if (search) {
      must.push({
        multi_match: {
          query: search,
          fields: ['rule.description', 'full_log', 'agent.name']
        }
      });
    }
    if (ruleGroup) {
      must.push({ term: { 'rule.groups': ruleGroup } });
    }

    return must.length ? { bool: { must } } : { match_all: {} };
  }

  /**
   * Transforme une alerte OpenSearch vers le format UI
   */
  #transformAlert(source, id) {
    const rawTimestamp = source.timestamp || source['@timestamp'];
    
    return {
      id: id || source.id || `alert-${Date.now()}`,
      timestamp: rawTimestamp,
      time: this.#formatTime(rawTimestamp),
      provider: detectCloudProvider(source),
      service: source.rule?.groups?.[0] || 'Wazuh',
      severity: mapRuleLevelToSeverity(source.rule?.level),
      description: source.rule?.description || 'Alerte Wazuh',
      environment: source.agent?.name || 'Unknown',
      region: source.location || 'local',
      status: 'New',
      
      // Données enrichies pour le détail
      rule: {
        id: source.rule?.id,
        level: source.rule?.level,
        description: source.rule?.description,
        groups: source.rule?.groups,
        mitre: source.rule?.mitre,
        pci_dss: source.rule?.pci_dss,
        hipaa: source.rule?.hipaa,
        gdpr: source.rule?.gdpr,
        nist: source.rule?.nist_800_53
      },
      agent: {
        id: source.agent?.id,
        name: source.agent?.name,
        ip: source.agent?.ip
      },
      data: source.data,
      full_log: source.full_log
    };
  }

  /**
   * Convertit les buckets d'agrégation en objet
   */
  #bucketsToObject(buckets = []) {
    return buckets.reduce((acc, { key, doc_count }) => {
      acc[key] = doc_count;
      return acc;
    }, {});
  }

  /**
   * Formate un timestamp pour l'affichage
   */
  #formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      // Si moins de 60 secondes
      if (diffSec < 60) {
        return diffSec <= 5 ? 'À l\'instant' : `Il y a ${diffSec}s`;
      }
      // Si moins de 60 minutes
      if (diffMin < 60) {
        return `Il y a ${diffMin}min`;
      }
      // Si moins de 24 heures
      if (diffHour < 24) {
        return `Il y a ${diffHour}h`;
      }
      // Si moins de 7 jours
      if (diffDay < 7) {
        return `Il y a ${diffDay}j`;
      }
      // Sinon, afficher la date complète
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return timestamp;
    }
  }
}

export const wazuhIndexer = new WazuhIndexerService();
