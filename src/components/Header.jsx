import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Moon, Sun, LogOut, RefreshCw, Radio } from 'lucide-react';

/**
 * Composant Header - Affiche le titre et les actions du dashboard
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const Header = ({ onRefresh, darkMode, toggleDarkMode, onLogout, username, lastUpdate }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('');

  // Mettre à jour l'affichage du temps écoulé
  useEffect(() => {
    const updateTimeSince = () => {
      if (!lastUpdate) return;
      
      const now = new Date();
      const diff = Math.floor((now - lastUpdate) / 1000);
      
      if (diff < 5) {
        setTimeSinceUpdate('à l\'instant');
      } else if (diff < 60) {
        setTimeSinceUpdate(`il y a ${diff}s`);
      } else if (diff < 3600) {
        setTimeSinceUpdate(`il y a ${Math.floor(diff / 60)}min`);
      } else {
        setTimeSinceUpdate(`il y a ${Math.floor(diff / 3600)}h`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Handler pour le refresh avec animation
  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
          Cloud Security Monitoring Dashboard
        </h1>
        {/* Indicateur temps réel */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
          <Radio size={14} className="text-green-600 dark:text-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">LIVE</span>
        </div>
      </div>
      
      <div className="flex gap-3 items-center">
        {/* Affichage de la dernière mise à jour */}
        {lastUpdate && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span>Mis à jour {timeSinceUpdate}</span>
          </div>
        )}
        <button className="btn-secondary">Last 24h</button>
        <button 
          onClick={handleRefreshClick} 
          className="btn-primary flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
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
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {username || 'Admin'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
            </div>
            <ChevronDown size={16} className={`text-gray-600 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
