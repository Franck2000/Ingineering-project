/**
 * Configuration centralisée de l'application
 * Toutes les variables d'environnement et constantes sont ici
 */

// URLs des APIs (passent par le proxy Vite en dev)
export const API_CONFIG = {
  // API Wazuh Manager (gestion agents, authentification)
  WAZUH_MANAGER: {
    baseUrl: '/api/wazuh',
    endpoints: {
      authenticate: '/security/user/authenticate',
      agents: '/agents',
      agentsSummary: '/agents/summary/status',
      managerLogs: '/manager/logs',
      managerInfo: '/manager/info',
      syscheck: (agentId) => `/syscheck/${agentId}`,
    }
  },
  
  // API Wazuh Indexer (OpenSearch - stockage des alertes)
  WAZUH_INDEXER: {
    baseUrl: '/api/indexer',
    // En production, utiliser des variables d'environnement
    credentials: {
      username: 'admin',
      password: 'mrvLbuuVJV2emWg?8agaz6KeNu6Pa1iJ'
    },
    indices: {
      alerts: 'wazuh-alerts-4.x-*',
      archives: 'wazuh-archives-4.x-*',
    }
  }
};

// Mapping des niveaux de règles Wazuh vers les sévérités UI
export const SEVERITY_MAPPING = {
  CRITICAL: { min: 12, max: 16, label: 'Critical', color: '#DC2626' },
  HIGH:     { min: 7,  max: 11, label: 'High',     color: '#F59E0B' },
  MEDIUM:   { min: 4,  max: 6,  label: 'Medium',   color: '#3B82F6' },
  LOW:      { min: 0,  max: 3,  label: 'Low',      color: '#10B981' },
};

// Configuration du cache
export const CACHE_CONFIG = {
  ALERTS_TTL: 30000,      // 30 secondes
  STATS_TTL: 60000,       // 1 minute
  AGENTS_TTL: 120000,     // 2 minutes
};

// Providers cloud détectés
export const CLOUD_PROVIDERS = {
  AWS:   { keywords: ['aws', 'amazon', 'cloudtrail', 's3', 'ec2'], color: '#10B981' },
  AZURE: { keywords: ['azure', 'microsoft', 'defender'], color: '#3B82F6' },
  GCP:   { keywords: ['gcp', 'google', 'gcloud'], color: '#EF4444' },
  WAZUH: { keywords: [], color: '#8B5CF6' }, // Défaut
};

/**
 * Mappe un niveau de règle Wazuh vers une sévérité
 */
export function mapRuleLevelToSeverity(level) {
  if (!level) return 'Low';
  if (level >= SEVERITY_MAPPING.CRITICAL.min) return 'Critical';
  if (level >= SEVERITY_MAPPING.HIGH.min) return 'High';
  if (level >= SEVERITY_MAPPING.MEDIUM.min) return 'Medium';
  return 'Low';
}

/**
 * Détecte le provider cloud depuis les données d'une alerte
 */
export function detectCloudProvider(alert) {
  const searchText = [
    ...(alert.rule?.groups || []),
    alert.rule?.description || '',
    alert.decoder?.name || ''
  ].join(' ').toLowerCase();

  for (const [provider, config] of Object.entries(CLOUD_PROVIDERS)) {
    if (provider === 'WAZUH') continue;
    if (config.keywords.some(keyword => searchText.includes(keyword))) {
      return provider;
    }
  }
  return 'Wazuh';
}
