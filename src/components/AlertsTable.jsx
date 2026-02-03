import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, AlertCircle } from 'lucide-react';

// Composants
import LogDetailsModal from './LogDetailsModal';
import AlertRow from './AlertRow';
import AdvancedSearch from './AdvancedSearch';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 10;

/**
 * Composant AlertsTable - Affiche le tableau des alertes
 * Thème Cyber Security - Violet/Rose
 */
const AlertsTable = ({ 
  alerts, 
  onSearchFiltersChange
}) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filteredAlerts, setFilteredAlerts] = useState(null); // null = pas encore initialisé
  const [currentPage, setCurrentPage] = useState(1);
  const lastFilterSignatureRef = useRef(''); // Track la signature des filtres

  // Alertes à afficher : filtrées si disponibles, sinon toutes les alertes
  const displayAlerts = filteredAlerts !== null ? filteredAlerts : alerts;
  
  // Pagination
  const totalPages = Math.ceil(displayAlerts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAlerts = displayAlerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Callback pour recevoir les résultats filtrés et notifier le parent
  const handleFilteredResults = useCallback((results, hasActiveFilters, filterSignature = '') => {
    setFilteredAlerts(results);
    
    // Reset la page seulement si les critères de filtre ont changé
    if (filterSignature !== lastFilterSignatureRef.current) {
      setCurrentPage(1);
      lastFilterSignatureRef.current = filterSignature;
    }
    
    // Notifier le parent des changements de filtres
    if (onSearchFiltersChange) {
      onSearchFiltersChange(results, hasActiveFilters);
    }
  }, [onSearchFiltersChange]);

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
          <div className="flex items-center gap-2 flex-wrap">
            <AlertCircle size={18} className="text-primary-400" />
            <span className="text-base md:text-lg font-bold text-gradient">Alerts Table</span>
            {displayAlerts.length !== alerts.length ? (
              <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300">
                {displayAlerts.length} / {alerts.length} résultats
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                ({alerts.length} logs)
              </span>
            )}
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
            {paginatedAlerts.length === 0 ? (
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
              paginatedAlerts.map((alert) => (
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
        onNextPage={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        onPreviousPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </div>
  );
};

export default AlertsTable;
