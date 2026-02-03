import React, { useMemo } from 'react';
import { RefreshCw, Download, Server } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { formatChartData } from './agentUtils';
import DonutChart from './DonutChart';
import AgentTable from './AgentTable';
import TablePagination from './TablePagination';
import SearchBar from './SearchBar';

/**
 * Composant AgentMonitoring
 * Affiche les statistiques et la liste des agents Wazuh
 */
const AgentMonitoring = () => {
  const {
    agents,
    totalAgents,
    stats,
    loading,
    error,
    searchQuery,
    currentPage,
    rowsPerPage,
    totalPages,
    refresh,
    onSearch,
    onPageChange,
    onRowsPerPageChange,
  } = useAgents();

  // Données formatées pour les graphiques
  const chartData = useMemo(() => formatChartData(stats), [stats]);

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
        <span className="ml-3 text-primary-300">Chargement des agents...</span>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400 mb-4">Erreur: {error}</p>
        <button onClick={refresh} className="btn-primary">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Graphiques donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DonutChart data={chartData.statusData} title="AGENTS BY STATUS" />
        <DonutChart data={chartData.osData} title="TOP 5 OS" />
        <DonutChart data={chartData.groupData} title="TOP 5 GROUPS" />
      </div>

      {/* Section tableau */}
      <div className="card">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-gradient">Agents ({totalAgents})</h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={refresh} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Recherche */}
        <SearchBar
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search agents (e.g., status=active, os=ubuntu)"
        />

        {/* Tableau */}
        <AgentTable agents={agents} />

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  );
};

export default AgentMonitoring;
