import { useState, useEffect, useCallback } from 'react';
import { wazuhApi } from '../services/wazuhApi';
import { wazuhIndexer } from '../services/wazuhIndexer';

/**
 * Hook pour récupérer les détails complets d'un agent
 */
export const useAgentDetails = (agentId) => {
  const [agent, setAgent] = useState(null);
  const [syscollector, setSyscollector] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [sca, setSca] = useState([]);
  const [eventData, setEventData] = useState({ timeline: [], total: 0, severityBreakdown: {} });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentDetails = useCallback(async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les données en parallèle
      const [agentData, syscollectorData, vulnsData, scaData, eventsData, alertsData] = await Promise.all([
        wazuhApi.getAgentById(agentId),
        wazuhApi.getAgentSyscollector(agentId),
        wazuhApi.getAgentVulnerabilities(agentId),
        wazuhApi.getAgentSCA(agentId),
        wazuhIndexer.getAgentEventTimeline(agentId, 24),
        wazuhIndexer.getAgentAlerts(agentId, 10)
      ]);

      setAgent(agentData);
      setSyscollector(syscollectorData);
      setVulnerabilities(vulnsData);
      setSca(scaData);
      setEventData(eventsData);
      setRecentAlerts(alertsData);
    } catch (err) {
      console.error('Erreur chargement détails agent:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  return {
    agent,
    syscollector,
    vulnerabilities,
    sca,
    eventData,
    recentAlerts,
    loading,
    error,
    refresh: fetchAgentDetails
  };
};
