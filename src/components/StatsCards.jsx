import React from 'react';

/**
 * Composant StatsCards - Affiche les cartes de statistiques
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const StatsCards = ({ statistics, impactedProviders, topServices }) => {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Total Alerts */}
      <div className="card">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Total Alerts
        </div>
        <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {statistics.totalAlerts.toLocaleString()}
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="card">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Critical Alerts
        </div>
        <div className="text-4xl font-extrabold text-red-500">
          {statistics.criticalAlerts}
        </div>
      </div>

      {/* Impacted Providers */}
      <div className="card">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Impacted Providers
        </div>
        <div className="flex gap-3 mt-4 items-center">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AWS</span>
          </div>
          <div className="text-primary-500 text-2xl">▲</div>
          <div className="flex items-center gap-1">
            <span className="text-blue-500 text-xl">●</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">GCP</span>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="card">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Top Services
        </div>
        <div className="flex flex-col gap-2.5 mt-4">
          {topServices.map((service, idx) => (
            <div key={service} className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                style={{
                  backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#10B981' : '#F59E0B'
                }}
              >
                {idx === 0 ? '⬢' : '✓'}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
