/**
 * Configuration centralisée de l'application
 * ============================================
 * Ce fichier contient toutes les constantes et configurations.
 * Les cloud providers sont configurés avec les vrais tags Wazuh
 * pour permettre la corrélation future des logs.
 */

// ============================================
// CONFIGURATION API
// ============================================

export const API_CONFIG = {
  WAZUH_MANAGER: {
    baseUrl: '/api/wazuh',
  },
  WAZUH_INDEXER: {
    baseUrl: '/api/indexer',
    credentials: {
      username: 'admin',
      password: 'mrvLbuuVJV2emWg?8agaz6KeNu6Pa1iJ'
    },
    indices: {
      alerts: 'wazuh-alerts-4.x-*',
    }
  }
};

// ============================================
// CLOUD PROVIDERS - Tags Wazuh pour corrélation
// ============================================

export const CLOUD_PROVIDERS = {
  AWS: {
    name: 'AWS',
    color: '#10B981',
    icon: '△',
    // Tags Wazuh pour identifier les logs AWS
    tags: [
      'aws', 'amazon', 'amazon-error',
      'aws_cloudtrail', 'aws_guardduty', 'aws_vpcflow',
      'aws_waf', 'aws_config', 'aws_security_hub',
      'aws_inspector', 'aws_kms', 'aws_macie',
      'aws_alb', 'aws_trusted_advisor',
      'asl_cloudtrail', 'amazon_security_lake'
    ]
  },
  AZURE: {
    name: 'Azure',
    color: '#3B82F6',
    icon: '▲',
    // Tags Wazuh pour identifier les logs Azure
    tags: [
      'azure',
      'AzureActiveDirectory',
      'AzureActiveDirectoryAccountLogon',
      'AzureActiveDirectoryStsLogon'
    ]
  },
  GCP: {
    name: 'GCP',
    color: '#EF4444',
    icon: '●',
    // Tags Wazuh pour identifier les logs GCP
    tags: ['gcp', 'google', 'gcloud']
  },
  WAZUH: {
    name: 'Wazuh',
    color: '#8B5CF6',
    icon: '◆',
    tags: [] // Défaut si aucun cloud provider détecté
  }
};

// Liste simplifiée pour l'UI
export const CLOUD_PROVIDERS_LIST = Object.values(CLOUD_PROVIDERS)
  .filter(p => p.name !== 'Wazuh')
  .map(({ name, color, icon }) => ({ name, color, icon }));

// ============================================
// SÉVÉRITÉS
// ============================================

export const SEVERITY_CONFIG = {
  Critical: { min: 12, color: '#DC2626' },
  High:     { min: 7,  color: '#F59E0B' },
  Medium:   { min: 4,  color: '#3B82F6' },
  Low:      { min: 0,  color: '#10B981' },
};

// Dérivé de SEVERITY_CONFIG (DRY)
export const SEVERITY_COLORS = Object.fromEntries(
  Object.entries(SEVERITY_CONFIG).map(([key, { color }]) => [key, color])
);

export const STATUS_COLORS = {
  New: '#DC2626',
  Investigating: '#10B981',
  Resolved: '#6B7280'
};

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES_DISPLAY: 5
};

// ============================================
// CACHE
// ============================================

export const CACHE_CONFIG = {
  ALERTS_TTL: 5000,   // 5 secondes - pour temps réel
  STATS_TTL: 10000,   // 10 secondes
};

// ============================================
// POLLING (Rafraîchissement automatique)
// ============================================

export const POLLING_CONFIG = {
  ALERTS_INTERVAL: 5000,  // Rafraîchir les alertes toutes les 5 secondes
  STATS_INTERVAL: 10000,  // Rafraîchir les stats toutes les 10 secondes
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Mappe un niveau de règle Wazuh vers une sévérité
 */
export function mapRuleLevelToSeverity(level) {
  if (!level) return 'Low';
  if (level >= SEVERITY_CONFIG.Critical.min) return 'Critical';
  if (level >= SEVERITY_CONFIG.High.min) return 'High';
  if (level >= SEVERITY_CONFIG.Medium.min) return 'Medium';
  return 'Low';
}

/**
 * Détecte le provider cloud depuis une alerte Wazuh
 * Utilise les tags officiels Wazuh pour la corrélation
 */
export function detectCloudProvider(alert) {
  // Récupérer tous les tags/groupes de l'alerte
  const alertTags = [
    ...(alert.rule?.groups || []),
    alert.decoder?.name || '',
  ].map(t => t.toLowerCase());
  
  // Chercher une correspondance avec les providers
  for (const [key, provider] of Object.entries(CLOUD_PROVIDERS)) {
    if (key === 'WAZUH') continue;
    
    const hasMatch = provider.tags.some(tag => 
      alertTags.some(alertTag => alertTag.includes(tag.toLowerCase()))
    );
    
    if (hasMatch) return provider.name;
  }
  
  return 'Wazuh';
}
