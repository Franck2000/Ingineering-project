import React from 'react';
import { AlertTriangle, Activity, Server, Layers } from 'lucide-react';

/**
 * Composant StatsCards - Affiche les cartes de statistiques
 * Thème Cyber Security - Violet/Rose
 */
const StatsCards = ({ statistics, impactedProviders, topServices }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Total Alerts */}
      <div className="card-glow group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
            <Activity size={18} className="text-primary-400" />
          </div>
          <span className="text-sm text-gray-400 font-semibold">
            Total Alerts
          </span>
        </div>
        <div className="text-4xl font-extrabold text-gradient">
          {statistics.totalAlerts.toLocaleString()}
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="card-glow group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <span className="text-sm text-gray-400 font-semibold">
            Critical Alerts
          </span>
        </div>
        <div className="text-4xl font-extrabold text-red-400">
          {statistics.criticalAlerts}
        </div>
      </div>

      {/* Impacted Providers */}
      <div className="card-glow group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyber-pink/20 flex items-center justify-center group-hover:bg-cyber-pink/30 transition-colors">
            <Server size={18} className="text-cyber-pink" />
          </div>
          <span className="text-sm text-gray-400 font-semibold">
            Impacted Providers
          </span>
        </div>
        <div className="flex gap-3 mt-4 items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-200">AWS</span>
          </div>
          <div className="text-primary-400 text-2xl">▲</div>
          <div className="flex items-center gap-1">
            <span className="text-cyber-violet text-xl">●</span>
            <span className="text-sm font-semibold text-gray-200">GCP</span>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="card-glow group">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyber-violet/20 flex items-center justify-center group-hover:bg-cyber-violet/30 transition-colors">
            <Layers size={18} className="text-cyber-violet" />
          </div>
          <span className="text-sm text-gray-400 font-semibold">
            Top Services
          </span>
        </div>
        <div className="flex flex-col gap-2.5 mt-4">
          {topServices.map((service, idx) => (
            <div key={service} className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                style={{
                  background: idx === 0 
                    ? 'linear-gradient(135deg, #ec4899, #a855f7)' 
                    : idx === 1 
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' 
                    : 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                }}
              >
                {idx + 1}
              </div>
              <span className="text-sm text-gray-200 font-medium">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
