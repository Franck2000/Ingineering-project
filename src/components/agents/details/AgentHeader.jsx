import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../ui/index.jsx';
import { STATUS_CONFIG, getOSIcon } from '../agentUtils';

const AgentHeader = ({ agent, onBack, onRefresh }) => {
  const config = STATUS_CONFIG[agent.status] || STATUS_CONFIG.never_connected;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-primary-300" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getOSIcon(agent.os)}</span>
            <h1 className="text-2xl font-bold text-gradient">{agent.name}</h1>
            <StatusBadge status={agent.status} config={config} />
          </div>
          <p className="text-gray-400 mt-1">ID: {agent.id} • IP: {agent.ip || 'N/A'}</p>
        </div>
      </div>
      <button onClick={onRefresh} className="btn-secondary flex items-center gap-2">
        <RefreshCw size={16} />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export default AgentHeader;
