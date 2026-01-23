import React from 'react';
import { ChevronDown, User, Moon, Sun } from 'lucide-react';

/**
 * Composant Header - Affiche le titre et les actions du dashboard
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const Header = ({ onRefresh, darkMode, toggleDarkMode }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
        Cloud Security Monitoring Dashboard
      </h1>
      
      <div className="flex gap-3 items-center">
        <button className="btn-secondary">Last 24h</button>
        <button className="btn-secondary">Live</button>
        <button onClick={onRefresh} className="btn-primary">
          Refresh
        </button>
        <button className="btn-secondary">Save View</button>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
        
        {/* User Menu */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User size={18} className="text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex flex-col items-start">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Merit Desired
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
          </div>
          <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Header;
