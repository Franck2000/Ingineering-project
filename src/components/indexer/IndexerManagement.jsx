import React, { useState, useEffect } from 'react';
import { 
  Database, Layers, Settings, Search, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, FileText, Clock, HardDrive
} from 'lucide-react';
import { Card, StatItem, StatusBadge } from '../ui';
import { wazuhIndexer } from '../../services/wazuhIndexer';

// Hook pour récupérer les données de l'indexer
const useIndexerData = () => {
  const [data, setData] = useState({
    health: null,
    indices: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [healthRes, indicesRes] = await Promise.all([
          wazuhIndexer.getHealth(),
          wazuhIndexer.getIndices()
        ]);
        
        setData({
          health: healthRes,
          indices: indicesRes || [],
          stats: null
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

// Formatage de la taille
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Composant Health
const IndexerHealth = ({ health }) => {
  const statusColors = {
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    red: 'text-red-400 bg-red-500/10'
  };

  const clusterName = health?.cluster_name || 'wazuh-cluster';
  const status = health?.status || 'unknown';
  const numberOfNodes = health?.number_of_nodes || 0;
  const activeShards = health?.active_primary_shards || 0;

  return (
    <Card title="Cluster Health" icon={Database}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Cluster</span>
          <span className="text-white font-medium">{clusterName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'text-gray-400 bg-gray-500/10'}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <StatItem label="Nodes" value={numberOfNodes} />
          <StatItem label="Active Shards" value={activeShards} />
          <StatItem label="Relocating" value={health?.relocating_shards || 0} />
          <StatItem label="Unassigned" value={health?.unassigned_shards || 0} />
        </div>
      </div>
    </Card>
  );
};

// Composant Liste des Indices
const IndicesList = ({ indices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredIndices = indices.filter(idx => 
    idx.index?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const wazuhIndices = filteredIndices.filter(idx => 
    idx.index?.startsWith('wazuh-')
  );

  return (
    <Card title="Indices" icon={Layers}>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search indices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-secondary rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Indices Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-700">
                <th className="pb-2 pr-4">Health</th>
                <th className="pb-2 pr-4">Index</th>
                <th className="pb-2 pr-4">Docs</th>
                <th className="pb-2 pr-4">Size</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {wazuhIndices.slice(0, 10).map((idx, i) => (
                <tr key={i} className="border-b border-gray-700/50 hover:bg-surface-secondary/50">
                  <td className="py-3 pr-4">
                    <span className={`w-3 h-3 rounded-full inline-block ${
                      idx.health === 'green' ? 'bg-green-500' :
                      idx.health === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </td>
                  <td className="py-3 pr-4 text-white font-mono text-xs truncate max-w-[200px]">
                    {idx.index}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {parseInt(idx['docs.count'] || 0).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {idx['store.size'] || '0b'}
                  </td>
                  <td className="py-3">
                    <StatusBadge 
                      status={idx.status === 'open' ? 'active' : 'inactive'}
                      label={idx.status || 'unknown'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {wazuhIndices.length > 10 && (
          <p className="text-center text-gray-500 text-sm">
            Showing 10 of {wazuhIndices.length} indices
          </p>
        )}
      </div>
    </Card>
  );
};

// Composant Index Patterns
const IndexPatterns = () => {
  const patterns = [
    { name: 'wazuh-alerts-*', description: 'Wazuh alerts index pattern' },
    { name: 'wazuh-archives-*', description: 'Wazuh archives index pattern' },
    { name: 'wazuh-monitoring-*', description: 'Wazuh monitoring data' },
    { name: 'wazuh-statistics-*', description: 'Wazuh statistics data' }
  ];

  return (
    <Card title="Index Patterns" icon={FileText}>
      <div className="space-y-3">
        {patterns.map((pattern, i) => (
          <div 
            key={i}
            className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg hover:bg-surface-secondary/80 transition-colors"
          >
            <div>
              <p className="text-white font-medium">{pattern.name}</p>
              <p className="text-gray-500 text-sm">{pattern.description}</p>
            </div>
            <Settings size={16} className="text-gray-500" />
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * IndexerManagement - Page de gestion de l'indexer
 */
const IndexerManagement = ({ activePage }) => {
  const { data, loading, error } = useIndexerData();

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
          <p>Error loading indexer data</p>
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
          <Database size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Indexer Management</h1>
          <p className="text-gray-400 text-sm">Wazuh Indexer (OpenSearch) Configuration</p>
        </div>
      </div>

      {/* Content based on active page */}
      {activePage === 'index-patterns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IndexerHealth health={data.health} />
          <IndexPatterns />
        </div>
      )}

      {activePage === 'index-management' && (
        <div className="grid grid-cols-1 gap-6">
          <IndexerHealth health={data.health} />
          <IndicesList indices={data.indices} />
        </div>
      )}
    </div>
  );
};

export { IndexerManagement };
export default IndexerManagement;
