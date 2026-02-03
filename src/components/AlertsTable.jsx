import React, { useState, useMemo, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';

// Composants
import LogDetailsModal from './LogDetailsModal';
import AlertRow from './AlertRow';
import AdvancedSearch from './AdvancedSearch';
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
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  // Callback pour recevoir les résultats filtrés
  const handleFilteredResults = useCallback((results) => {
    setFilteredAlerts(results);
  }, []);

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
    <div className="card overflow-hidden">
      {/* Modal détails */}
      {selectedAlert && (
        <LogDetailsModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-primary-400" />
            <span className="text-base md:text-lg font-bold text-gradient">Alerts Table</span>
            <span className="text-xs text-gray-500">
              ({filteredAlerts.length})
            </span>
          </div>
          
          {/* Indicateurs décoratifs - hidden on mobile */}
          <div className="hidden sm:flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(168, 85, 247, 0.4)'}} />
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(236, 72, 153, 0.4)'}} />
            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'rgba(139, 92, 246, 0.4)'}} />
          </div>
        </div>
        
        {/* Recherche avancée */}
        <AdvancedSearch 
          alerts={alerts}
          onFilteredResults={handleFilteredResults}
          placeholder="Rechercher (ex: agent.name:server)"
        />
      </div>

      {/* Table avec scroll horizontal sur mobile */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[700px] md:min-w-0 px-4 md:px-0">
        <table className="w-full">
          <thead className="bg-surface-tertiary/50">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key}
                  className={`px-2 md:px-3.5 py-2.5 md:py-3.5 text-xs md:text-sm font-bold text-primary-200 border-b border-primary-500/30 ${col.center ? 'text-center' : 'text-left'}`}
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
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-primary-500/40" />
                    <span>Aucun résultat trouvé</span>
                    <span className="text-xs text-gray-500">Modifiez vos filtres ou votre recherche</span>
                  </div>
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
