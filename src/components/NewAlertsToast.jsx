import React, { useEffect, useState } from 'react';
import { Bell, X, RefreshCw } from 'lucide-react';

/**
 * Composant Toast pour notifier les nouvelles alertes
 * Apparaît en bas à droite et permet de charger les nouvelles alertes
 */
const NewAlertsToast = ({ count, onLoadAlerts, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation d'entrée quand le count change
  useEffect(() => {
    if (count > 0) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  // Gérer le chargement des alertes
  const handleLoad = () => {
    setIsVisible(false);
    setTimeout(() => {
      onLoadAlerts();
    }, 200);
  };

  // Gérer la fermeture
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  if (!isVisible || count === 0) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
      style={{
        animation: isVisible ? 'slideInUp 0.3s ease-out' : 'slideOutDown 0.3s ease-in'
      }}
    >
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(168, 85, 247, 0.9) 100%)',
          borderColor: 'rgba(236, 72, 153, 0.5)',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 10px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Icône avec animation */}
        <div className="relative">
          <Bell size={24} className="text-white animate-pulse" />
          <span 
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full"
            style={{ animation: 'pulse 1.5s infinite' }}
          >
            {count > 99 ? '99+' : count}
          </span>
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm">
            {count} nouvelle{count > 1 ? 's' : ''} alerte{count > 1 ? 's' : ''}
          </span>
          <span className="text-white/70 text-xs">
            Cliquez pour actualiser
          </span>
        </div>

        {/* Bouton charger */}
        <button
          onClick={handleLoad}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
        >
          <RefreshCw size={14} />
          Charger
        </button>

        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
          title="Ignorer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Animation CSS inline */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default NewAlertsToast;
