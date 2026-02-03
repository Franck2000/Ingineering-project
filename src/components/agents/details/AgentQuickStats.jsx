import React from 'react';
import { Cpu, MemoryStick, Package, Shield } from 'lucide-react';
import { StatCard } from '../../ui/index.jsx';
import { formatBytes } from '../../../utils/formatters';

const AgentQuickStats = ({ hardware, packagesCount, vulnerabilitiesCount }) => {
  const ramTotal = hardware?.ram?.total || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={Cpu} 
        value={hardware?.cpu?.cores || 'N/A'} 
        label="CPU Cores" 
      />
      <StatCard 
        icon={MemoryStick} 
        value={formatBytes(ramTotal)} 
        label="Total RAM" 
        colorClass="text-pink-400" 
      />
      <StatCard 
        icon={Package} 
        value={packagesCount} 
        label="Packages" 
        colorClass="text-green-400" 
      />
      <StatCard 
        icon={Shield} 
        value={vulnerabilitiesCount} 
        label="Vulnérabilités" 
        colorClass="text-red-400" 
      />
    </div>
  );
};

export default AgentQuickStats;
