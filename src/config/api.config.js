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
  On_Premise: {
    name: 'On Premise',
    color: '#8B5CF6',
    icon: '◆',
    tags: [] // Défaut si aucun cloud provider détecté
  }
};

// Liste pour l'UI (inclut Wazuh)
export const CLOUD_PROVIDERS_LIST = Object.values(CLOUD_PROVIDERS)
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
  ALERTS_INTERVAL: 3000,  // 3 secondes pour le live
  STATS_INTERVAL: 3000,   // 3 secondes pour les stats
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
 * Priorité: 1. agent.labels.source  2. agent.name  3. rule.groups
 */
export function detectCloudProvider(alert) {
  // 1. Vérifier agent.labels.source (prioritaire)
  const labelSource = alert.agent?.labels?.source?.toLowerCase() || '';
  if (labelSource) {
    if (labelSource.includes('aws') || labelSource.includes('amazon')) return 'AWS';
    if (labelSource.includes('azure') || labelSource.includes('microsoft')) return 'Azure';
    if (labelSource.includes('gcp') || labelSource.includes('google')) return 'GCP';
  }
  
  // 2. Vérifier le nom de l'agent
  const agentName = alert.agent?.name?.toLowerCase() || '';
  if (agentName.includes('aws') || agentName.includes('amazon')) return 'AWS';
  if (agentName.includes('azure')) return 'Azure';
  if (agentName.includes('gcp') || agentName.includes('google')) return 'GCP';
  
  // 3. Fallback: vérifier rule.groups
  const alertTags = [
    ...(alert.rule?.groups || []),
    alert.decoder?.name || '',
  ].map(t => t.toLowerCase());
  
  for (const [key, provider] of Object.entries(CLOUD_PROVIDERS)) {
    if (key === 'On_Premise') continue;
    
    const hasMatch = provider.tags.some(tag => 
      alertTags.some(alertTag => alertTag.includes(tag.toLowerCase()))
    );
    
    if (hasMatch) return provider.name;
  }
  
  return 'On Premise';
}

// ============================================
// DÉTECTION DE SERVICE
// ============================================

/**
 * Configuration des services détectables
 * Mapping: identifiants dans les logs -> nom affiché
 */
export const SERVICE_CONFIG = {
  // AWS Services
  cloudtrail: {
    name: 'CloudTrail',
    provider: 'AWS',
    identifiers: ['cloudtrail', 'aws.cloudtrail']
  },
  guardduty: {
    name: 'GuardDuty',
    provider: 'AWS',
    identifiers: ['guardduty', 'aws.guardduty']
  },
  securityhub: {
    name: 'Security Hub',
    provider: 'AWS',
    identifiers: ['securityhub', 'security-hub', 'aws.securityhub']
  },
  config: {
    name: 'AWS Config',
    provider: 'AWS',
    identifiers: ['config.amazonaws.com', 'aws.config']
  },
  vpc: {
    name: 'VPC Flow Logs',
    provider: 'AWS',
    identifiers: ['vpcflowlogs', 'vpc-flow-logs', 'aws.vpcflow']
  },
  s3: {
    name: 'S3',
    provider: 'AWS',
    identifiers: ['s3.amazonaws.com']
  },
  ec2: {
    name: 'EC2',
    provider: 'AWS',
    identifiers: ['ec2.amazonaws.com']
  },
  iam: {
    name: 'IAM',
    provider: 'AWS',
    identifiers: ['iam.amazonaws.com']
  },
  lambda: {
    name: 'Lambda',
    provider: 'AWS',
    identifiers: ['lambda.amazonaws.com']
  },
  rds: {
    name: 'RDS',
    provider: 'AWS',
    identifiers: ['rds.amazonaws.com']
  },
  kms: {
    name: 'KMS',
    provider: 'AWS',
    identifiers: ['kms.amazonaws.com']
  },
  sts: {
    name: 'STS',
    provider: 'AWS',
    identifiers: ['sts.amazonaws.com']
  },
  organizations: {
    name: 'Organizations',
    provider: 'AWS',
    identifiers: ['organizations.amazonaws.com']
  },
  
  // Azure Services
  defender: {
    name: 'Defender',
    provider: 'Azure',
    identifiers: ['defender', 'azure.defender', 'microsoft.security']
  },
  activitylog: {
    name: 'Activity Log',
    provider: 'Azure',
    identifiers: ['activitylog', 'azure.activitylog', 'microsoft.insights']
  },
  entra: {
    name: 'Entra ID',
    provider: 'Azure',
    identifiers: ['entra', 'azure.entra', 'microsoft.aad', 'azuread']
  },
  
  // GCP Services
  auditlogs: {
    name: 'Audit Logs',
    provider: 'GCP',
    identifiers: ['auditlogs', 'gcp.auditlog', 'cloudaudit.googleapis.com']
  },
  scc: {
    name: 'Security Command Center',
    provider: 'GCP',
    identifiers: ['securitycenter', 'scc', 'gcp.scc']
  },
  
  // Wazuh / On-Premise
  syscheck: {
    name: 'File Integrity',
    provider: 'Wazuh',
    identifiers: ['syscheck', 'fim']
  },
  vulnerability: {
    name: 'Vulnerability',
    provider: 'Wazuh',
    identifiers: ['vulnerability-detector', 'vulnerability']
  },
  sca: {
    name: 'SCA',
    provider: 'Wazuh',
    identifiers: ['sca', 'policy_monitoring']
  },
  rootcheck: {
    name: 'Rootcheck',
    provider: 'Wazuh',
    identifiers: ['rootcheck']
  },
  osquery: {
    name: 'Osquery',
    provider: 'Wazuh',
    identifiers: ['osquery']
  },
  authentication: {
    name: 'Authentication',
    provider: 'System',
    identifiers: ['authentication', 'pam', 'sshd', 'login']
  },
  syslog: {
    name: 'Syslog',
    provider: 'System',
    identifiers: ['syslog']
  }
};

