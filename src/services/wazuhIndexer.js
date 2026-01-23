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
    return {
      id: id || source.id || `alert-${Date.now()}`,
      timestamp: source.timestamp || source['@timestamp'],
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
}

export const wazuhIndexer = new WazuhIndexerService();
