import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAgentDetails } from '../../hooks/useAgentDetails';

// Composants
import AgentHeader from './details/AgentHeader';
import AgentQuickStats from './details/AgentQuickStats';
import { SystemCard, HardwareCard, ConnectionCard, NetworkCard, PortsCard, ProcessesCard } from './details/InfoCards';
import { VulnerabilitiesTable, PackagesTable } from './details/DataTables';
import EventTimelineChart from './details/EventTimelineChart';
import SCACard from './details/SCACard';
import VulnerabilitySummary from './details/VulnerabilitySummary';
import RecentAlertsCard from './details/RecentAlertsCard';

/**
 * Composant AgentDetails - Page de détails d'un agent
 * Composition de sous-composants spécialisés (SRP)
 */
const AgentDetails = ({ agentId, onBack }) => {
  const { 
    agent, 
    syscollector, 
    vulnerabilities, 
    sca, 
    eventData, 
    recentAlerts,
    loading, 
    error, 
    refresh 
  } = useAgentDetails(agentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
        <span className="ml-3 text-primary-300">Chargement des détails...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400 mb-4">Erreur: {error}</p>
        <button onClick={refresh} className="btn-primary">Réessayer</button>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Agent non trouvé</p>
        <button onClick={onBack} className="btn-secondary mt-4">Retour</button>
      </div>
    );
  }

  const { hardware, os, netiface, packages, processes, ports } = syscollector || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <AgentHeader agent={agent} onBack={onBack} onRefresh={refresh} />
      
      {/* Stats rapides */}
      <AgentQuickStats 
        hardware={hardware} 
        packagesCount={packages?.length || 0} 
        vulnerabilitiesCount={vulnerabilities.length} 
      />

      {/* Section sécurité : Événements + Vulnérabilités */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EventTimelineChart 
          data={eventData.timeline} 
          total={eventData.total} 
          severityBreakdown={eventData.severityBreakdown} 
        />
        <VulnerabilitySummary vulnerabilities={vulnerabilities} />
      </div>

      {/* Section compliance : SCA + Alertes récentes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SCACard scaData={sca} />
        <RecentAlertsCard alerts={recentAlerts} />
      </div>

      {/* Section système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SystemCard agent={agent} os={os} />
        <HardwareCard hardware={hardware} />
        <ConnectionCard agent={agent} />
        <NetworkCard interfaces={netiface} />
        <PortsCard ports={ports} />
        <ProcessesCard processes={processes} />
      </div>

      {/* Tableaux détaillés */}
      <VulnerabilitiesTable vulnerabilities={vulnerabilities} />
      <PackagesTable packages={packages} />
    </div>
  );
};

export default AgentDetails;
