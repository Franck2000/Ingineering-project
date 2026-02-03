import React, { useState } from 'react';
import { 
  Home, Search, Shield, Brain, Cloud, Users, Server, 
  Database, LayoutDashboard, ChevronRight, ChevronDown,
  Activity, Filter, Menu, X
} from 'lucide-react';

// Modes d'affichage du panneau
export const PANEL_MODE = {
  MENU: 'menu',
  FILTERS: 'filters'
};

// Configuration du menu
const MENU_CONFIG = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    children: [
      { id: 'overview', label: 'Overview' }
    ]
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: Search,
  },
  {
    id: 'endpoint-security',
    label: 'Endpoint security',
    icon: Shield,
    children: [
      { id: 'configuration-assessment', label: 'Configuration Assessment' },
      { id: 'malware-detection', label: 'Malware Detection' },
      { id: 'fim', label: 'File Integrity Monitoring' }
    ]
  },
  {
    id: 'threat-intelligence',
    label: 'Threat intelligence',
    icon: Brain,
    children: [
      { id: 'threat-hunting', label: 'Threat Hunting' },
      { id: 'vulnerability-detection', label: 'Vulnerability Detection' },
      { id: 'mitre-attack', label: 'MITRE ATT&CK' }
    ]
  },
  {
    id: 'security-operations',
    label: 'Security operations',
    icon: Activity,
    children: [
      { id: 'security-events', label: 'Security Events' },
      { id: 'integrity-monitoring', label: 'Integrity Monitoring' },
      { id: 'regulatory-compliance', label: 'Regulatory Compliance' }
    ]
  },
  {
    id: 'cloud-security',
    label: 'Cloud security',
    icon: Cloud,
    children: [
      { id: 'aws', label: 'Amazon AWS' },
      { id: 'gcp', label: 'Google Cloud' },
      { id: 'azure', label: 'Microsoft Azure' }
    ]
  },
  {
    id: 'agents-management',
    label: 'Agents management',
    icon: Users,
    children: [
      { id: 'endpoints', label: 'Endpoints' },
      { id: 'groups', label: 'Groups' },
      { id: 'agent-configuration', label: 'Configuration' }
    ]
  },
  {
    id: 'server-management',
    label: 'Server management',
    icon: Server,
    children: [
      { id: 'server-status', label: 'Status' },
      { id: 'server-settings', label: 'Settings' },
      { id: 'server-logs', label: 'Logs' },
      { id: 'cluster', label: 'Cluster' },
      { id: 'statistics', label: 'Statistics' }
    ]
  },
  {
    id: 'indexer-management',
    label: 'Indexer management',
    icon: Database,
    children: [
      { id: 'index-patterns', label: 'Index Patterns' },
      { id: 'index-management', label: 'Index Management' }
    ]
  },
  {
    id: 'dashboard-management',
    label: 'Dashboard management',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboards', label: 'Dashboards' },
      { id: 'visualizations', label: 'Visualizations' }
    ]
  }
];

// Composant MenuItem
const MenuItem = ({ item, isActive, activeSubItem, onSelect, isExpanded, onToggle }) => {
  const Icon = item.icon;
  const hasChildren = item.children?.length > 0;
  const isItemActive = isActive || (item.children?.some(c => c.id === activeSubItem));

  return (
    <div>
      <button
        onClick={() => hasChildren ? onToggle(item.id) : onSelect(item.id)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
          ${isItemActive 
            ? 'bg-primary-500/20 text-primary-300' 
            : 'text-gray-400 hover:bg-surface-secondary hover:text-gray-200'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {hasChildren && (
          isExpanded 
            ? <ChevronDown size={16} className="text-gray-500" />
            : <ChevronRight size={16} className="text-gray-500" />
        )}
      </button>

      {/* Sous-menu */}
      {hasChildren && isExpanded && (
        <div className="ml-9 mt-1 space-y-1">
          {item.children.map(child => (
            <button
              key={child.id}
              onClick={() => onSelect(child.id, item.id)}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${activeSubItem === child.id 
                  ? 'text-primary-300 bg-primary-500/10' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-surface-secondary/50'
                }
              `}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Composant MainNavigation - Panneau latéral avec toggle Menu/Filtres
 * Un seul panneau qui affiche soit le menu, soit les filtres
 */
const MainNavigation = ({ 
  activePage, 
  activeSubPage, 
  onNavigate, 
  panelMode = PANEL_MODE.MENU,
  onPanelModeChange,
  // Props pour les filtres (passées au composant Filters intégré)
  filtersComponent
}) => {
  const [expandedItems, setExpandedItems] = useState(['home', 'agents-management']);

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelect = (pageId, parentId = null) => {
    onNavigate(pageId, parentId);
  };

  const isMenuMode = panelMode === PANEL_MODE.MENU;

  return (
    <nav className="sticky top-0 left-0 z-50 h-screen w-72 flex-shrink-0 bg-surface-primary/95 backdrop-blur-md border-r border-primary-500/20 flex flex-col">
      {/* Header avec logo */}
      <div className="p-4 border-b border-primary-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">Unicorns</h1>
            <p className="text-xs text-gray-500">Security Platform</p>
          </div>
        </div>
      </div>

      {/* Toggle buttons - Bascule entre Menu et Filtres */}
      <div className="p-2 border-b border-primary-500/20 flex gap-2">
        {/* Bouton Menu */}
        <button
          onClick={() => onPanelModeChange(PANEL_MODE.MENU)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            transition-all duration-200
            ${isMenuMode 
              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-secondary border border-transparent'
            }
          `}
        >
          <Menu size={18} />
          <span className="text-sm font-medium">Menu</span>
        </button>

        {/* Bouton Filtres */}
        <button
          onClick={() => onPanelModeChange(PANEL_MODE.FILTERS)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            transition-all duration-200
            ${!isMenuMode 
              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-secondary border border-transparent'
            }
          `}
        >
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Contenu - Menu ou Filtres */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isMenuMode ? (
          /* Menu de navigation */
          <div className="p-3 space-y-1">
            {MENU_CONFIG.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activePage === item.id}
                activeSubItem={activeSubPage}
                onSelect={handleSelect}
                isExpanded={expandedItems.includes(item.id)}
                onToggle={toggleExpand}
              />
            ))}
          </div>
        ) : (
          /* Panneau des filtres - rendu via props */
          <div className="p-4">
            {filtersComponent}
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
