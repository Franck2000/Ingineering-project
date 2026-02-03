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

class DataService {
  /**
   * Invalide le cache (méthode conservée pour compatibilité)
   */
  invalidateCache() {
    // Actuellement le cache n'est pas utilisé car le filtrage par date
    // nécessite toujours des données fraîches
  }

  /**
   * Récupère les alertes depuis l'indexer
   * @param {Object} filters - Filtres à appliquer
   * @param {string} filters.fromDate - Date de début ISO
   * @param {string} filters.toDate - Date de fin ISO
   */
  async getAlerts(filters = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    try {
      // Passer les dates à l'indexer pour filtrer côté serveur
      // Limite raisonnable pour OpenSearch
      const alerts = await wazuhIndexer.getAlerts({ 
        limit: 10000,
        fromDate: filters.fromDate,
        toDate: filters.toDate
      });
      
      // Appliquer les filtres supplémentaires (provider, severity, etc.)
      return this._filterAlerts(alerts, filters);
    } catch (error) {
      console.error('Erreur récupération alertes:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques
   * Si des filtres sidebar sont actifs, calcule à partir des alertes filtrées
   * Sinon, utilise les APIs de comptage efficaces d'OpenSearch
   * @param {Object} options - Options de filtrage combinées
   */
  async getStatistics(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return this._getEmptyStats();
    }

    try {
      // Vérifier si des filtres sidebar sont actifs
      const hasSidebarFilters = (
        (options.providers && options.providers.length > 0) ||
        options.severity ||
        options.service ||
        options.environment ||
        options.region ||
        options.source
      );

      // Stats agents (ne dépendent pas des filtres)
      const agentStats = await wazuhApi.getAgentStats();

      if (hasSidebarFilters) {
        // Si filtres sidebar actifs, calculer à partir des alertes filtrées
        const alerts = await this.getAlerts(options);
        
        const severityStats = alerts.reduce((acc, alert) => {
          const severity = alert.severity || 'Low';
          acc[severity] = (acc[severity] || 0) + 1;
          return acc;
        }, {});

        return {
          totalAlerts: alerts.length,
          criticalAlerts: severityStats.Critical || 0,
          highAlerts: severityStats.High || 0,
          mediumAlerts: severityStats.Medium || 0,
          lowAlerts: severityStats.Low || 0,
          activeAgents: agentStats?.active || 0,
          disconnectedAgents: agentStats?.disconnected || 0,
          totalAgents: agentStats?.total || 0
        };
      }

      // Sinon, utiliser les APIs de comptage efficaces d'OpenSearch
      const [totalCount, severityStats] = await Promise.all([
        wazuhIndexer.getAlertsCount({ fromDate: options.fromDate, toDate: options.toDate }),
        wazuhIndexer.getAlertsBySeverity({ fromDate: options.fromDate, toDate: options.toDate })
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
   * @param {Object} options - Options de filtrage
   * @param {number} options.hours - Nombre d'heures à récupérer (défaut: 24)
   * @param {number} options.minutes - Nombre de minutes pour déterminer l'échelle
   * @param {string} options.fromDate - Date de début ISO
   * @param {string} options.toDate - Date de fin ISO
   * @param {Array} options.providers - Filtrer par providers
   * @param {string} options.severity - Filtrer par sévérité
   */
  async getTimeSeriesData(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const hours = options.hours || 24;
    const minutes = options.minutes || hours * 60;
    
    // Vérifier si des filtres sidebar sont actifs
    const hasSidebarFilters = (
      (options.providers && options.providers.length > 0) ||
      options.severity ||
      options.service ||
      options.environment ||
      options.region ||
      options.source
    );
    
    // Déterminer le format de l'échelle de temps
    const formatTime = (date) => {
      const d = new Date(date);
      if (minutes > 1440) { // Plus de 24h -> afficher jour + heure
        return d.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit'
        }).replace(',', '');
      } else if (minutes > 360) { // Plus de 6h -> afficher heure
        return d.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else { // Moins de 6h -> afficher heure:minute
        return d.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    };

    try {
      // Si des filtres sidebar sont actifs, calculer à partir des alertes filtrées
      if (hasSidebarFilters) {
        const alerts = await this.getAlerts(options);
        return this._buildTimelineFromAlerts(alerts, minutes, formatTime);
      }
      
      // Sinon, utiliser l'agrégation OpenSearch optimisée
      const timeline = await wazuhIndexer.getTimelineByCloudProvider(hours, {
        fromDate: options.fromDate,
        toDate: options.toDate
      });
      
      return timeline.map(bucket => ({
        time: formatTime(bucket.time),
        timestamp: bucket.time,
        AWS: bucket.AWS || 0,
        Azure: bucket.Azure || 0,
        GCP: bucket.GCP || 0,
        'On Premise': bucket.On_Premise || 0
      }));
    } catch (error) {
      console.error('Erreur timeline:', error);
      // Fallback sur timeline simple
      try {
        const timeline = await wazuhIndexer.getAlertsTimeline(hours);
        return timeline.map(bucket => ({
          time: formatTime(bucket.key_as_string || bucket.key),
          timestamp: bucket.key_as_string || bucket.key,
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
   * Construit une timeline à partir d'alertes filtrées
   */
  _buildTimelineFromAlerts(alerts, minutes, formatTime) {
    if (!alerts.length) return [];
    
    // Déterminer l'intervalle de regroupement
    let intervalMs;
    if (minutes > 10080) { // Plus de 7 jours -> intervalle de 1 jour
      intervalMs = 24 * 60 * 60 * 1000;
    } else if (minutes > 2880) { // Plus de 2 jours -> intervalle de 6h
      intervalMs = 6 * 60 * 60 * 1000;
    } else if (minutes > 1440) { // Plus de 24h -> intervalle de 3h
      intervalMs = 3 * 60 * 60 * 1000;
    } else if (minutes > 360) { // Plus de 6h -> intervalle de 1h
      intervalMs = 60 * 60 * 1000;
    } else { // Moins de 6h -> intervalle de 30min
      intervalMs = 30 * 60 * 1000;
    }
    
    // Grouper les alertes par intervalle de temps et provider
    const buckets = {};
    
    alerts.forEach(alert => {
      const timestamp = new Date(alert.timestamp || alert.time).getTime();
      const bucketKey = Math.floor(timestamp / intervalMs) * intervalMs;
      
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          time: new Date(bucketKey).toISOString(),
          AWS: 0,
          Azure: 0,
          GCP: 0,
          'On Premise': 0
        };
      }
      
      const provider = alert.provider || 'On Premise';
      if (provider === 'AWS') buckets[bucketKey].AWS++;
      else if (provider === 'Azure') buckets[bucketKey].Azure++;
      else if (provider === 'GCP') buckets[bucketKey].GCP++;
      else buckets[bucketKey]['On Premise']++;
    });
    
    // Convertir en tableau trié
    return Object.values(buckets)
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .map(bucket => ({
        ...bucket,
        time: formatTime(bucket.time),
        timestamp: bucket.time
      }));
  }

  /**
   * Récupère la distribution des cloud providers
   * AWS, Azure, GCP, On_Premise (local)
   * @param {Object} options - Options de filtrage
   */
  async getProviderDistribution(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const providerColors = {
      AWS: '#10B981',     // Vert
      Azure: '#3B82F6',   // Bleu
      GCP: '#EF4444',     // Rouge
      'On Premise': '#8B5CF6'  // Violet
    };

    try {
      // Récupérer les alertes filtrées par période
      const alerts = await this.getAlerts(options);
      
      // Calculer la distribution à partir des alertes filtrées
      const distribution = {};
      alerts.forEach(alert => {
        const provider = alert.provider || 'On Premise';
        distribution[provider] = (distribution[provider] || 0) + 1;
      });
      
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
   * @param {Object} options - Options de filtrage
   */
  async getImpactedProviders(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const alerts = await this.getAlerts(options);
    return [...new Set(alerts.map(alert => alert.provider).filter(Boolean))];
  }

  /**
   * Récupère les services principaux
   * @param {Object} options - Options de filtrage
   */
  async getTopServices(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    const alerts = await this.getAlerts(options);
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
   * Récupère tous les services disponibles dans les logs
   * @param {Object} options - Options de filtrage (dates)
   */
  async getAvailableServices(options = {}) {
    if (!wazuhAuth.isAuthenticated()) {
      return [];
    }

    try {
      return await wazuhIndexer.getAvailableServices({
        fromDate: options.fromDate,
        toDate: options.toDate
      });
    } catch (error) {
      console.error('Erreur récupération services:', error);
      return [];
    }
  }

  /**
   * Filtre les alertes selon les critères (filtrage client pour les filtres UI)
   * Note: Le filtrage par date est fait côté serveur
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
