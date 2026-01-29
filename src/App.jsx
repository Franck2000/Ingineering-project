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
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Gestion des filtres avec le hook personnalisé - SANS FILTRES INITIAUX
  const {
    filters,
    toggleProvider,
    setService,
    setSeverity,
    setEnvironment,
    setRegion,
    setSource,
    clearFilters
  } = useFilters({
    providers: [],  // Vide par défaut
    service: '',    // Vide par défaut
    region: '',     // Vide par défaut
    source: ''      // Vide par défaut
  });

  // Sources disponibles extraites des alertes
  const [availableSources, setAvailableSources] = useState([]);

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
    const loadAlerts = async () => {
      try {
        const data = await dataService.getAlerts();
        setAlerts(data);
        setFilteredAlerts(data);
        setLastUpdate(new Date());
        
        // Extraire les sources uniques des alertes (agent.name ou environment)
        const sources = [...new Set(data.map(alert => alert.environment).filter(Boolean))];
        setAvailableSources(sources.sort());
      } catch (error) {
        console.error('Erreur chargement alertes:', error);
      }
    };

    // Chargement initial
    loadAlerts();

    // Polling automatique pour le temps réel
    const pollingInterval = setInterval(() => {
      dataService.invalidateCache(); // Forcer le rafraîchissement
      loadAlerts();
    }, POLLING_CONFIG.ALERTS_INTERVAL);

    // Cleanup à la destruction du composant
    return () => clearInterval(pollingInterval);
  }, []);

  // Application des filtres
  useEffect(() => {
    const applyFilters = async () => {
      const filtered = await dataService.getAlerts(filters);
      setFilteredAlerts(filtered);
    };
    applyFilters();
  }, [filters]);

  // Réinitialiser la page lors du changement de filtres
  useEffect(() => {
    resetPage();
  }, [filteredAlerts, resetPage]);

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
    dataService.invalidateCache(); // Invalider le cache pour forcer le refresh
    const data = await dataService.getAlerts();
    setAlerts(data);
    setFilteredAlerts(data);
    setLastUpdate(new Date());
    refetchStats();
  };

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <Header 
          onRefresh={handleRefresh} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          username={wazuhAuth.getUsername()}
          lastUpdate={lastUpdate}
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