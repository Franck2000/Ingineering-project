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
  PAGINATION,
  SERVICE_CONFIG
} from '../config/api.config';

// Filtres rapides pour le dashboard
export const QUICK_FILTERS = [
  { name: 'AWS', icon: '△', color: '#10B981' },
  { name: 'Critical', icon: '⬢', color: '#F59E0B' },
  { name: 'Fixme', icon: '◆', color: '#EF4444' }
];

// Services cloud surveillés - générés depuis SERVICE_CONFIG
import { SERVICE_CONFIG } from '../config/api.config';
export const SERVICES = [...new Set(Object.values(SERVICE_CONFIG).map(s => s.name))].sort();

// Niveaux de sévérité pour les filtres
export const SEVERITIES = [
  { value: '', label: 'Tous' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

// Régions cloud
export const REGIONS = [
  'us-east-1',
  'eu-west-1',
  'ap-south-1',
  'us-west-2'
];
