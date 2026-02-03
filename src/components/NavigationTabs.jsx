import React from 'react';
import { LayoutDashboard, Server, Shield, FileText, Settings } from 'lucide-react';

/**
 * Composant NavigationTabs - Navigation entre les différentes pages
 * Thème Cyber Security
 */
const NavigationTabs = ({ activePage, onPageChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'endpoints', label: 'Endpoints', icon: Server },
  ];

  return (
    <div className="flex items-center gap-1 mb-6 bg-surface-secondary/60 backdrop-blur-sm border border-primary-500/20 rounded-xl p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePage === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500/80 to-pink-500/80 text-white shadow-lg shadow-primary-500/30' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-primary-500/10'
              }
            `}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationTabs;
