import React, { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';

// Composants
import LogDetailsModal from './LogDetailsModal';
import AlertRow from './AlertRow';
import SearchBar from './SearchBar';
import Pagination from './Pagination';

/**
 * Composant AlertsTable - Affiche le tableau des alertes
 * Thème Cyber Security - Violet/Rose
 */
const AlertsTable = ({ 
  alerts, 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPreviousPage, 
  hasNextPage, 
  hasPreviousPage 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

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

  // Colonnes du tableau
  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'provider', label: 'Provider' },
    { key: 'service', label: 'Service' },
    { key: 'severity', label: 'Severity' },
    { key: 'message', label: 'Alert Message' },
    { key: 'status', label: 'Status' },
    { key: 'details', label: 'Détails', center: true }
  ];

  return (
    <div className="card">
      {/* Modal détails */}
      {selectedAlert && (
        <LogDetailsModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-primary-400" />
          <span className="text-lg font-bold text-gradient">Alerts Table</span>
          <span className="text-xs text-gray-500 ml-2">
            (Cliquez sur une ligne pour voir les détails)
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredAlerts.length}
            placeholder="Rechercher dans les logs..."
          />
          
          {/* Indicateurs décoratifs */}
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(168, 85, 247, 0.4)'}} />
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(236, 72, 153, 0.4)'}} />
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(139, 92, 246, 0.4)'}} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-tertiary/50">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key}
                  className={`px-3.5 py-3.5 text-sm font-bold text-primary-200 border-b border-primary-500/30 ${col.center ? 'text-center' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3.5 py-8 text-center text-gray-400">
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
                <AlertRow 
                  key={alert.id} 
                  alert={alert} 
                  onSelect={setSelectedAlert}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </div>
  );
};

export default AlertsTable;
