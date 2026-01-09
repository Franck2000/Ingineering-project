import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les filtres
 * Suit le principe de responsabilité unique (Single Responsibility)
 * Facilite la réutilisation et les tests
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    providers: initialFilters.providers || [],
    service: initialFilters.service || '',
    severity: initialFilters.severity || '',
    environment: initialFilters.environment || '',
    region: initialFilters.region || ''
  });

  /**
   * Toggle un provider dans la liste
   */
  const toggleProvider = useCallback((provider) => {
    setFilters(prev => ({
      ...prev,
      providers: prev.providers.includes(provider)
        ? prev.providers.filter(p => p !== provider)
        : [...prev.providers, provider]
    }));
  }, []);

  /**
   * Définit le service sélectionné
   */
  const setService = useCallback((service) => {
    setFilters(prev => ({ ...prev, service }));
  }, []);

  /**
   * Définit la sévérité sélectionnée
   */
  const setSeverity = useCallback((severity) => {
    setFilters(prev => ({ ...prev, severity }));
  }, []);

  /**
   * Définit l'environnement sélectionné
   */
  const setEnvironment = useCallback((environment) => {
    setFilters(prev => ({ ...prev, environment }));
  }, []);

  /**
   * Définit la région sélectionnée
   */
  const setRegion = useCallback((region) => {
    setFilters(prev => ({ ...prev, region }));
  }, []);

  /**
   * Réinitialise tous les filtres
   */
  const clearFilters = useCallback(() => {
    setFilters({
      providers: [],
      service: '',
      severity: '',
      environment: '',
      region: ''
    });
  }, []);

  /**
   * Compte le nombre de filtres actifs
   */
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.providers.length > 0) count += filters.providers.length;
    if (filters.service) count++;
    if (filters.severity) count++;
    if (filters.environment) count++;
    if (filters.region) count++;
    return count;
  }, [filters]);

  return {
    filters,
    toggleProvider,
    setService,
    setSeverity,
    setEnvironment,
    setRegion,
    clearFilters,
    getActiveFiltersCount
  };
};
