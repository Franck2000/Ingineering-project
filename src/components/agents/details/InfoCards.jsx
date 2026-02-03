import React from 'react';
import { Server, Cpu, Clock, Wifi, Globe, Activity } from 'lucide-react';
import { Card, StatItem, ProgressBar } from '../../ui/index.jsx';
import { formatBytes, formatDate, getProgressColor } from '../../../utils/formatters';

// Card Système
export const SystemCard = ({ agent, os }) => (
  <Card title="Système" icon={Server}>
    <StatItem label="OS" value={os?.os?.name || agent.os?.name} />
    <StatItem label="Version" value={os?.os?.version || agent.os?.version} />
    <StatItem label="Architecture" value={os?.architecture} />
    <StatItem label="Hostname" value={os?.hostname || agent.name} />
    <StatItem label="Version Agent" value={agent.version} />
    <StatItem label="Cluster Node" value={agent.node_name} />
  </Card>
);

// Card Hardware
export const HardwareCard = ({ hardware }) => {
  const ramTotal = hardware?.ram?.total || 0;
  const ramFree = hardware?.ram?.free || 0;
  const ramUsed = ramTotal - ramFree;
  const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;

  return (
    <Card title="Hardware" icon={Cpu}>
      <StatItem label="CPU" value={hardware?.cpu?.name} />
      <StatItem label="Cores" value={hardware?.cpu?.cores} />
      <StatItem label="MHz" value={hardware?.cpu?.mhz} />
      <StatItem label="Mémoire Totale" value={formatBytes(ramTotal)} />
      <StatItem label="Mémoire Libre" value={formatBytes(ramFree)} />
      <div className="mt-4">
        <ProgressBar 
          value={ramUsed} 
          max={ramTotal} 
          label="Utilisation RAM"
          color={getProgressColor(ramPercent)}
        />
      </div>
    </Card>
  );
};

// Card Connexion
export const ConnectionCard = ({ agent }) => (
  <Card title="Connexion" icon={Clock}>
    <StatItem label="Status" value={agent.status} />
    <StatItem label="Dernière connexion" value={formatDate(agent.lastKeepAlive)} />
    <StatItem label="Enregistrement" value={formatDate(agent.dateAdd)} />
    <StatItem label="Groupes" value={agent.group?.join(', ') || 'Aucun'} />
    <StatItem label="Manager" value={agent.manager} />
  </Card>
);

// Card Réseau
export const NetworkCard = ({ interfaces }) => (
  <Card title="Interfaces Réseau" icon={Wifi}>
    {interfaces?.length > 0 ? (
      interfaces.slice(0, 5).map((iface, i) => (
        <div key={i} className="py-2 border-b border-primary-500/10 last:border-0">
          <div className="flex justify-between">
            <span className="text-gray-200 font-medium">{iface.name}</span>
            <span className="text-gray-400 text-sm">{iface.state}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            MAC: {iface.mac} • MTU: {iface.mtu}
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">Aucune interface</p>
    )}
  </Card>
);

// Card Ports
export const PortsCard = ({ ports }) => (
  <Card title="Ports Ouverts" icon={Globe}>
    {ports?.length > 0 ? (
      <div className="max-h-48 overflow-y-auto">
        {ports.slice(0, 10).map((port, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-primary-500/10 last:border-0">
            <span className="text-gray-200 font-mono text-sm">{port.local?.port}</span>
            <span className="text-gray-400 text-sm">{port.protocol?.toUpperCase()}</span>
            <span className="text-gray-500 text-xs">{port.state}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">Aucun port détecté</p>
    )}
  </Card>
);

// Card Processus
export const ProcessesCard = ({ processes }) => (
  <Card title="Processus Actifs" icon={Activity}>
    <p className="text-3xl font-bold text-gradient mb-2">{processes?.length || 0}</p>
    {processes?.length > 0 && (
      <div className="max-h-40 overflow-y-auto">
        {processes.slice(0, 8).map((proc, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span className="text-gray-300 truncate max-w-[150px]">{proc.name}</span>
            <span className="text-gray-500 font-mono">{proc.pid}</span>
          </div>
        ))}
      </div>
    )}
  </Card>
);
