/**
 * Service de données
 * ============================================
 * Orchestre les appels aux différents services Wazuh.
 * - Alertes : depuis l'indexer (OpenSearch)
 * - Stats agents : depuis l'API Manager
 */
import { wazuhApi } from './wazuhApi';
import { wazuhIndexer } from './wazuhIndexer';
import { wazuhAuth } from './wazuhAuth';
import { CACHE_CONFIG, CLOUD_PROVIDERS } from '../config/api.config';

class DataService {
  constructor() {
    this.cachedAlerts = null;
    this.cacheTimestamp = null;
    this.cacheTimeout = CACHE_CONFIG.ALERTS_TTL;
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
   */
  async getAlerts(filters = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const now = Date.now();
    if (this.cachedAlerts && this.cacheTimestamp && (now - this.cacheTimestamp < this.cacheTimeout)) {
      return this._filterAlerts(this.cachedAlerts, filters);
    }

    try {
      const alerts = await wazuhIndexer.getAlerts({ limit: 500 });
      this.cachedAlerts = alerts;
      this.cacheTimestamp = now;
      return this._filterAlerts(alerts, filters);
    } catch (error) {
      console.error('Erreur récupération alertes:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques
   */
  async getStatistics() {
    if (!wazuhAuth.isAuthenticated()) {
      return this._getEmptyStats();
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
      return this._getEmptyStats();
    }
  }

  _getEmptyStats() {
    return { 
      totalAlerts: 0, criticalAlerts: 0, highAlerts: 0, 
      mediumAlerts: 0, lowAlerts: 0,
      activeAgents: 0, disconnectedAgents: 0, totalAgents: 0 
    };
  }

  /**
   * Récupère les données temporelles par cloud provider
   */
  async getTimeSeriesData() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    try {
      const timeline = await wazuhIndexer.getTimelineByCloudProvider(24);
      
      return timeline.map(bucket => ({
        time: new Date(bucket.time).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        AWS: bucket.AWS || 0,
        Azure: bucket.Azure || 0,
        GCP: bucket.GCP || 0,
        'On Premise': bucket.On_Premise || 0
      }));
    } catch (error) {
      console.error('Erreur timeline:', error);
      // Fallback sur timeline simple
      try {
        const timeline = await wazuhIndexer.getAlertsTimeline(24);
        return timeline.map(bucket => ({
          time: new Date(bucket.key_as_string || bucket.key).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          AWS: 0,
          Azure: 0,
          GCP: 0,
          'On Premise': bucket.doc_count || 0
        }));
      } catch {
        return [];
      }
    }
  }

  /**
   * Récupère la distribution des cloud providers
   * AWS, Azure, GCP, On_Premise (local)
   */
  async getProviderDistribution() {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const providerColors = {
      AWS: '#10B981',     // Vert
      Azure: '#3B82F6',   // Bleu
      GCP: '#EF4444',     // Rouge
      'On Premise': '#8B5CF6',  // Violet
      On_Premise: '#8B5CF6'  // Violet (fallback)
    };

    try {
      const distribution = await wazuhIndexer.getAlertsByCloudProvider();
      
      return Object.entries(distribution)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          color: providerColors[name] || '#6B7280'
        }))
        .sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Erreur distribution providers:', error);
      return [];
    }
  }

  /**
   * Récupère les providers impactés
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
   */
  _filterAlerts(alerts, filters) {
    let filtered = [...alerts];

    if (filters.providers?.length > 0) {
      filtered = filtered.filter(a => filters.providers.includes(a.provider));
    }
    if (filters.service) {
      filtered = filtered.filter(a => a.service === filters.service);
    }
    if (filters.severity) {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }
    if (filters.environment) {
      filtered = filtered.filter(a => a.environment === filters.environment);
    }
    if (filters.region) {
      filtered = filtered.filter(a => a.region === filters.region);
    }
    if (filters.source) {
      filtered = filtered.filter(a => a.environment === filters.source);
    }

    return filtered;
  }
}

export const dataService = new DataService();
export default DataService;
