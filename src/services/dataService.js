// Service pour gérer les données (Single Responsibility Principle)
// Ce service peut facilement être remplacé par des appels API réels

import mockData from '../data/mockData.json';
import { API_ENDPOINTS } from '../constants';

/**
 * Interface pour le service de données
 * Suit le principe d'inversion de dépendance (Dependency Inversion Principle)
 */
class DataService {
  constructor(useMockData = true) {
    this.useMockData = useMockData;
  }

  /**
   * Récupère les alertes
   * @param {Object} filters - Filtres à appliquer
   * @returns {Promise<Array>} Liste des alertes
   */
  async getAlerts(filters = {}) {
    if (this.useMockData) {
      // Utilise les données mockées
      return this._filterAlerts(mockData.alerts, filters);
    } else {
      // Appel API réel (à implémenter)
      const response = await fetch(API_ENDPOINTS.ALERTS);
      const data = await response.json();
      return this._filterAlerts(data.alerts, filters);
    }
  }

  /**
   * Récupère les statistiques
   * @returns {Promise<Object>} Statistiques
   */
  async getStatistics() {
    if (this.useMockData) {
      return mockData.statistics;
    } else {
      const response = await fetch(API_ENDPOINTS.STATISTICS);
      const data = await response.json();
      return data.statistics;
    }
  }

  /**
   * Récupère les données temporelles
   * @returns {Promise<Array>} Données temporelles
   */
  async getTimeSeriesData() {
    if (this.useMockData) {
      return mockData.timeSeriesData;
    } else {
      const response = await fetch(API_ENDPOINTS.TIME_SERIES);
      const data = await response.json();
      return data.timeSeriesData;
    }
  }

  /**
   * Récupère la distribution des providers
   * @returns {Promise<Array>} Distribution des providers
   */
  async getProviderDistribution() {
    if (this.useMockData) {
      return mockData.providerDistribution;
    } else {
      const response = await fetch(API_ENDPOINTS.PROVIDER_DISTRIBUTION);
      const data = await response.json();
      return data.providerDistribution;
    }
  }

  /**
   * Récupère les providers impactés
   * @returns {Promise<Array>} Liste des providers impactés
   */
  async getImpactedProviders() {
    if (this.useMockData) {
      return mockData.impactedProviders;
    } else {
      const alerts = await this.getAlerts();
      return [...new Set(alerts.map(alert => alert.provider))];
    }
  }

  /**
   * Récupère les services principaux
   * @returns {Promise<Array>} Liste des services principaux
   */
  async getTopServices() {
    if (this.useMockData) {
      return mockData.topServices;
    } else {
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

// Exporte une instance singleton du service
export const dataService = new DataService(true); // true = utilise les données mockées

// Exporte la classe pour permettre la création d'instances personnalisées
export default DataService;