/**
 * Détecte le service depuis une alerte Wazuh
 * Analyse: data.aws.source, data.aws.eventSource, rule.groups, decoder.name
 */
export function detectService(alert) {
  const data = alert.data || {};
  const awsData = data.aws || {};
  const azureData = data.azure || {};
  const gcpData = data.gcp || {};
  
  // 1. AWS: vérifier data.aws.source (le plus fiable pour AWS)
  const awsSource = awsData.source?.toLowerCase() || '';
  if (awsSource) {
    for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
      if (service.provider === 'AWS' && service.identifiers.some(id => awsSource.includes(id.toLowerCase()))) {
        return service.name;
      }
    }
  }
  
  // 2. AWS: vérifier data.aws.eventSource (ex: s3.amazonaws.com)
  const eventSource = awsData.eventSource?.toLowerCase() || '';
  if (eventSource) {
    for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
      if (service.identifiers.some(id => eventSource.includes(id.toLowerCase()))) {
        return service.name;
      }
    }
    // Extraire le nom du service de eventSource (ex: s3.amazonaws.com -> S3)
    const match = eventSource.match(/^([a-z0-9-]+)\.amazonaws\.com/);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  
  // 3. Azure: vérifier data.azure
  const azureProvider = azureData.provider?.toLowerCase() || '';
  const azureCategory = azureData.category?.toLowerCase() || '';
  if (azureProvider || azureCategory) {
    for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
      if (service.provider === 'Azure' && 
          service.identifiers.some(id => 
            azureProvider.includes(id.toLowerCase()) || 
            azureCategory.includes(id.toLowerCase())
          )) {
        return service.name;
      }
    }
  }
  
  // 4. GCP: vérifier data.gcp
  const gcpService = gcpData.serviceName?.toLowerCase() || '';
  if (gcpService) {
    for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
      if (service.provider === 'GCP' && 
          service.identifiers.some(id => gcpService.includes(id.toLowerCase()))) {
        return service.name;
      }
    }
  }
  
  // 5. Vérifier rule.groups pour les services Wazuh
  const ruleGroups = (alert.rule?.groups || []).map(g => g.toLowerCase());
  for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
    if (service.identifiers.some(id => ruleGroups.some(g => g.includes(id.toLowerCase())))) {
      return service.name;
    }
  }
  
  // 6. Vérifier decoder.name
  const decoderName = alert.decoder?.name?.toLowerCase() || '';
  if (decoderName) {
    for (const [key, service] of Object.entries(SERVICE_CONFIG)) {
      if (service.identifiers.some(id => decoderName.includes(id.toLowerCase()))) {
        return service.name;
      }
    }
  }
  
  // 7. Fallback: premier groupe de règle ou 'Unknown'
  return alert.rule?.groups?.[0] || 'Unknown';
}
