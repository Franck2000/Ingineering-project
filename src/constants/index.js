/**
 * Constantes UI
 * ============================================
 * Ce fichier contient les constantes utilisées par les composants UI.
 * Pour les configurations API et cloud providers, voir config/api.config.js
 */

// Re-export depuis api.config pour centraliser
export { 
  CLOUD_PROVIDERS_LIST as CLOUD_PROVIDERS,
  SEVERITY_COLORS,
  STATUS_COLORS,
  PAGINATION
} from '../config/api.config';

// Filtres rapides pour le dashboard
export const QUICK_FILTERS = [
  { name: 'AWS', icon: '△', color: '#10B981' },
  { name: 'Critical', icon: '⬢', color: '#F59E0B' },
  { name: 'Fixme', icon: '�', color: '#EF4444' }
];

// Services cloud surveillés
export const SERVICES = [
  'CloudTrail',
  'Defender',
  'Audit Logs',
  'Activity Logs',
  'Security Hub'
];

// Niveaux de sévérité pour les filtres
export const SEVERITIES = [
  { value: '', label: 'Tous' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

// Environnements disponibles
export const ENVIRONMENTS = [
  { value: '', label: 'Tous' },
  { value: 'Production', label: 'Production' },
  { value: 'Preprod', label: 'Preprod' },
  { value: 'Dev', label: 'Dev' }
];

// Régions cloud
export const REGIONS = [
  'us-east-1',
  'eu-west-1',
  'ap-south-1',
  'us-west-2'
];

// Sources des logs (agents Wazuh) - Liste par défaut, sera complétée dynamiquement
export const SOURCES = [
  { value: '', label: 'Toutes les sources' }
];
