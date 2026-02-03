import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Composant SearchBar - Barre de recherche avec compteur de résultats
 */
const SearchBar = ({ value, onChange, resultCount, placeholder = "Rechercher..." }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400/60" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-80 pl-10 pr-10 py-2 bg-surface-secondary/60 border border-primary-500/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 backdrop-blur-sm transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-300"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Compteur de résultats */}
      {value && (
        <span className="text-sm text-gray-400">
          {resultCount} résultat{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default SearchBar;
