import React, { useState, useEffect } from 'react';
import { 
  Server, Activity, Settings, FileText, Network, BarChart2,
  CheckCircle, XCircle, AlertTriangle, Clock, HardDrive, Cpu, Database
} from 'lucide-react';
import { Card, StatItem, ProgressBar, StatusBadge } from '../ui';
import { wazuhApi } from '../../services/wazuhApi';

// Hook pour récupérer les données du serveur
const useServerData = () => {
  const [data, setData] = useState({
    status: null,
    info: null,
    stats: null,
    logs: [],
    cluster: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statusRes, infoRes] = await Promise.all([
          wazuhApi.getStatus(),
          wazuhApi.getInfo()
        ]);
        
        setData({
          status: statusRes?.data?.data,
          info: infoRes?.data?.data,
          stats: null,
          logs: [],
          cluster: null
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { data, loading, error };
};

// Composant Status
const ServerStatus = ({ status, info }) => {
  if (!status && !info) return null;
  
  const daemons = status ? Object.entries(status) : [];
  const runningCount = daemons.filter(([_, state]) => state === 'running').length;
  
  return (
    <Card title="Server Status" icon={Activity}>
      <div className="space-y-4">
        {/* Version et uptime */}
        {info && (
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-700">
            <StatItem label="Version" value={info.version || 'N/A'} />
            <StatItem label="Type" value={info.type || 'manager'} />
            <StatItem label="Compilation Date" value={info.compilation_date || 'N/A'} />
            <StatItem label="Path" value={info.path || '/var/ossec'} />
          </div>
        )}
        
        {/* Daemons */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Daemons ({runningCount}/{daemons.length})</span>
            <StatusBadge 
              status={runningCount === daemons.length ? 'active' : 'warning'}
              label={runningCount === daemons.length ? 'All running' : 'Partial'}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {daemons.map(([name, state]) => (
              <div 
                key={name}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${state === 'running' 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-red-500/10 text-red-400'
                  }
                `}
              >
                {state === 'running' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Composant Statistiques
const ServerStats = () => {
  return (
    <Card title="Statistics" icon={BarChart2}>
      <div className="text-center py-8 text-gray-500">
        <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
        <p>Server statistics coming soon</p>
        <p className="text-xs mt-2">Events/sec, Queue size, etc.</p>
      </div>
    </Card>
  );
};

// Composant Logs
const ServerLogs = () => {
  return (
    <Card title="Server Logs" icon={FileText}>
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p>Server logs viewer coming soon</p>
        <p className="text-xs mt-2">ossec.log, cluster.log, etc.</p>
      </div>
    </Card>
  );
};

// Composant Cluster
const ClusterInfo = () => {
  return (
    <Card title="Cluster" icon={Network}>
      <div className="text-center py-8 text-gray-500">
        <Network size={48} className="mx-auto mb-4 opacity-50" />
        <p>Cluster management coming soon</p>
        <p className="text-xs mt-2">Nodes, synchronization status</p>
      </div>
    </Card>
  );
};

// Composant Settings
const ServerSettings = () => {
  return (
    <Card title="Settings" icon={Settings}>
      <div className="text-center py-8 text-gray-500">
        <Settings size={48} className="mx-auto mb-4 opacity-50" />
        <p>Server configuration coming soon</p>
        <p className="text-xs mt-2">ossec.conf editor</p>
      </div>
    </Card>
  );
};

/**
 * ServerManagement - Page de gestion du serveur Wazuh
 */
const ServerManagement = ({ activePage }) => {
  const { data, loading, error } = useServerData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-red-400">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p>Error loading server data</p>
          <p className="text-xs mt-2">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
          <Server size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Server Management</h1>
          <p className="text-gray-400 text-sm">Wazuh Manager Status & Configuration</p>
        </div>
      </div>

      {/* Content based on active page */}
      {activePage === 'server-status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServerStatus status={data.status} info={data.info} />
          <ServerStats />
        </div>
      )}

      {activePage === 'server-settings' && (
        <ServerSettings />
      )}

      {activePage === 'server-logs' && (
        <ServerLogs />
      )}

      {activePage === 'cluster' && (
        <ClusterInfo />
      )}

      {activePage === 'statistics' && (
        <ServerStats />
      )}
    </div>
  );
};

export { ServerManagement };
export default ServerManagement;
