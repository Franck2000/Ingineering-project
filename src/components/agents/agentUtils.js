// Couleurs pour les graphiques des agents
export const STATUS_COLORS = {
  active: '#10B981',
  disconnected: '#EF4444',
  pending: '#F59E0B',
  never_connected: '#6B7280'
};

export const OS_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];
export const GROUP_COLORS = ['#6366F1', '#EC4899', '#10B981', '#8B5CF6', '#F59E0B'];

// Configuration des statuts pour les badges
export const STATUS_CONFIG = {
  active: { color: 'text-green-400', bg: 'bg-green-500/20', dot: 'bg-green-500' },
  disconnected: { color: 'text-red-400', bg: 'bg-red-500/20', dot: 'bg-red-500' },
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', dot: 'bg-yellow-500' },
  never_connected: { color: 'text-gray-400', bg: 'bg-gray-500/20', dot: 'bg-gray-500' }
};

/**
 * Transforme les stats brutes en données pour les graphiques donut
 */
export const formatChartData = (stats) => {
  const statusData = [
    { name: 'Active', value: stats.statusCount.active, color: STATUS_COLORS.active },
    { name: 'Disconnected', value: stats.statusCount.disconnected, color: STATUS_COLORS.disconnected },
    { name: 'Pending', value: stats.statusCount.pending, color: STATUS_COLORS.pending },
    { name: 'Never connected', value: stats.statusCount.never_connected, color: STATUS_COLORS.never_connected }
  ].filter(d => d.value > 0);

  const osData = Object.entries(stats.osCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, color: OS_COLORS[i % OS_COLORS.length] }));

  const groupData = Object.entries(stats.groupCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, color: GROUP_COLORS[i % GROUP_COLORS.length] }));

  return { statusData, osData, groupData };
};

/**
 * Retourne l'icône OS appropriée
 */
export const getOSIcon = (os) => {
  const platform = os?.platform?.toLowerCase() || '';
  const name = os?.name?.toLowerCase() || '';

  if (platform.includes('ubuntu') || name.includes('ubuntu')) return '🐧';
  if (platform.includes('debian') || name.includes('debian')) return '🐧';
  if (platform.includes('centos') || name.includes('centos')) return '🐧';
  if (platform.includes('windows') || name.includes('windows')) return '🪟';
  if (platform.includes('darwin') || name.includes('mac')) return '🍎';
  return '🖥️';
};
