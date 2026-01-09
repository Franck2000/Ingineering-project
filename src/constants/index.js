// Application constants following SOLID principles (Open/Closed Principle)

export const CLOUD_PROVIDERS = [
  { name: 'AWS', color: '#10B981', icon: '△' },
  { name: 'Azure', color: '#3B82F6', icon: '▲' },
  { name: 'GCP', color: '#EF4444', icon: '●' }
];

export const QUICK_FILTERS = [
  { name: 'AWS', icon: '△', color: '#10B981' },
  { name: 'Critical', icon: '⬢', color: '#F59E0B' },
  { name: 'Fixme', icon: '🔥', color: '#EF4444' }
];

export const SERVICES = [
  'CloudTrail',
  'Defender',
  'Audit Logs',
  'Activity Logs',
  'Security Hub'
];

export const SEVERITIES = [
  { value: '', label: '●' },
  { value: 'Preprod', label: 'Preprod' },
  { value: 'Dev', label: 'Dev' }
];

export const REGIONS = [
  'ID (Returned)',
  'us-east-1',
  'eu-west-1',
  'ap-south-1',
  'us-west-2'
];

export const SEVERITY_COLORS = {
  Critical: '#DC2626',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#10B981',
  Resolved: '#3B82F6'
};

export const STATUS_COLORS = {
  New: '#DC2626',
  Investigating: '#10B981',
  Resolved: '#6B7280'
};

export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES_DISPLAY: 5
};

export const API_ENDPOINTS = {
  // Ces endpoints seront utilisés quand vous aurez l'API Wazuh prête
  ALERTS: '/api/wazuh/alerts',
  STATISTICS: '/api/wazuh/statistics',
  TIME_SERIES: '/api/wazuh/time-series',
  PROVIDER_DISTRIBUTION: '/api/wazuh/provider-distribution'
};
