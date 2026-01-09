# Guide d'Intégration API Wazuh

Ce guide vous aide à connecter le dashboard aux données réelles de Wazuh.

## 🔑 Authentification Wazuh

### Obtenir un Token JWT

```javascript
// src/services/wazuhAuth.js

/**
 * Service d'authentification Wazuh
 */
class WazuhAuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_WAZUH_API_URL || 'https://localhost:55000';
    this.token = null;
  }

  /**
   * Authentification et obtention du token
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/security/user/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.token = data.data.token;
      
      // Stocker le token de manière sécurisée
      sessionStorage.setItem('wazuh_token', this.token);
      
      return this.token;
    } catch (error) {
      console.error('Wazuh authentication error:', error);
      throw error;
    }
  }

  /**
   * Récupérer le token stocké
   */
  getToken() {
    if (!this.token) {
      this.token = sessionStorage.getItem('wazuh_token');
    }
    return this.token;
  }

  /**
   * Déconnexion
   */
  logout() {
    this.token = null;
    sessionStorage.removeItem('wazuh_token');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export const wazuhAuth = new WazuhAuthService();
```

## 🔄 Adapter le DataService pour Wazuh

### Mettre à jour dataService.js

```javascript
// src/services/dataService.js

import { wazuhAuth } from './wazuhAuth';

class DataService {
  constructor(useMockData = true) {
    this.useMockData = useMockData;
    this.baseUrl = import.meta.env.VITE_WAZUH_API_URL || 'https://localhost:55000';
  }

  /**
   * Headers pour les requêtes API
   */
  getHeaders() {
    const token = wazuhAuth.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Récupère les alertes depuis Wazuh
   */
  async getAlerts(filters = {}) {
    if (this.useMockData) {
      // Utilise les données mockées
      return this._filterAlerts(mockData.alerts, filters);
    }

    try {
      // Construction des paramètres de requête
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
        sort: '-timestamp'
      });

      // Ajouter les filtres
      if (filters.providers && filters.providers.length > 0) {
        params.append('q', `agent.labels.cloud_provider=${filters.providers.join(',')}`);
      }

      if (filters.service) {
        params.append('q', `rule.groups=${filters.service}`);
      }

      const response = await fetch(
        `${this.baseUrl}/security_events?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformer les données Wazuh vers notre format
      return this._transformWazuhAlerts(data.data.affected_items);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Transforme les alertes Wazuh vers notre format
   */
  _transformWazuhAlerts(wazuhAlerts) {
    return wazuhAlerts.map(alert => ({
      id: alert.id,
      time: new Date(alert.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      provider: this._extractProvider(alert),
      service: this._extractService(alert),
      severity: this._mapSeverity(alert.rule.level),
      message: alert.rule.description,
      status: this._determineStatus(alert),
      environment: alert.agent.labels?.environment || 'Unknown',
      region: alert.agent.labels?.region || 'Unknown'
    }));
  }

  /**
   * Extrait le provider depuis les labels de l'agent
   */
  _extractProvider(alert) {
    return alert.agent.labels?.cloud_provider || 
           alert.data?.aws?.accountId ? 'AWS' :
           alert.data?.azure?.subscriptionId ? 'Azure' :
           alert.data?.gcp?.projectId ? 'GCP' : 'Unknown';
  }

  /**
   * Extrait le service depuis les groupes de règles
   */
  _extractService(alert) {
    const groups = alert.rule.groups || [];
    
    if (groups.includes('cloudtrail')) return 'CloudTrail';
    if (groups.includes('azure-defender')) return 'Defender';
    if (groups.includes('audit')) return 'Audit Logs';
    if (groups.includes('activity')) return 'Activity Logs';
    if (groups.includes('security-hub')) return 'Security Hub';
    
    return 'Other';
  }

  /**
   * Mappe les niveaux Wazuh vers nos sévérités
   */
  _mapSeverity(level) {
    if (level >= 12) return 'Critical';
    if (level >= 8) return 'High';
    if (level >= 4) return 'Medium';
    return 'Low';
  }

  /**
   * Détermine le statut de l'alerte
   */
  _determineStatus(alert) {
    // Logique personnalisée selon vos besoins
    if (alert.rule.level >= 12) return 'New';
    if (alert.data?.action === 'blocked') return 'Resolved';
    return 'Investigating';
  }

  /**
   * Récupère les statistiques
   */
  async getStatistics() {
    if (this.useMockData) {
      return mockData.statistics;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/overview/alerts`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        totalAlerts: data.data.total || 0,
        criticalAlerts: data.data.critical || 0,
        blockedIPs: data.data.blocked_ips || 0,
        activeThreats: data.data.active_threats || 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Récupère les données temporelles
   */
  async getTimeSeriesData() {
    if (this.useMockData) {
      return mockData.timeSeriesData;
    }

    try {
      // Requête pour obtenir les alertes des dernières 24h par heure
      const endDate = new Date();
      const startDate = new Date(endDate - 24 * 60 * 60 * 1000);

      const response = await fetch(
        `${this.baseUrl}/security_events/summary?timeframe=24h&interval=4h`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformer les données en format pour le graphique
      return this._transformTimeSeriesData(data.data);
    } catch (error) {
      console.error('Error fetching time series:', error);
      // Retourner les données mockées en cas d'erreur
      return mockData.timeSeriesData;
    }
  }

  /**
   * Transforme les données temporelles de Wazuh
   */
  _transformTimeSeriesData(data) {
    // Logique de transformation selon le format de votre API
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      AWS: item.aws_count || 0,
      Azure: item.azure_count || 0,
      GCP: item.gcp_count || 0
    }));
  }
}

// Pour passer en mode API réelle, changez true en false
export const dataService = new DataService(true);
export default DataService;
```

## 🔐 Variables d'Environnement

### Créer .env.local

```env
# URL de l'API Wazuh
VITE_WAZUH_API_URL=https://your-wazuh-server:55000

# Credentials (NE PAS commit en production!)
VITE_WAZUH_USERNAME=your_username
VITE_WAZUH_PASSWORD=your_password

# Mode (development ou production)
VITE_MODE=development
```

### Créer .env.production

```env
VITE_WAZUH_API_URL=https://your-production-wazuh-server:55000
VITE_MODE=production
```

## 🔄 Mapping des Données Wazuh

### Structure des Alertes Wazuh

```json
{
  "id": "1704811935.234567",
  "timestamp": "2026-01-09T14:32:15.234Z",
  "rule": {
    "id": "5710",
    "level": 12,
    "description": "Multiple web authentication failures",
    "groups": ["authentication_failed", "web"]
  },
  "agent": {
    "id": "001",
    "name": "web-server-prod-01",
    "ip": "10.0.1.45",
    "labels": {
      "cloud_provider": "AWS",
      "environment": "production",
      "region": "us-east-1"
    }
  },
  "data": {
    "srcip": "185.220.101.45",
    "dstip": "10.0.1.45",
    "url": "/admin/login"
  }
}
```

### Notre Format

```json
{
  "id": "alert_001",
  "time": "12:45 PM",
  "provider": "AWS",
  "service": "CloudTrail",
  "severity": "Critical",
  "message": "Unauthorized API call detected",
  "status": "New",
  "environment": "Prod",
  "region": "us-east-1"
}
```

## 🔍 Filtres Wazuh

### Paramètres de Requête

```javascript
// Exemples de filtres
const filters = {
  // Filtrer par niveau de règle
  'rule.level': 'gte:10',
  
  // Filtrer par date
  'timestamp': 'gte:2026-01-09T00:00:00Z',
  
  // Recherche dans les logs
  'search': 'sql injection',
  
  // Tri
  'sort': '-timestamp', // décroissant
  
  // Pagination
  'offset': 0,
  'limit': 100,
  
  // Filtrer par agent
  'agent.id': '001,002,003',
  
  // Filtrer par groupe de règles
  'rule.groups': 'web,attack'
};
```

## 🧪 Tests de l'Intégration

### Script de Test

```javascript
// src/tests/testWazuhAPI.js

import { dataService } from '../services/dataService';
import { wazuhAuth } from '../services/wazuhAuth';

async function testWazuhConnection() {
  try {
    console.log('🔐 Testing Wazuh authentication...');
    await wazuhAuth.login('your_username', 'your_password');
    console.log('✅ Authentication successful!');

    console.log('📊 Testing alerts retrieval...');
    const alerts = await dataService.getAlerts();
    console.log(`✅ Retrieved ${alerts.length} alerts`);

    console.log('📈 Testing statistics...');
    const stats = await dataService.getStatistics();
    console.log('✅ Statistics:', stats);

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Exécuter le test
testWazuhConnection();
```

## 🚀 Migration Progressive

### Étape 1 : Tester avec données mockées
```javascript
export const dataService = new DataService(true); // Mock
```

### Étape 2 : Tester avec API en développement
```javascript
export const dataService = new DataService(
  import.meta.env.VITE_MODE === 'development'
);
```

### Étape 3 : Passer en production
```javascript
export const dataService = new DataService(false); // API réelle
```

## 🔒 Sécurité

### Ne JAMAIS :
- ❌ Commit les credentials dans le code
- ❌ Stocker le mot de passe en clair
- ❌ Exposer l'API sans authentification

### TOUJOURS :
- ✅ Utiliser des variables d'environnement
- ✅ Utiliser HTTPS en production
- ✅ Implémenter un refresh token
- ✅ Gérer l'expiration du token

### Gestion du Token Expiré

```javascript
async function fetchWithAuth(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${wazuhAuth.getToken()}`
      }
    });

    // Token expiré
    if (response.status === 401) {
      // Re-authentifier
      await wazuhAuth.login(username, password);
      
      // Retry la requête
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${wazuhAuth.getToken()}`
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

## 📚 Ressources

- [Documentation API Wazuh](https://documentation.wazuh.com/current/user-manual/api/reference.html)
- [Guide d'authentification](https://documentation.wazuh.com/current/user-manual/api/getting-started.html)
- [Exemples de requêtes](https://documentation.wazuh.com/current/user-manual/api/examples.html)

## ❓ FAQ

**Q: Comment gérer les erreurs de CORS?**
A: Configurez votre serveur Wazuh pour accepter les requêtes depuis votre domaine, ou utilisez un proxy.

**Q: L'API est lente, comment optimiser?**
A: Utilisez la pagination, le caching, et limitez les requêtes avec des filtres.

**Q: Comment débugger les requêtes API?**
A: Utilisez les DevTools du navigateur, Network tab, et ajoutez des console.log dans le service.

---

Bonne intégration ! 🎉
