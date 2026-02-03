import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X, AlertCircle } from 'lucide-react';
import { SEVERITY_COLORS, STATUS_COLORS, CLOUD_PROVIDERS } from '../constants';

/**
 * Composant AlertsTable - Affiche le tableau des alertes
 * Thème Cyber Security - Violet/Rose
 */
const AlertsTable = ({ alerts, currentPage, totalPages, onNextPage, onPreviousPage, hasNextPage, hasPreviousPage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les alertes selon la recherche
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    
    const query = searchQuery.toLowerCase();
    return alerts.filter(alert => 
      alert.message?.toLowerCase().includes(query) ||
      alert.description?.toLowerCase().includes(query) ||
      alert.provider?.toLowerCase().includes(query) ||
      alert.service?.toLowerCase().includes(query) ||
      alert.severity?.toLowerCase().includes(query) ||
      alert.status?.toLowerCase().includes(query) ||
      alert.environment?.toLowerCase().includes(query) ||
      alert.time?.toLowerCase().includes(query)
    );
  }, [alerts, searchQuery]);

  // Trouve l'icône du provider
  const getProviderIcon = (providerName) => {
    const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
    return provider ? provider.icon : '●';
  };

  // Trouve la couleur du provider
  const getProviderColor = (providerName) => {
    const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
    return provider ? provider.color : '#8b5cf6';
  };

  return (
    <div className="card">
      {/* Header avec barre de recherche */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-primary-400" />
          <span className="text-lg font-bold text-gradient">Alerts Table</span>
        </div>
        
        {/* Barre de recherche */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les logs..."
              className="w-80 pl-10 pr-10 py-2 bg-surface-secondary/60 border border-primary-500/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 backdrop-blur-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Compteur de résultats */}
          {searchQuery && (
            <span className="text-sm text-gray-400">
              {filteredAlerts.length} résultat{filteredAlerts.length !== 1 ? 's' : ''}
            </span>
          )}
          
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full cursor-pointer" style={{backgroundColor: 'rgba(168, 85, 247, 0.4)'}}></div>
            <div className="w-2.5 h-2.5 rounded-full cursor-pointer" style={{backgroundColor: 'rgba(236, 72, 153, 0.4)'}}></div>
            <div className="w-2.5 h-2.5 rounded-full cursor-pointer" style={{backgroundColor: 'rgba(139, 92, 246, 0.4)'}}></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-tertiary/50">
            <tr>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Time
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Provider
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Service
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Severity
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Alert Message
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-primary-200 border-b border-primary-500/30">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3.5 py-8 text-center text-gray-400">
                  {searchQuery ? (
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} className="text-primary-500/40" />
                      <span>Aucun résultat pour "{searchQuery}"</span>
                    </div>
                  ) : (
                    'Aucune alerte à afficher'
                  )}
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-primary-500/10 transition-colors border-b border-primary-500/10"
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
                  <td className="px-3.5 py-4 text-sm text-gray-300">
                    {alert.message}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-primary-500/20">
        <div className="flex gap-2 items-center">
          <button
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className="w-9 h-9 flex items-center justify-center bg-surface-secondary/60 border border-primary-500/30 rounded-md text-gray-200 hover:bg-surface-tertiary hover:border-primary-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm text-gray-400 font-medium">
            Page <span className="text-primary-300">{currentPage}</span> of <span className="text-primary-300">{totalPages}</span>
          </div>
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="w-9 h-9 flex items-center justify-center bg-surface-secondary/60 border border-primary-500/30 rounded-md text-gray-200 hover:bg-surface-tertiary hover:border-primary-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsTable;
