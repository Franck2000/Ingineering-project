import React from 'react';
import { FileText, AlertCircle, Info } from 'lucide-react';
import { Card, SeverityBadge } from '../../ui/index.jsx';
import { formatDate } from '../../../utils/formatters';

const RecentAlertsCard = ({ alerts }) => {
  if (!alerts?.length) {
    return (
      <Card title="Dernières Alertes" icon={FileText}>
        <p className="text-gray-500 text-center py-4">Aucune alerte récente</p>
      </Card>
    );
  }

  return (
    <Card title="Dernières Alertes" icon={FileText}>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {alerts.map((alert, i) => (
          <div 
            key={alert.id || i} 
            className="p-3 bg-surface-secondary/50 rounded-lg border border-primary-500/10 hover:border-primary-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-gray-500">{alert.ruleId}</span>
                </div>
                <p className="text-sm text-gray-200 truncate">{alert.description}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
              </div>
              {alert.severity === 'Critical' || alert.severity === 'High' ? (
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              ) : (
                <Info size={16} className="text-gray-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentAlertsCard;
