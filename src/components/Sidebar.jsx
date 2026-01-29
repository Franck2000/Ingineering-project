import React from 'react';
import { ChevronDown, Monitor } from 'lucide-react';
import { CLOUD_PROVIDERS, QUICK_FILTERS, SERVICES, SEVERITIES, REGIONS, SOURCES } from '../constants';

/**
 * Composant Sidebar - Gère l'affichage des filtres
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const Sidebar = ({
  filters,
  onToggleProvider,
  onServiceChange,
  onSeverityChange,
  onEnvironmentChange,
  onRegionChange,
  onSourceChange,
  onClearFilters,
  availableSources = []
}) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-7 h-screen overflow-y-auto scrollbar-thin sticky top-0 transition-colors duration-300">
      {/* Title */}
      <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Filters
      </h2>

      {/* Quick Filters */}
      <div className="flex gap-2">
        {QUICK_FILTERS.map(filter => (
          <div
            key={filter.name}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-base" style={{ color: filter.color }}>
              {filter.icon}
            </span>
            <span>{filter.name}</span>
          </div>
        ))}
      </div>

      {/* Cloud Provider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Cloud Provider</span>
          <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {CLOUD_PROVIDERS.map(provider => (
            <div
              key={provider.name}
              onClick={() => onToggleProvider(provider.name)}
              className={`flex items-center justify-between px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                filters.providers.includes(provider.name)
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`checkbox-custom ${
                    filters.providers.includes(provider.name) ? 'checked' : ''
                  }`}
                >
                  {filters.providers.includes(provider.name) && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {provider.name}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Service */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Service</label>
        <select
          value={filters.service}
          onChange={(e) => onServiceChange(e.target.value)}
          className="input-field appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.25rem',
            paddingRight: '2.5rem'
          }}
        >
          {SERVICES.map(service => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Slider */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Severity</label>
        <div className="px-4 py-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center gap-4">
          <div className="text-gray-500 dark:text-gray-400">●</div>
          <div className="flex-1 h-1.5 bg-gradient-to-r from-primary-500 to-gray-300 dark:to-gray-600 rounded-full relative">
            <div className="absolute w-4.5 h-4.5 bg-primary-500 border-3 border-white dark:border-gray-800 rounded-full left-1/5 top-1/2 -translate-y-1/2 shadow-md cursor-pointer"></div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">●</div>
        </div>
      </div>

      {/* Severity Radio */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Severity</label>
        <div className="flex flex-col gap-2">
          {SEVERITIES.map((sev, idx) => (
            <div
              key={idx}
              onClick={() => onSeverityChange(sev.value)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                filters.severity === sev.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div
                className={`radio-custom ${
                  filters.severity === sev.value ? 'selected' : ''
                }`}
              >
                {filters.severity === sev.value && (
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {sev.label}
              </span>
              {idx === 0 && (
                <span className="ml-auto px-2.5 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                  A
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Source (Agent) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Monitor size={16} className="text-gray-500" />
          Source (Agent)
        </label>
        <select
          value={filters.source}
          onChange={(e) => onSourceChange(e.target.value)}
          className="input-field appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.25rem',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Toutes les sources</option>
          {availableSources.map(source => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Region</label>
        <select
          value={filters.region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="input-field appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.25rem',
            paddingRight: '2.5rem'
          }}
        >
          {REGIONS.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="btn-secondary mt-auto"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default Sidebar;
