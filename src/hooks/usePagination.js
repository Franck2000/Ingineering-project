import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants';

/**
 * Hook personnalisé pour gérer la pagination
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
export const usePagination = (items, itemsPerPage = PAGINATION.ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcul du nombre total de pages
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  // Calcul des items de la page courante
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  /**
   * Va à la page suivante
   */
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  /**
   * Va à la page précédente
   */
  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  /**
   * Va à une page spécifique
   */
  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  /**
   * Réinitialise à la première page
   */
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    nextPage,
    previousPage,
    goToPage,
    resetPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};
