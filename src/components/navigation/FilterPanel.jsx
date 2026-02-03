import React from 'react';
import { ChevronDown, Monitor } from 'lucide-react';
import { CLOUD_PROVIDERS, QUICK_FILTERS, SEVERITIES, REGIONS } from '../../constants';

// Style commun pour les selects
const SELECT_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b5cf6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '1.25rem',
  paddingRight: '2.5rem'
};

/**
 * Composant FilterPanel - Panneau des filtres intégré à la navigation
 */
const FilterPanel = ({
  filters,
  onToggleProvider,
  onServiceChange,
  onSeverityChange,
  onEnvironmentChange,
  onRegionChange,
  onSourceChange,
  onClearFilters,
  availableSources = [],
  availableServices = []
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(filter => (
          <div
            key={filter.name}
            className="flex items-center gap-2 px-3 py-2 bg-surface-secondary/80 border border-primary-500/30 rounded-lg text-xs font-semibold text-gray-200 cursor-pointer hover:bg-surface-tertiary hover:border-primary-400/50 transition-all"
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
          <span className="text-sm font-semibold text-gray-200">Cloud Provider</span>
          <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-r from-primary-500 to-pink-500">
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
                  ? 'bg-primary-500/20 border-primary-400/60'
                  : 'bg-surface-secondary/60 border-primary-500/20 hover:bg-surface-tertiary/60 hover:border-primary-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.providers.includes(provider.name)
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 border-transparent'
                    : 'border-gray-500'
                }`}>
                  {filters.providers.includes(provider.name) && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {provider.name}
                </span>
              </div>
              <ChevronDown size={16} className="text-primary-400/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Service - Dynamique depuis les logs */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-200">Service</label>
        <select
          value={filters.service || ''}
          onChange={(e) => onServiceChange(e.target.value)}
          className="w-full px-3 py-3 bg-surface-secondary/60 border border-primary-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-primary-400/60 appearance-none cursor-pointer"
          style={SELECT_STYLE}
        >
          <option value="">Tous les services</option>
          {availableServices.map(service => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-200">Severity</label>
        <div className="flex flex-col gap-2">
          {SEVERITIES.map((sev, idx) => (
            <div
              key={idx}
              onClick={() => onSeverityChange(sev.value)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                filters.severity === sev.value
                  ? 'bg-primary-500/20 border-primary-400/60'
                  : 'bg-surface-secondary/60 border-primary-500/20 hover:bg-surface-tertiary/60 hover:border-primary-400/40'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                filters.severity === sev.value
                  ? 'border-primary-400'
                  : 'border-gray-500'
              }`}>
                {filters.severity === sev.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-pink-500"></div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-200">
                {sev.label}
              </span>
              {idx === 0 && (
                <span className="ml-auto w-6 h-6 rounded flex items-center justify-center bg-red-500/20 text-red-400 text-xs font-bold">
                  !
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Source (Agent) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Monitor size={16} className="text-primary-400" />
          Source (Agent)
        </label>
        <select
          value={filters.source}
          onChange={(e) => onSourceChange(e.target.value)}
          className="w-full px-3 py-3 bg-surface-secondary/60 border border-primary-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-primary-400/60 appearance-none cursor-pointer"
          style={SELECT_STYLE}
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
        <label className="text-sm font-semibold text-gray-200">Region</label>
        <select
          value={filters.region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full px-3 py-3 bg-surface-secondary/60 border border-primary-500/20 rounded-lg text-gray-200 focus:outline-none focus:border-primary-400/60 appearance-none cursor-pointer"
          style={SELECT_STYLE}
        >
          <option value="">Toutes les régions</option>
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
        className="w-full py-3 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50 transition-all font-medium"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterPanel;
