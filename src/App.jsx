import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import AlertsTable from './components/AlertsTable';
import LoginPage from './components/LoginPage';
import { useFilters } from './hooks/useFilters';
import { usePagination } from './hooks/usePagination';
import { useDataFetch } from './hooks/useDataFetch';
import { dataService } from './services/dataService';
import { wazuhAuth } from './services/wazuhAuth';
import { POLLING_CONFIG } from './config/api.config';

/**
 * Composant principal de l'application
 * Suit le principe de composition et d'orchestration
 * Gère la coordination entre les différents composants
 */
function App() {
  // État pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return wazuhAuth.isAuthenticated();
  });

  // État pour le mode sombre
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // État local pour les données
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [availableSources, setAvailableSources] = useState([]);
  const [isLive, setIsLive] = useState(true); // Mode live activé par défaut
  const [newAlertsCount, setNewAlertsCount] = useState(0); // Compteur d'alertes en attente

  // Gestion des filtres
  const {
    filters,
    toggleProvider,
    setService,
    setSeverity,
    setEnvironment,
    setRegion,
    setSource,
    clearFilters
  } = useFilters();

  // Chargement des données avec les hooks personnalisés
  const { data: statistics, refetch: refetchStats } = useDataFetch(
    () => dataService.getStatistics(),
    []
  );

  const { data: timeSeriesData } = useDataFetch(
    () => dataService.getTimeSeriesData(),
    []
  );

  const { data: providerDistribution } = useDataFetch(
    () => dataService.getProviderDistribution(),
    []
  );

  const { data: impactedProviders } = useDataFetch(
    () => dataService.getImpactedProviders(),
    []
  );

  const { data: topServices } = useDataFetch(
    () => dataService.getTopServices(),
    []
  );

  // Pagination des alertes filtrées
  const {
    currentPage,
    totalPages,
    currentItems: currentAlerts,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    resetPage
  } = usePagination(filteredAlerts);

  // Appliquer le mode sombre au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Chargement initial et polling des alertes en temps réel
  useEffect(() => {
    const loadAlerts = async (isPolling = false) => {
      try {
        const data = await dataService.getAlerts();
        
        // Si c'est un polling et mode pause, compter les nouvelles alertes
        if (isPolling && !isLive) {
          const currentIds = new Set(filteredAlerts.map(a => a.id));
          const newAlerts = data.filter(a => !currentIds.has(a.id));
          if (newAlerts.length > 0) {
            setNewAlertsCount(prev => prev + newAlerts.length);
          }
          return; // Ne pas mettre à jour les données en mode pause
        }
        
        setFilteredAlerts(data);
        setLastUpdate(new Date());
        setNewAlertsCount(0); // Reset le compteur
        
        // Extraire les sources uniques des alertes
        const sources = [...new Set(data.map(alert => alert.environment).filter(Boolean))];
        setAvailableSources(sources.sort());
      } catch (error) {
        console.error('Erreur chargement alertes:', error);
      }
    };

    // Chargement initial
    loadAlerts(false);

    // Polling automatique pour le temps réel (désactivé si interval = 0)
    if (POLLING_CONFIG.ALERTS_INTERVAL > 0) {
      const pollingInterval = setInterval(() => {
        dataService.invalidateCache(); // Forcer le rafraîchissement
        loadAlerts(true); // C'est un polling
      }, POLLING_CONFIG.ALERTS_INTERVAL);

      // Cleanup à la destruction du composant
      return () => clearInterval(pollingInterval);
    }
  }, [isLive]); // Dépendance sur isLive pour réagir au changement de mode

  // Application des filtres
  useEffect(() => {
    const applyFilters = async () => {
      const filtered = await dataService.getAlerts(filters);
      setFilteredAlerts(filtered);
    };
    applyFilters();
  }, [filters]);

  // Réinitialiser la page uniquement lors du changement de FILTRES (pas du polling)
  useEffect(() => {
    // On ne reset que si les filtres ont changé
    if (Object.values(filters).some(v => v !== 'all' && v !== null && (Array.isArray(v) ? v.length > 0 : true))) {
      resetPage();
    }
  }, [filters, resetPage]);

  // Gérer la connexion réussie
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    wazuhAuth.logout();
    setIsAuthenticated(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Handler pour le refresh manuel
  const handleRefresh = async () => {
    dataService.invalidateCache();
    const data = await dataService.getAlerts();
    setFilteredAlerts(data);
    setLastUpdate(new Date());
    refetchStats();
  };

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1f4a 50%, #1e1033 100%)'}}>
      {/* Decorative orbs */}
      <div className="cyber-orb w-96 h-96 -top-48 -right-48 opacity-40"></div>
      <div className="cyber-orb-pink w-80 h-80 bottom-20 left-1/4 opacity-30"></div>
      <div className="cyber-orb w-64 h-64 top-1/3 right-1/4 opacity-20"></div>
      
      {/* Sidebar */}
      <Sidebar
        filters={filters}
        onToggleProvider={toggleProvider}
        onServiceChange={setService}
        onSeverityChange={setSeverity}
        onEnvironmentChange={setEnvironment}
        onRegionChange={setRegion}
        onSourceChange={setSource}
        onClearFilters={clearFilters}
        availableSources={availableSources}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto relative z-10">
        {/* Header */}
        <Header 
          onRefresh={handleRefresh} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          username={wazuhAuth.getUsername()}
          lastUpdate={lastUpdate}
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
          newAlertsCount={newAlertsCount}
        />

        {/* Stats Cards */}
        {statistics && impactedProviders && topServices && (
          <StatsCards
            statistics={statistics}
            impactedProviders={impactedProviders}
            topServices={topServices}
          />
        )}

        {/* Charts */}
        {timeSeriesData && providerDistribution && (
          <Charts
            timeSeriesData={timeSeriesData}
            providerDistribution={providerDistribution}
          />
        )}

        {/* Alerts Table */}
        <AlertsTable
          alerts={currentAlerts}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPreviousPage={previousPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </div>
    </div>
  );
}

export default App;