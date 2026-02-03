import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le chargement des données
 * Gère les états de chargement et d'erreur
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
export const useDataFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Garder une référence stable de la fonction fetch
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  // Sérialiser les dépendances pour une comparaison stable
  const depsKey = JSON.stringify(dependencies);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunctionRef.current();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('useDataFetch error:', err);
          setError(err.message || 'Une erreur est survenue');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [depsKey]); // Utiliser la clé sérialisée au lieu des objets

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunctionRef.current();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('useDataFetch refetch error:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
};
