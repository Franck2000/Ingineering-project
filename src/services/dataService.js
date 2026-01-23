// Service pour gérer les données - Connexion directe à Wazuh Indexer
import { wazuhApi } from './wazuhApi';
import { wazuhIndexer } from './wazuhIndexer';
import { wazuhAuth } from './wazuhAuth';

/**
 * Service de données - récupère les vraies données depuis Wazuh Indexer
 */
class DataService {
  constructor() {
    this.cachedAlerts = null;
    this.cacheTimestamp = null;
    this.cacheTimeout = 30000; // 30 secondes
  }

  /**
   * Invalide le cache
   */
  invalidateCache() {
    this.cachedAlerts = null;
    this.cacheTimestamp = null;
  }

  /**
   * Récupère les alertes depuis l'indexer
   * @param {Object} filters - Filtres à appliquer
   * @returns {Promise<Array>} Liste des alertes
   */
  async getAlerts(filters = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    // Utiliser le cache si valide
    const now = Date.now();
    if (this.cachedAlerts && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheTimeout)) {
      return this._filterAlerts(this.cachedAlerts, filters);
    }

    try {
      // Récupérer les alertes depuis l'indexer (source principale)
      const alerts = await wazuhIndexer.getAlerts({ limit: 500 });
      this.cachedAlerts = alerts;
      this.cacheTimestamp = now;
      
      return this._filterAlerts(alerts, filters);
    } catch (error) {
      console.error('Erreur indexer, fallback sur API manager:', error);
      // Fallback sur l'API manager si l'indexer échoue
      const alerts = await wazuhApi.getAlerts({ limit: 200 });
      this.cachedAlerts = alerts;
      this.cacheTimestamp = now;
      return this._filterAlerts(alerts, filters);
    }
  }

  /**
   * Récupère les statistiques
   * @returns {Promise<Object>} Statistiques
   */
  async getStatistics() {
    if (!wazuhAuth.isAuthenticated()) {
      return { totalAlerts: 0, criticalAlerts: 0, highAlerts: 0, resolvedAlerts: 0, activeAgents: 0, totalAgents: 0 };
    }

    try {
      const [agentStats, severityStats, totalCount] = await Promise.all([
        wazuhApi.getAgentStats(),
        wazuhIndexer.getAlertsBySeverity(),
        wazuhIndexer.getAlertsCount()
      ]);

      return {
        totalAlerts: totalCount,
        criticalAlerts: severityStats.Critical || 0,
        highAlerts: severityStats.High || 0,
        mediumAlerts: severityStats.Medium || 0,
        lowAlerts: severityStats.Low || 0,
        activeAgents: agentStats?.active || 0,
        disconnectedAgents: agentStats?.disconnected || 0,
        totalAgents: agentStats?.total || 0
      };
    } catch (error) {
      console.error('Erreur stats:', error);
      // Fallback : calculer depuis les alertes en cache
      const alerts = await this.getAlerts();
      const agentStats = await wazuhApi.getAgentStats().catch(() => ({}));
      
      return {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'Critical').length,
        highAlerts: alerts.filter(a => a.severity === 'High').length,
        mediumAlerts: alerts.filter(a => a.severity === 'Medium').length,
        lowAlerts: alerts.filter(a => a.severity === 'Low').length,
        activeAgents: agentStats?.active || 0,
        disconnectedAgents: agentStats?.disconnected || 0,
        totalAgents: agentStats?.total || 0
      };
    }
  }

  /**
   * Récupère les données temporelles
   * @returns {Promise<Array>} Données temporelles
   */
  async getTimeSeriesData() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    try {
      // Utiliser l'agrégation de l'indexer pour la timeline
      const timeline = await wazuhIndexer.getAlertsTimeline(24);
      
      return timeline.map(bucket => ({
        time: new Date(bucket.key_as_string || bucket.key).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        Wazuh: bucket.doc_count || 0,
        AWS: 0,
        Azure: 0,
        GCP: 0
      }));
    } catch (error) {
      console.error('Erreur timeline, fallback sur calcul local:', error);
      // Fallback : calculer depuis les alertes
      const alerts = await this.getAlerts();
      
      const now = new Date();
      const hourlyData = {};
      
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i);
        const key = hour.toISOString().slice(0, 13);
        hourlyData[key] = { AWS: 0, Azure: 0, GCP: 0, Wazuh: 0 };
      }

      alerts.forEach(alert => {
        const alertHour = alert.timestamp?.slice(0, 13);
        if (alertHour && hourlyData[alertHour]) {
          const provider = alert.provider || 'Wazuh';
          hourlyData[alertHour][provider] = (hourlyData[alertHour][provider] || 0) + 1;
        }
      });

      return Object.entries(hourlyData).map(([time, data]) => ({
        time: new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        ...data
      }));
    }
  }

  /**
   * Récupère la distribution des providers
   * @returns {Promise<Array>} Distribution des providers
   */
  async getProviderDistribution() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const alerts = await this.getAlerts();
    const distribution = alerts.reduce((acc, alert) => {
      const provider = alert.provider || 'Wazuh';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      AWS: '#10B981',
      Azure: '#3B82F6',
      GCP: '#EF4444',
      Wazuh: '#8B5CF6'
    };

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#6B7280'
    }));
  }

  /**
   * Récupère les providers impactés
   * @returns {Promise<Array>} Liste des providers impactés
   */
  async getImpactedProviders() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const alerts = await this.getAlerts();
    return [...new Set(alerts.map(alert => alert.provider).filter(Boolean))];
  }

  /**
   * Récupère les services principaux
   * @returns {Promise<Array>} Liste des services principaux
   */
  async getTopServices() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const alerts = await this.getAlerts();
    const serviceCounts = alerts.reduce((acc, alert) => {
      acc[alert.service] = (acc[alert.service] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([service]) => service);
  }

  /**
   * Filtre les alertes selon les critères
   * @private
   * @param {Array} alerts - Liste des alertes
   * @param {Object} filters - Filtres à appliquer
   * @returns {Array} Alertes filtrées
   */
  _filterAlerts(alerts, filters) {
    let filtered = [...alerts];

    if (filters.providers && filters.providers.length > 0) {
      filtered = filtered.filter(alert => 
        filters.providers.includes(alert.provider)
      );
    }

    if (filters.service) {
      filtered = filtered.filter(alert => 
        alert.service === filters.service
      );
    }

    if (filters.severity) {
      filtered = filtered.filter(alert => 
        alert.severity === filters.severity
      );
    }

    if (filters.environment) {
      filtered = filtered.filter(alert => 
        alert.environment === filters.environment
      );
    }

    if (filters.region) {
      filtered = filtered.filter(alert => 
        alert.region === filters.region
      );
    }

    return filtered;
  }
}

// Exporte une instance singleton du service - connexion directe à Wazuh
export const dataService = new DataService();

// Exporte la classe pour permettre la création d'instances personnalisées
export default DataService;
