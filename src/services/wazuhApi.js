/**
 * Service API Wazuh Manager
 * ============================================
 * Gère les appels vers l'API Wazuh Manager (port 55000).
 * Utilisé pour : authentification, gestion des agents, infos du manager.
 * 
 * Note: Les alertes sont récupérées depuis l'indexer (wazuhIndexer.js)
 */
import { wazuhAuth } from './wazuhAuth';
import { API_CONFIG } from '../config/api.config';

class WazuhApiService {
  constructor() {
    this.baseUrl = API_CONFIG.WAZUH_MANAGER.baseUrl;
  }

  /**
   * Effectue une requête authentifiée vers l'API Wazuh
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
   * Récupère les statistiques des agents
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
   * Récupère les détails complets d'un agent
   */
  async getAgentById(agentId) {
    try {
      const response = await this.request(`/agents?agents_list=${agentId}`);
      return response.data?.affected_items?.[0] || null;
    } catch (error) {
      console.error('Erreur récupération agent:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques syscollector d'un agent (hardware, OS, etc.)
   */
  async getAgentSyscollector(agentId) {
    try {
      const [hardware, os, netiface, netaddr, packages, processes, ports] = await Promise.allSettled([
        this.request(`/syscollector/${agentId}/hardware`),
        this.request(`/syscollector/${agentId}/os`),
        this.request(`/syscollector/${agentId}/netiface`),
        this.request(`/syscollector/${agentId}/netaddr`),
        this.request(`/syscollector/${agentId}/packages?limit=100`),
        this.request(`/syscollector/${agentId}/processes?limit=50`),
        this.request(`/syscollector/${agentId}/ports?limit=50`)
      ]);

      return {
        hardware: hardware.status === 'fulfilled' ? hardware.value.data?.affected_items?.[0] : null,
        os: os.status === 'fulfilled' ? os.value.data?.affected_items?.[0] : null,
        netiface: netiface.status === 'fulfilled' ? netiface.value.data?.affected_items : [],
        netaddr: netaddr.status === 'fulfilled' ? netaddr.value.data?.affected_items : [],
        packages: packages.status === 'fulfilled' ? packages.value.data?.affected_items : [],
        processes: processes.status === 'fulfilled' ? processes.value.data?.affected_items : [],
        ports: ports.status === 'fulfilled' ? ports.value.data?.affected_items : []
      };
    } catch (error) {
      console.error('Erreur récupération syscollector:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de l'agent (stats internes Wazuh)
   */
  async getAgentStats(agentId) {
    try {
      const response = await this.request(`/agents/${agentId}/stats/agent`);
      return response.data?.affected_items?.[0] || null;
    } catch (error) {
      console.error('Erreur récupération stats agent:', error);
      return null;
    }
  }

  /**
   * Récupère le résumé de configuration de l'agent
   */
  async getAgentConfig(agentId) {
    try {
      const response = await this.request(`/agents/${agentId}/config/client/client`);
      return response.data?.affected_items?.[0] || null;
    } catch (error) {
      console.error('Erreur récupération config agent:', error);
      return null;
    }
  }

  /**
   * Récupère les vulnérabilités détectées sur l'agent
   */
  async getAgentVulnerabilities(agentId) {
    try {
      const response = await this.request(`/vulnerability/${agentId}?limit=100`);
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération vulnérabilités:', error);
      return [];
    }
  }

  /**
   * Récupère les résultats SCA (Security Configuration Assessment)
   */
  async getAgentSCA(agentId) {
    try {
      const response = await this.request(`/sca/${agentId}`);
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération SCA:', error);
      return [];
    }
  }

  /**
   * Récupère les checks SCA détaillés pour une policy
   */
  async getAgentSCAChecks(agentId, policyId) {
    try {
      const response = await this.request(`/sca/${agentId}/checks/${policyId}?limit=500`);
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération SCA checks:', error);
      return [];
    }
  }

  /**
   * Récupère le résumé des statistiques MITRE ATT&CK pour l'agent
   */
  async getAgentMitreStats(agentId) {
    try {
      const response = await this.request(`/mitre/software?agent_list=${agentId}`);
      return response.data?.affected_items || [];
    } catch (error) {
      console.error('Erreur récupération MITRE:', error);
      return [];
    }
  }
}

export const wazuhApi = new WazuhApiService();
