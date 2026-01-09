import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le chargement des données
 * Gère les états de chargement et d'erreur
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
export const useDataFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Une erreur est survenue');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
