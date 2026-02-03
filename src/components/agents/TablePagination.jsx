import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePagination = ({ 
  currentPage, 
  totalPages, 
  rowsPerPage, 
  onPageChange, 
  onRowsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary-500/20">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="bg-surface-secondary border border-primary-500/30 rounded px-2 py-1 text-sm text-gray-300"
        >
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 hover:bg-primary-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-primary-500/20'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1 hover:bg-primary-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
