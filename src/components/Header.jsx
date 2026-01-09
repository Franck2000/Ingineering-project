import React from 'react';
import { ChevronDown, User } from 'lucide-react';

/**
 * Composant Header - Affiche le titre et les actions du dashboard
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const Header = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-extrabold text-gray-900">
        Cloud Security Monitoring Dashboard
      </h1>
      
      <div className="flex gap-3 items-center">
        <button className="btn-secondary">Last 24h</button>
        <button className="btn-secondary">Live</button>
        <button onClick={onRefresh} className="btn-primary">
          Refresh
        </button>
        <button className="btn-secondary">Save View</button>
        
        {/* User Menu */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={18} className="text-gray-600" />
          </div>
          <div className="flex flex-col items-start">
            <div className="text-sm font-semibold text-gray-900">
              Merit Desired
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          <ChevronDown size={16} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default Header;
