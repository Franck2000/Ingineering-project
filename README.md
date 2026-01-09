# Wazuh Security Dashboard

Un dashboard moderne de surveillance de sécurité cloud intégrant Wazuh, construit avec React, Tailwind CSS et Recharts.

## 🚀 Fonctionnalités

- 📊 **Graphiques en temps réel** : Visualisation des alertes avec graphiques empilés et donut charts
- 🔍 **Filtrage avancé** : Filtres par provider cloud, service, sévérité, environnement et région
- 📋 **Tableau d'alertes** : Affichage détaillé avec pagination
- 🎨 **Interface moderne** : Design épuré avec Tailwind CSS
- 🏗️ **Architecture SOLID** : Code maintenable et extensible
- 📦 **Données modulaires** : JSON mockées facilement remplaçables par l'API Wazuh

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

## 🔧 Installation

1. **Cloner ou créer le projet**
```bash
cd wazuh-project
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

Le dashboard sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
wazuh-project/
├── src/
│   ├── components/         # Composants React réutilisables
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── StatsCards.jsx
│   │   ├── Charts.jsx
│   │   └── AlertsTable.jsx
│   ├── hooks/             # Hooks personnalisés
│   │   ├── useFilters.js
│   │   ├── usePagination.js
│   │   └── useDataFetch.js
│   ├── services/          # Services pour la gestion des données
│   │   └── dataService.js
│   ├── data/              # Données mockées
│   │   └── mockData.json
│   ├── constants/         # Constantes de l'application
│   │   └── index.js
│   ├── App.jsx           # Composant principal
│   ├── main.jsx          # Point d'entrée
│   └── index.css         # Styles Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 Architecture SOLID

Le projet suit les principes SOLID :

### 1. **Single Responsibility Principle (SRP)**
- Chaque composant a une responsabilité unique
- Séparation claire entre UI, logique et données

### 2. **Open/Closed Principle (OCP)**
- Les constantes sont centralisées et faciles à étendre
- Les composants acceptent des props pour la personnalisation

### 3. **Liskov Substitution Principle (LSP)**
- Les hooks peuvent être remplacés sans casser le code
- Les services suivent une interface cohérente

### 4. **Interface Segregation Principle (ISP)**
- Les composants ne dépendent que des props nécessaires
- Les hooks exposent uniquement les fonctions utiles

### 5. **Dependency Inversion Principle (DIP)**
- L'App dépend d'abstractions (hooks, services)
- Facile de remplacer les données mockées par l'API réelle

## 🔄 Migration vers l'API Wazuh

Pour passer des données mockées à l'API Wazuh réelle :

### Étape 1 : Modifier le service
Dans `src/services/dataService.js`, changez le constructeur :

```javascript
// Passer de mock à API réelle
export const dataService = new DataService(false); // false = API réelle
```

### Étape 2 : Configurer les endpoints
Dans `src/constants/index.js`, mettez à jour les endpoints API :

```javascript
export const API_ENDPOINTS = {
  ALERTS: 'https://your-wazuh-api:55000/security_events',
  STATISTICS: 'https://your-wazuh-api:55000/overview/alerts',
  TIME_SERIES: 'https://your-wazuh-api:55000/time-series',
  PROVIDER_DISTRIBUTION: 'https://your-wazuh-api:55000/distribution'
};
```

### Étape 3 : Ajouter l'authentification
Modifiez les appels fetch dans `dataService.js` :

```javascript
const response = await fetch(API_ENDPOINTS.ALERTS, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});
```

### Étape 4 : Adapter le mapping des données
Si la structure de l'API Wazuh diffère, ajustez le mapping dans le service :

```javascript
// Exemple de transformation
const transformWazuhAlert = (wazuhAlert) => ({
  id: wazuhAlert.id,
  time: new Date(wazuhAlert.timestamp).toLocaleTimeString(),
  provider: wazuhAlert.agent.cloud_provider,
  service: wazuhAlert.rule.service,
  severity: mapSeverity(wazuhAlert.rule.level),
  message: wazuhAlert.rule.description,
  status: wazuhAlert.status
});
```

## 🎨 Personnalisation

### Modifier les couleurs
Éditez `tailwind.config.js` :

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#VotreCouleur',
        // ...
      }
    }
  }
}
```

### Ajouter de nouveaux filtres
1. Ajoutez la constante dans `src/constants/index.js`
2. Mettez à jour le hook `useFilters` dans `src/hooks/useFilters.js`
3. Ajoutez le filtre dans `Sidebar.jsx`
4. Mettez à jour la méthode `_filterAlerts` dans `dataService.js`

## 📊 Format des Données

### Alertes (mockData.json)
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

### Statistiques
```json
{
  "totalAlerts": 1245,
  "criticalAlerts": 256,
  "blockedIPs": 142,
  "activeThreats": 18
}
```

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 🐛 Résolution de Problèmes

### Les graphiques ne s'affichent pas
Vérifiez que Recharts est bien installé :
```bash
npm install recharts
```

### Erreur de Tailwind
Régénérez les classes :
```bash
npm run build
```

### Les données ne se chargent pas
Vérifiez la console du navigateur et assurez-vous que `mockData.json` est accessible.

## 📝 Bonnes Pratiques

1. **Toujours tester les filtres** avant de déployer
2. **Valider les données** de l'API Wazuh
3. **Gérer les erreurs** avec try/catch
4. **Optimiser les performances** avec React.memo si nécessaire
5. **Documenter les changements** dans le code

## 🤝 Contribution

Pour contribuer :
1. Créez une branche pour votre fonctionnalité
2. Suivez les principes SOLID
3. Testez vos modifications
4. Créez une pull request

## 📄 Licence

Ce projet est sous licence MIT.

## 🔗 Ressources

- [Documentation Wazuh](https://documentation.wazuh.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Principes SOLID](https://en.wikipedia.org/wiki/SOLID)

## 👥 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Wazuh
- Vérifiez les logs du serveur

---

Créé avec ❤️ pour la surveillance de sécurité cloud
