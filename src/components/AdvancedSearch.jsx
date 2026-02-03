import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

/**
 * Fonction pour aplatir un objet et extraire tous les champs
 */
const flattenObject = (obj, prefix = '') => {
  const result = {};
  
  for (const [key, value] of Object.entries(obj || {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      result[fullKey] = '';
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = value.join(', ');
    } else {
      result[fullKey] = String(value);
    }
  }
  
  return result;
};

/**
 * Composant AdvancedSearch - Recherche avec auto-complétion par champs
 * Syntaxe: champ:valeur OU recherche libre
 * Conserve les filtres même lors du refresh des données
 */
const AdvancedSearch = ({ alerts, onFilteredResults, placeholder = "Rechercher (ex: agent.name:wazuh-server)" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilters, setActiveFilters] = useState([]);
  const [logicOperator, setLogicOperator] = useState('AND'); // 'AND' ou 'OR'
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Référence pour garder les filtres actuels accessibles dans l'effet
  const filtersRef = useRef({ activeFilters: [], query: '' });
  
  // Mettre à jour la référence quand les filtres changent
  useEffect(() => {
    filtersRef.current = { activeFilters, query };
  }, [activeFilters, query]);

  // Extraire tous les champs et valeurs uniques des alertes
  const fieldIndex = useMemo(() => {
    const index = {};
    
    alerts.forEach(alert => {
      const flattened = flattenObject(alert._source || alert);
      
      Object.entries(flattened).forEach(([field, value]) => {
        if (!index[field]) {
          index[field] = new Set();
        }
        if (value && value.length < 200) { // Limite pour éviter les valeurs trop longues
          index[field].add(value);
        }
      });
    });

    // Convertir les Sets en Arrays triés
    const result = {};
    Object.keys(index).sort().forEach(field => {
      result[field] = Array.from(index[field]).sort().slice(0, 100); // Max 100 valeurs par champ
    });
    
    return result;
  }, [alerts]);

  // Liste des champs disponibles
  const availableFields = useMemo(() => Object.keys(fieldIndex), [fieldIndex]);

  // Générer les suggestions basées sur la requête
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const cursorPos = inputRef.current?.selectionStart || query.length;
    const textBeforeCursor = query.slice(0, cursorPos);
    const lastSegment = textBeforeCursor.split(/\s+/).pop() || '';

    let newSuggestions = [];

    // Si on tape "champ:"
    if (lastSegment.includes(':')) {
      const [field, valuePrefix] = lastSegment.split(':');
      const matchingField = availableFields.find(f => f.toLowerCase() === field.toLowerCase());
      
      if (matchingField && fieldIndex[matchingField]) {
        // Suggérer les valeurs du champ
        const values = fieldIndex[matchingField]
          .filter(v => v.toLowerCase().includes((valuePrefix || '').toLowerCase()))
          .slice(0, 10);
        
        newSuggestions = values.map(v => ({
          type: 'value',
          field: matchingField,
          value: v,
          display: `${matchingField}:${v}`,
          replace: `${matchingField}:"${v}"`
        }));
      }
    } else {
      // Suggérer les champs qui correspondent
      const matchingFields = availableFields
        .filter(f => f.toLowerCase().includes(lastSegment.toLowerCase()))
        .slice(0, 15);
      
      newSuggestions = matchingFields.map(f => ({
        type: 'field',
        field: f,
        display: `${f}:`,
        replace: `${f}:`,
        count: fieldIndex[f]?.length || 0
      }));
    }

    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
  }, [query, availableFields, fieldIndex]);

  // Appliquer un filtre
  const applyFilter = (filter) => {
    const newFilters = [...activeFilters, filter];
    setActiveFilters(newFilters);
    setQuery('');
    setShowSuggestions(false);
  };

  // Supprimer un filtre
  const removeFilter = (index) => {
    const newFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(newFilters);
  };

  // Appliquer une suggestion
  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'value') {
      // Ajouter comme filtre actif
      applyFilter({
        field: suggestion.field,
        value: suggestion.value,
        display: suggestion.display
      });
    } else {
      // C'est un champ, ajouter "champ:" dans la recherche
      const cursorPos = inputRef.current?.selectionStart || query.length;
      const textBeforeCursor = query.slice(0, cursorPos);
      const textAfterCursor = query.slice(cursorPos);
      const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
      
      const newQuery = textBeforeCursor.slice(0, lastSpaceIndex + 1) + suggestion.replace + textAfterCursor;
      setQuery(newQuery);
      
      setTimeout(() => {
        inputRef.current?.focus();
        const newPos = (lastSpaceIndex + 1) + suggestion.replace.length;
        inputRef.current?.setSelectionRange(newPos, newPos);
      }, 0);
    }
    setShowSuggestions(false);
  };

  // Filtrer les alertes
  useEffect(() => {
    let filtered = [...alerts];
    
    // Déterminer si des filtres sont actifs
    const hasActiveFilters = activeFilters.length > 0 || query.trim().length > 0;

    // Appliquer les filtres actifs avec la logique ET ou OU
    if (activeFilters.length > 0) {
      if (logicOperator === 'AND') {
        // Logique ET : toutes les conditions doivent être vraies
        activeFilters.forEach(filter => {
          filtered = filtered.filter(alert => {
            const flattened = flattenObject(alert._source || alert);
            const fieldValue = flattened[filter.field];
            return fieldValue && fieldValue.toLowerCase().includes(filter.value.toLowerCase());
          });
        });
      } else {
        // Logique OU : au moins une condition doit être vraie
        filtered = filtered.filter(alert => {
          const flattened = flattenObject(alert._source || alert);
          return activeFilters.some(filter => {
            const fieldValue = flattened[filter.field];
            return fieldValue && fieldValue.toLowerCase().includes(filter.value.toLowerCase());
          });
        });
      }
    }

    // Appliquer la recherche textuelle
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/).filter(t => !t.includes(':'));
      
      if (searchTerms.length > 0) {
        filtered = filtered.filter(alert => {
          const flattened = flattenObject(alert._source || alert);
          const allValues = Object.values(flattened).join(' ').toLowerCase();
          return searchTerms.every(term => allValues.includes(term));
        });
      }

      // Appliquer les filtres champ:valeur dans la requête
      const fieldFilters = query.match(/(\w+(?:\.\w+)*):("[^"]*"|\S+)/g) || [];
      fieldFilters.forEach(filter => {
        const [field, rawValue] = filter.split(':');
        const value = rawValue.replace(/^"|"$/g, ''); // Enlever les guillemets
        
        filtered = filtered.filter(alert => {
          const flattened = flattenObject(alert._source || alert);
          const matchingFields = Object.keys(flattened).filter(f => 
            f.toLowerCase().includes(field.toLowerCase())
          );
          return matchingFields.some(f => 
            flattened[f]?.toLowerCase().includes(value.toLowerCase())
          );
        });
      });
    }

    // Passer les résultats filtrés, l'état des filtres et la signature au parent
    const filterSignature = JSON.stringify({ filters: activeFilters.map(f => f.display), query: query.trim(), logic: logicOperator });
    onFilteredResults(filtered, hasActiveFilters, filterSignature);
  }, [alerts, activeFilters, query, logicOperator, onFilteredResults]);

  // Gestion du clavier
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setQuery('');
        setActiveFilters([]);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          applySuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      case 'Tab':
        if (suggestions.length > 0) {
          e.preventDefault();
          applySuggestion(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
        }
        break;
    }
  };

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      {/* Barre de recherche */}
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap p-2 bg-surface-secondary/60 border border-primary-500/30 rounded-lg focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Filter size={16} className="text-primary-400/60 ml-1" />
          
          {/* Toggle AND/OR - affiché seulement s'il y a des filtres */}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setLogicOperator(prev => prev === 'AND' ? 'OR' : 'AND')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-all ${
                logicOperator === 'AND' 
                  ? 'bg-primary-500/40 text-primary-200 hover:bg-primary-500/60' 
                  : 'bg-cyber-pink/40 text-pink-200 hover:bg-cyber-pink/60'
              }`}
              title={logicOperator === 'AND' ? 'Mode ET: toutes les conditions' : 'Mode OU: au moins une condition'}
            >
              {logicOperator}
            </button>
          )}
          
          {/* Filtres actifs */}
          {activeFilters.map((filter, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-500/30 text-primary-200 rounded-md"
            >
              <span className="text-primary-400">{filter.field}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => removeFilter(index)}
                className="ml-1 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={activeFilters.length > 0 ? "Ajouter un filtre..." : placeholder}
            className="flex-1 min-w-[200px] bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
          />
          
          {/* Bouton clear */}
          {(query || activeFilters.length > 0) && (
            <button
              onClick={() => {
                setQuery('');
                setActiveFilters([]);
              }}
              className="p-1 text-gray-500 hover:text-primary-300 transition-colors"
              title="Effacer tout"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto bg-surface-secondary border border-primary-500/30 rounded-lg shadow-xl z-50"
            style={{ backgroundColor: 'rgba(45, 31, 74, 0.98)' }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.display}-${index}`}
                onClick={() => applySuggestion(suggestion)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-primary-500/20 transition-colors ${
                  index === selectedIndex ? 'bg-primary-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {suggestion.type === 'field' ? (
                    <>
                      <span className="text-primary-300 font-mono">{suggestion.field}</span>
                      <span className="text-gray-500">:</span>
                    </>
                  ) : (
                    <>
                      <span className="text-primary-400 font-mono text-xs">{suggestion.field}:</span>
                      <span className="text-gray-200">{suggestion.value}</span>
                    </>
                  )}
                </div>
                {suggestion.type === 'field' && (
                  <span className="text-xs text-gray-500">
                    {suggestion.count} valeurs
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aide */}
      {showSuggestions && query === '' && activeFilters.length === 0 && (
        <div className="mt-2 p-3 bg-surface-tertiary/50 rounded-lg border border-primary-500/20">
          <p className="text-xs text-gray-400 mb-2">💡 Syntaxe de recherche :</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">
              <span className="text-primary-300 font-mono">agent.name:</span> recherche par nom d'agent
            </div>
            <div className="text-gray-500">
              <span className="text-primary-300 font-mono">rule.level:</span> recherche par niveau
            </div>
            <div className="text-gray-500">
              <span className="text-primary-300 font-mono">severity:</span> recherche par sévérité
            </div>
            <div className="text-gray-500">
              <span className="text-primary-300 font-mono">provider:</span> recherche par provider
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
