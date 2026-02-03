import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import AlertsTable from './components/AlertsTable';
import LoginPage from './components/LoginPage';
import NewAlertsToast from './components/NewAlertsToast';
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
  const [pendingAlerts, setPendingAlerts] = useState([]); // Alertes en attente
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [availableSources, setAvailableSources] = useState([]);
  const [isLive, setIsLive] = useState(true); // Mode live activé par défaut
  const [newAlertsCount, setNewAlertsCount] = useState(0); // Compteur d'alertes en attente
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar mobile
  const [timeRange, setTimeRange] = useState({ type: 'relative', value: '24h', minutes: 1440, label: 'Last 24 hours' }); // Période temporelle
  
  // Référence pour garder trace des IDs actuels
  const currentAlertsRef = useRef(new Set());

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

  // Calculer les options de filtrage basées sur timeRange
  const getFilterOptions = () => {
    const now = new Date();
    if (timeRange.type === 'relative') {
      return {
        hours: Math.ceil(timeRange.minutes / 60),
        minutes: timeRange.minutes,
        fromDate: new Date(now.getTime() - timeRange.minutes * 60 * 1000).toISOString(),
        toDate: now.toISOString()
      };
    } else if (timeRange.type === 'absolute') {
      // Calculer les minutes entre les deux dates
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
      return {
        hours: Math.ceil(diffMinutes / 60),
        minutes: diffMinutes,
        fromDate: timeRange.start,
        toDate: timeRange.end
      };
    }
    return { 
      hours: 24,
      minutes: 1440,
      fromDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      toDate: now.toISOString()
    };
  };

  // Combiner timeRange et filtres sidebar pour une utilisation unifiée
  const getCombinedFilters = () => {
    const timeFilters = getFilterOptions();
    return {
      ...timeFilters,
      providers: filters.providers,
      severity: filters.severity,
      service: filters.service,
      environment: filters.environment,
      region: filters.region,
      source: filters.source
    };
  };

  // Chargement des données avec les hooks personnalisés
  const { data: statistics, refetch: refetchStats } = useDataFetch(
    () => dataService.getStatistics(getCombinedFilters()),
    [timeRange, filters]
  );

  const { data: timeSeriesData, refetch: refetchTimeSeries } = useDataFetch(
    () => dataService.getTimeSeriesData(getCombinedFilters()),
    [timeRange, filters]
  );

  const { data: providerDistribution, refetch: refetchDistribution } = useDataFetch(
    () => dataService.getProviderDistribution(getCombinedFilters()),
    [timeRange, filters]
  );

  const { data: impactedProviders, refetch: refetchProviders } = useDataFetch(
    () => dataService.getImpactedProviders(getCombinedFilters()),
    [timeRange, filters]
  );

  const { data: topServices, refetch: refetchServices } = useDataFetch(
    () => dataService.getTopServices(getCombinedFilters()),
    [timeRange, filters]
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

  // Appliquer le mode sombre/clair au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Chargement initial et polling des alertes en temps réel
  useEffect(() => {
    const loadAlerts = async (isPolling = false) => {
      try {
        // Utiliser les filtres combinés (timeRange + sidebar)
        const combinedFilters = getCombinedFilters();
        
        const data = await dataService.getAlerts(combinedFilters);
        
        // Si c'est un polling, vérifier les nouvelles alertes
        if (isPolling) {
          const newAlerts = data.filter(a => !currentAlertsRef.current.has(a.id));
          
          if (newAlerts.length > 0) {
            // Stocker les nouvelles alertes en attente (ne pas rafraîchir l'affichage)
            setPendingAlerts(prev => [...newAlerts, ...prev]);
            setNewAlertsCount(prev => prev + newAlerts.length);
          }
          return; // Ne pas mettre à jour l'affichage lors du polling
        }
        
        // Chargement initial ou manuel : mettre à jour l'affichage
        // Les données sont déjà filtrées par dataService.getAlerts()
        setFilteredAlerts(data);
        setLastUpdate(new Date());
        setNewAlertsCount(0);
        setPendingAlerts([]);
        
        // Mettre à jour la référence des IDs
        currentAlertsRef.current = new Set(data.map(a => a.id));
        
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
    if (POLLING_CONFIG.ALERTS_INTERVAL > 0 && isLive) {
      const pollingInterval = setInterval(() => {
        dataService.invalidateCache(); // Forcer le rafraîchissement
        loadAlerts(true); // C'est un polling
      }, POLLING_CONFIG.ALERTS_INTERVAL);

      // Cleanup à la destruction du composant
      return () => clearInterval(pollingInterval);
    }
  }, [isLive, timeRange, filters]); // Dépendance sur isLive, timeRange et filters

  // Fonction pour charger les alertes en attente
  const loadPendingAlerts = () => {
    if (pendingAlerts.length > 0) {
      // Fusionner les alertes en attente avec les alertes actuelles
      const mergedAlerts = [...pendingAlerts, ...filteredAlerts];
      // Dédupliquer et trier par date
      const uniqueAlerts = Array.from(
        new Map(mergedAlerts.map(a => [a.id, a])).values()
      ).sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time));
      
      setFilteredAlerts(uniqueAlerts);
      setLastUpdate(new Date());
      
      // Mettre à jour la référence des IDs
      currentAlertsRef.current = new Set(uniqueAlerts.map(a => a.id));
      
      // Reset
      setPendingAlerts([]);
      setNewAlertsCount(0);
    }
  };

  // Ignorer les alertes en attente
  const dismissPendingAlerts = () => {
    // Ajouter les IDs des alertes ignorées à la référence pour ne pas les recompter
    pendingAlerts.forEach(a => currentAlertsRef.current.add(a.id));
    setPendingAlerts([]);
    setNewAlertsCount(0);
  };

  // Réinitialiser la page lors du changement de filtres
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
    const combinedFilters = getCombinedFilters();
    const data = await dataService.getAlerts(combinedFilters);
    setFilteredAlerts(data);
    setLastUpdate(new Date());
    
    // Rafraîchir tous les graphiques et cartes
    refetchStats();
    refetchTimeSeries();
    refetchDistribution();
    refetchProviders();
    refetchServices();
  };

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300 relative overflow-hidden"
      style={darkMode 
        ? {background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1f4a 50%, #1e1033 100%)'}
        : {background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 50%, #fce7f3 100%)'}
      }
    >
      {/* Decorative orbs - only in dark mode */}
      {darkMode && (
        <>
          <div className="cyber-orb w-96 h-96 -top-48 -right-48 opacity-40 hidden md:block"></div>
          <div className="cyber-orb-pink w-80 h-80 bottom-20 left-1/4 opacity-30 hidden md:block"></div>
          <div className="cyber-orb w-64 h-64 top-1/3 right-1/4 opacity-20 hidden md:block"></div>
        </>
      )}
      {/* Light mode decorative elements */}
      {!darkMode && (
        <>
          <div className="absolute w-96 h-96 -top-48 -right-48 opacity-30 blur-3xl hidden md:block" style={{background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'}}></div>
          <div className="absolute w-80 h-80 bottom-20 left-1/4 opacity-20 blur-3xl hidden md:block" style={{background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)'}}></div>
        </>
      )}
      
      {/* Overlay mobile pour fermer la sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative z-10">
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
          onMenuClick={() => setSidebarOpen(true)}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
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

      {/* Toast notification pour les nouvelles alertes */}
      <NewAlertsToast 
        count={newAlertsCount}
        onLoadAlerts={loadPendingAlerts}
        onDismiss={dismissPendingAlerts}
      />
    </div>
  );
}

export default App;