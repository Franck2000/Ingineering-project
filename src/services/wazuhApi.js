/**
 * Service API Wazuh
 * Récupère les données directement depuis l'API Wazuh Manager
 */
import { wazuhAuth } from './wazuhAuth';

class WazuhApiService {
  constructor() {
    this.baseUrl = '/api/wazuh';
  }

  /**
   * Effectue une requête authentifiée vers l'API Wazuh
   * @param {string} endpoint - Endpoint de l'API
   * @param {Object} options - Options fetch
   * @returns {Promise<Object>} Réponse JSON
   */
  async request(endpoint, options = {}) {
    const token = wazuhAuth.getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expiré, essayer de rafraîchir
      try {
        await wazuhAuth.refreshToken();
        return this.request(endpoint, options);
      } catch (error) {
        wazuhAuth.logout();
        window.location.reload();
        throw new Error('Session expirée');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Erreur API: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Récupère les logs du manager (alertes internes)
   * @param {Object} params - Paramètres de recherche
   * @returns {Promise<Array>} Liste des logs
   */
  async getManagerLogs(params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.set('limit', params.limit || 500);
    queryParams.set('offset', params.offset || 0);
    
    if (params.level) {
      queryParams.set('level', params.level);
    }
    if (params.tag) {
      queryParams.set('tag', params.tag);
    }

    try {
      const response = await this.request(`/manager/logs?${queryParams.toString()}`);
      return this._transformLogs(response.data?.affected_items || []);
    } catch (error) {
      console.error('Erreur récupération logs:', error);
      throw error;
    }
  }

  /**
   * Récupère les événements syscheck (File Integrity Monitoring) pour un agent
   * @param {string} agentId - ID de l'agent (default: 000 = manager)
   * @param {Object} params - Paramètres
   * @returns {Promise<Array>} Liste des événements FIM
   */
  async getSyscheck(agentId = '000', params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.set('limit', params.limit || 100);
    queryParams.set('offset', params.offset || 0);

    try {
      const response = await this.request(`/syscheck/${agentId}?${queryParams.toString()}`);
      return this._transformSyscheck(response.data?.affected_items || [], agentId);
    } catch (error) {
      console.error('Erreur récupération syscheck:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les événements syscheck de tous les agents
   * @returns {Promise<Array>} Liste combinée des événements FIM
   */
  async getAllSyscheck() {
    try {
      const agents = await this.getAgents();
      const syscheckPromises = agents.map(agent => 
        this.getSyscheck(agent.id, { limit: 50 }).catch(() => [])
      );
      const results = await Promise.all(syscheckPromises);
      return results.flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Erreur récupération all syscheck:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des agents
   * @returns {Promise<Object>} Statistiques
   */
  async getAgentStats() {
    try {
      const response = await this.request('/agents/summary/status');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération stats agents:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des agents
   * @returns {Promise<Array>} Liste des agents
   */
  async getAgents() {
    try {
      const response = await this.request('/agents?limit=500');
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération agents:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations du manager
   * @returns {Promise<Object>} Info du manager
   */
  async getManagerInfo() {
    try {
      const response = await this.request('/manager/info');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération info manager:', error);
      throw error;
    }
  }

  /**
   * Récupère le résumé des logs par service
   * @returns {Promise<Object>} Résumé des logs
   */
  async getLogsSummary() {
    try {
      const response = await this.request('/manager/logs/summary');
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération logs summary:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les alertes (combinaison logs + syscheck)
   * @param {Object} params - Paramètres
   * @returns {Promise<Array>} Liste des alertes
   */
  async getAlerts(params = {}) {
    try {
      const [logs, syscheck] = await Promise.all([
        this.getManagerLogs({ limit: params.limit || 200 }),
        this.getAllSyscheck()
      ]);

      // Combiner et trier par date
      const allAlerts = [...logs, ...syscheck]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, params.limit || 500);

      return allAlerts;
    } catch (error) {
      console.error('Erreur récupération alertes:', error);
      throw error;
    }
  }

  /**
   * Transforme les logs Wazuh vers le format de l'application
   * @private
   */
  _transformLogs(logs) {
    return logs.map((log, index) => ({
      id: `log-${index}-${Date.now()}`,
      timestamp: log.timestamp || new Date().toISOString(),
      provider: 'Wazuh',
      service: log.tag || 'Manager',
      severity: this._mapLogLevel(log.level),
      description: log.description || 'Log Wazuh',
      environment: 'Production',
      region: 'local',
      status: 'New',
      raw: log
    }));
  }

  /**
   * Transforme les événements syscheck vers le format de l'application
   * @private
   */
  _transformSyscheck(events, agentId) {
    return events.map((event, index) => ({
      id: `syscheck-${agentId}-${index}-${Date.now()}`,
      timestamp: event.date || new Date().toISOString(),
      provider: 'Wazuh',
      service: 'File Integrity',
      severity: event.changes > 1 ? 'Medium' : 'Low',
      description: `File modified: ${event.file}`,
      environment: `Agent ${agentId}`,
      region: event.file?.split('/').slice(0, 3).join('/') || 'local',
      status: 'New',
      raw: event
    }));
  }

  /**
   * Mappe le niveau de log vers une sévérité
   * @private
   */
  _mapLogLevel(level) {
    switch (level?.toLowerCase()) {
      case 'critical': return 'Critical';
      case 'error': return 'High';
      case 'warning': return 'Medium';
      default: return 'Low';
    }
  }
}

export const wazuhApi = new WazuhApiService();
