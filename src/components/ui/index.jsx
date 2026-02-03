import React from 'react';

// Card wrapper réutilisable
export const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`card ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-primary-400" />}
        <h3 className="text-sm font-bold text-primary-300 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// Stat item pour afficher une paire label/valeur
export const StatItem = ({ label, value, subValue }) => (
  <div className="flex justify-between items-center py-2 border-b border-primary-500/10 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <div className="text-right">
      <span className="text-gray-200 font-medium">{value || 'N/A'}</span>
      {subValue && <span className="text-gray-500 text-xs ml-2">{subValue}</span>}
    </div>
  </div>
);

// Progress bar pour les métriques
export const ProgressBar = ({ value, max, label, color = 'primary' }) => {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorClasses = {
    primary: 'from-primary-500 to-pink-500',
    green: 'from-green-500 to-emerald-400',
    yellow: 'from-yellow-500 to-orange-400',
    red: 'from-red-500 to-rose-400'
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-200 font-medium">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Badge de sévérité
export const SeverityBadge = ({ severity }) => {
  const colors = {
    Critical: 'bg-red-500/20 text-red-400',
    High: 'bg-orange-500/20 text-orange-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Low: 'bg-blue-500/20 text-blue-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[severity] || colors.Low}`}>
      {severity}
    </span>
  );
};

// Badge de statut
export const StatusBadge = ({ status, config, label }) => {
  // Configuration par défaut basée sur le status
  const defaultConfigs = {
    active: { bg: 'bg-green-500/20', dot: 'bg-green-500', color: 'text-green-400' },
    inactive: { bg: 'bg-gray-500/20', dot: 'bg-gray-500', color: 'text-gray-400' },
    warning: { bg: 'bg-yellow-500/20', dot: 'bg-yellow-500', color: 'text-yellow-400' },
    error: { bg: 'bg-red-500/20', dot: 'bg-red-500', color: 'text-red-400' },
    disconnected: { bg: 'bg-red-500/20', dot: 'bg-red-500', color: 'text-red-400' },
    never_connected: { bg: 'bg-gray-500/20', dot: 'bg-gray-500', color: 'text-gray-400' },
    pending: { bg: 'bg-yellow-500/20', dot: 'bg-yellow-500', color: 'text-yellow-400' }
  };
  
  const cfg = config || defaultConfigs[status] || defaultConfigs.inactive;
  const displayLabel = label || status;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className={`text-sm font-medium ${cfg.color} capitalize`}>{displayLabel}</span>
    </span>
  );
};

// Stat card avec icône
export const StatCard = ({ icon: Icon, value, label, colorClass = 'text-primary-400' }) => (
  <div className="card text-center">
    <Icon className={`w-8 h-8 mx-auto mb-2 ${colorClass}`} />
    <p className="text-2xl font-bold text-gradient">{value}</p>
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);
