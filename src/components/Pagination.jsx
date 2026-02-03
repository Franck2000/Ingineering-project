import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Composant Pagination - Navigation entre les pages
 */
const Pagination = ({ currentPage, totalPages, onNextPage, onPreviousPage, hasNextPage, hasPreviousPage }) => {
  return (
    <div className="flex justify-between items-center mt-6 pt-6 border-t border-primary-500/20">
      <div className="flex gap-2 items-center">
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className="w-9 h-9 flex items-center justify-center bg-surface-secondary/60 border border-primary-500/30 rounded-md text-gray-200 hover:bg-surface-tertiary hover:border-primary-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm text-gray-400 font-medium">
          Page <span className="text-primary-300">{currentPage}</span> of <span className="text-primary-300">{totalPages}</span>
        </div>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="w-9 h-9 flex items-center justify-center bg-surface-secondary/60 border border-primary-500/30 rounded-md text-gray-200 hover:bg-surface-tertiary hover:border-primary-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
