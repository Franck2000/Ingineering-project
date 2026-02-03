import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-16 py-2.5 bg-surface-secondary border border-primary-500/30 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-400/60 focus:ring-1 focus:ring-primary-400/30"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-primary-500/20 rounded text-xs text-primary-300 font-medium">
      WQL
    </span>
  </div>
);

export default SearchBar;
