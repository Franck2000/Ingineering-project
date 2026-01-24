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
}

export const wazuhApi = new WazuhApiService();
