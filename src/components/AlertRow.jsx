import React from 'react';
import { Eye } from 'lucide-react';
import { SEVERITY_COLORS, STATUS_COLORS, CLOUD_PROVIDERS } from '../constants';

/**
 * Trouve l'icône du provider
 */
const getProviderIcon = (providerName) => {
  const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
  return provider ? provider.icon : '●';
};

/**
 * Trouve la couleur du provider
 */
const getProviderColor = (providerName) => {
  const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
  return provider ? provider.color : '#8b5cf6';
};

/**
 * Composant AlertRow - Une ligne du tableau des alertes
 */
const AlertRow = ({ alert, onSelect }) => {
  return (
    <tr
      className="hover:bg-primary-500/10 transition-colors border-b border-primary-500/10 cursor-pointer"
      onClick={() => onSelect(alert)}
    >
      <td className="px-3.5 py-4 text-sm text-gray-300">
        {alert.time}
      </td>
      <td className="px-3.5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className="text-xl"
            style={{ color: getProviderColor(alert.provider) }}
          >
            {getProviderIcon(alert.provider)}
          </span>
          <span className="text-sm text-gray-200 font-medium">
            {alert.provider}
          </span>
        </div>
      </td>
      <td className="px-3.5 py-4 text-sm text-gray-300">
        {alert.service}
      </td>
      <td className="px-3.5 py-4">
        <span
          className="inline-block px-3.5 py-1.5 rounded-md text-xs font-bold"
          style={{ 
            backgroundColor: `${SEVERITY_COLORS[alert.severity]}20`,
            color: SEVERITY_COLORS[alert.severity],
            border: `1px solid ${SEVERITY_COLORS[alert.severity]}40`
          }}
        >
          {alert.severity}
        </span>
      </td>
      <td className="px-3.5 py-4 text-sm text-gray-300 max-w-xs truncate">
        {alert.description || alert.message}
      </td>
      <td className="px-3.5 py-4">
        <span
          className="inline-block px-3.5 py-1.5 rounded-md text-xs font-bold"
          style={{ 
            backgroundColor: `${STATUS_COLORS[alert.status]}20`,
            color: STATUS_COLORS[alert.status],
            border: `1px solid ${STATUS_COLORS[alert.status]}40`
          }}
        >
          {alert.status}
        </span>
      </td>
      <td className="px-3.5 py-4 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(alert);
          }}
          className="p-2 rounded-lg hover:bg-primary-500/20 text-gray-400 hover:text-primary-300 transition-all"
          title="Voir les détails"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

export default AlertRow;
