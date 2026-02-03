import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Moon, Sun, LogOut, RefreshCw, Pause, Play, Menu } from 'lucide-react';
import logo from '../assets/logo.png';
import DateRangePicker from './DateRangePicker';

/**
 * Composant Header - Affiche le titre et les actions du dashboard
 * Thème Cyber Security - Unicorns
 */
const Header = ({ onRefresh, darkMode, toggleDarkMode, onLogout, username, lastUpdate, isLive, onToggleLive, newAlertsCount, onMenuClick, timeRange, onTimeRangeChange }) => {
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
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
      <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto justify-between lg:justify-start">
        {/* Menu burger mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 bg-surface-secondary/80 border border-primary-500/30 rounded-lg"
        >
          <Menu size={24} className="text-primary-300" />
        </button>
        
        {/* Logo Unicorns */}
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="Unicorns" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-lg" style={{filter: 'drop-shadow(0 4px 20px rgba(59, 130, 246, 0.5))'}} />
          <h1 className="text-lg md:text-2xl font-extrabold text-gradient hidden sm:block">
            Unicorns Security
          </h1>
        </div>
        {/* Indicateur temps réel avec bouton Pause/Play */}
        <button 
          onClick={onToggleLive}
          className={`live-indicator cursor-pointer hover:scale-105 transition-transform ${!isLive ? 'opacity-60' : ''}`}
          title={isLive ? 'Pause le live pour consulter les logs' : 'Reprendre le live'}
        >
          {isLive ? (
            <>
              <div className="live-dot"></div>
              <span className="text-xs font-medium text-green-400">LIVE</span>
              <Pause size={14} className="ml-1 text-green-400" />
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs font-medium text-yellow-400">PAUSE</span>
              <Play size={14} className="ml-1 text-yellow-400" />
              {newAlertsCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  +{newAlertsCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
      
      <div className="flex gap-2 md:gap-3 items-center flex-wrap w-full lg:w-auto justify-end">
        {/* Affichage de la dernière mise à jour */}
        {lastUpdate && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-surface-secondary/60 backdrop-blur-sm border border-primary-500/20 rounded-lg">
            <span>Mis à jour {timeSinceUpdate}</span>
          </div>
        )}
        
        {/* Sélecteur de période */}
        <DateRangePicker 
          value={timeRange?.value || '24h'} 
          onChange={onTimeRangeChange} 
        />
        
        <button 
          onClick={handleRefreshClick} 
          className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button className="btn-secondary text-xs md:text-sm px-2 md:px-4 hidden md:block">Save View</button>
        
        {/* Dark Mode Toggle - Style cyber */}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-surface-secondary/80 border border-primary-500/30 rounded-lg cursor-pointer hover:bg-surface-tertiary hover:border-primary-400/50 transition-all backdrop-blur-sm"
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-primary-300" />
          )}
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-surface-secondary/80 border border-primary-500/30 rounded-lg cursor-pointer hover:bg-surface-tertiary hover:border-primary-400/50 transition-all backdrop-blur-sm"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #a855f7, #ec4899)'}}>
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <div className="text-sm font-semibold text-white">
                {username || 'Admin'}
              </div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 backdrop-blur-md border border-primary-500/30 rounded-lg z-50" style={{backgroundColor: 'rgba(45, 31, 74, 0.95)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'}}>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
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
