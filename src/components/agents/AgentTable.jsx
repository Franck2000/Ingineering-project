import React from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';
import { STATUS_CONFIG, getOSIcon } from './agentUtils';

// Badge de statut
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.never_connected;
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`text-sm font-medium ${config.color}`}>{status}</span>
    </div>
  );
};

// Badge de groupe
const GroupBadge = ({ name }) => (
  <span className="px-2 py-0.5 bg-surface-tertiary border border-primary-500/20 rounded text-xs text-gray-300 mr-1">
    {name}
  </span>
);

// Ligne d'un agent
const AgentRow = ({ agent }) => (
  <tr className="border-b border-primary-500/10 hover:bg-primary-500/5 transition-colors">
    <td className="py-3 px-4">
      <input type="checkbox" className="rounded border-primary-500/30 bg-surface-secondary" />
    </td>
    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{agent.id}</td>
    <td className="py-3 px-4 text-sm text-gray-200 font-medium">{agent.name}</td>
    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{agent.ip || 'N/A'}</td>
    <td className="py-3 px-4">
      {agent.group?.map((g, i) => <GroupBadge key={i} name={g} />) || <span className="text-gray-500">-</span>}
    </td>
    <td className="py-3 px-4 text-sm text-gray-300">
      <span className="mr-2">{getOSIcon(agent.os)}</span>
      {agent.os?.name || agent.os?.platform || 'Unknown'} {agent.os?.version || ''}
    </td>
    <td className="py-3 px-4 text-sm text-gray-300">{agent.node_name || 'N/A'}</td>
    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{agent.version || 'N/A'}</td>
    <td className="py-3 px-4"><StatusBadge status={agent.status} /></td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <button className="p-1.5 hover:bg-primary-500/20 rounded transition-colors">
          <Eye size={16} className="text-gray-400 hover:text-primary-300" />
        </button>
        <button className="p-1.5 hover:bg-primary-500/20 rounded transition-colors">
          <MoreHorizontal size={16} className="text-gray-400 hover:text-primary-300" />
        </button>
      </div>
    </td>
  </tr>
);

// En-têtes du tableau
const TABLE_HEADERS = ['', 'ID ↑', 'Name', 'IP address', 'Group(s)', 'Operating system', 'Cluster node', 'Version', 'Status', 'Actions'];

const AgentTable = ({ agents }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-primary-500/20">
          {TABLE_HEADERS.map((header, i) => (
            <th key={i} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {i === 0 ? <input type="checkbox" className="rounded border-primary-500/30 bg-surface-secondary" /> : header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {agents.map(agent => <AgentRow key={agent.id} agent={agent} />)}
      </tbody>
    </table>
  </div>
);

export default AgentTable;
