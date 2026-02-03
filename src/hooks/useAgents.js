import { useState, useEffect, useMemo, useCallback } from 'react';
import { wazuhApi } from '../services/wazuhApi';

/**
 * Hook personnalisé pour la gestion des agents Wazuh
 * Gère le chargement, le filtrage et la pagination
 */
export const useAgents = (initialQuery = 'status=active') => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wazuhApi.getAgents();
      setAgents(data);
    } catch (err) {
      console.error('Erreur chargement agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const statusCount = { active: 0, disconnected: 0, pending: 0, never_connected: 0 };
    const osCount = {};
    const groupCount = {};

    agents.forEach(agent => {
      const status = agent.status || 'never_connected';
      statusCount[status] = (statusCount[status] || 0) + 1;

      const os = agent.os?.platform || agent.os?.name || 'Unknown';
      osCount[os] = (osCount[os] || 0) + 1;

      agent.group?.forEach(g => {
        groupCount[g] = (groupCount[g] || 0) + 1;
      });
    });

    return { statusCount, osCount, groupCount };
  }, [agents]);

  // Filtrage des agents
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;

    const query = searchQuery.toLowerCase();

    if (query.includes('=')) {
      const [field, value] = query.split('=');
      return agents.filter(agent => {
        switch (field) {
          case 'status':
            return agent.status?.toLowerCase() === value;
          case 'os':
            return agent.os?.platform?.toLowerCase().includes(value) ||
                   agent.os?.name?.toLowerCase().includes(value);
          case 'group':
            return agent.group?.some(g => g.toLowerCase().includes(value));
          default:
            return true;
        }
      });
    }

    return agents.filter(agent =>
      agent.name?.toLowerCase().includes(query) ||
      agent.ip?.toLowerCase().includes(query) ||
      agent.id?.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / rowsPerPage);
  const paginatedAgents = useMemo(() => 
    filteredAgents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredAgents, currentPage, rowsPerPage]
  );

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  }, []);

  return {
    agents: paginatedAgents,
    totalAgents: filteredAgents.length,
    stats,
    loading,
    error,
    searchQuery,
    currentPage,
    rowsPerPage,
    totalPages,
    refresh: fetchAgents,
    onSearch: handleSearch,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };
};
