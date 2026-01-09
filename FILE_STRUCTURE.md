# 📋 Liste Complète des Fichiers du Projet

## 🗂️ Structure Détaillée

### 📦 Fichiers de Configuration (Racine)

| Fichier | Description | Rôle |
|---------|-------------|------|
| `package.json` | Dépendances npm | Définit les packages et scripts |
| `vite.config.js` | Configuration Vite | Serveur de dev et build |
| `tailwind.config.js` | Configuration Tailwind | Personnalisation des styles |
| `postcss.config.js` | Configuration PostCSS | Traitement CSS |
| `.gitignore` | Git ignore | Fichiers à ne pas versionner |
| `index.html` | Point d'entrée HTML | Page principale |

---

### 📚 Documentation

| Fichier | Description | Pour Qui |
|---------|-------------|----------|
| `README.md` | Documentation principale | Tous |
| `QUICKSTART.md` | Guide de démarrage rapide | Débutants |
| `DEPLOYMENT.md` | Guide de déploiement | DevOps |
| `WAZUH_API_INTEGRATION.md` | Intégration API Wazuh | Développeurs |

---

### 🎨 Fichiers Source (src/)

#### 📄 Fichiers Principaux

| Fichier | Lignes | Rôle | Principes SOLID |
|---------|--------|------|-----------------|
| `src/main.jsx` | ~10 | Point d'entrée React | - |
| `src/App.jsx` | ~120 | Composant principal, orchestration | DIP, SRP |
| `src/index.css` | ~80 | Styles Tailwind globaux | - |

#### 🧩 Composants (src/components/)

| Fichier | Lignes | Description | Props Principales |
|---------|--------|-------------|-------------------|
| `Sidebar.jsx` | ~200 | Barre latérale avec filtres | filters, onToggleProvider, onServiceChange, onClearFilters |
| `Header.jsx` | ~50 | En-tête avec actions | onRefresh |
| `StatsCards.jsx` | ~70 | Cartes de statistiques | statistics, impactedProviders, topServices |
| `Charts.jsx` | ~100 | Graphiques (bar + donut) | timeSeriesData, providerDistribution |
| `AlertsTable.jsx` | ~150 | Tableau des alertes | alerts, currentPage, totalPages, onNextPage, onPreviousPage |

**Principe appliqué** : Single Responsibility - Chaque composant a UNE responsabilité claire

#### 🎣 Hooks Personnalisés (src/hooks/)

| Fichier | Lignes | Description | Retourne |
|---------|--------|-------------|----------|
| `useFilters.js` | ~80 | Gestion des filtres | { filters, toggleProvider, setService, clearFilters, ... } |
| `usePagination.js` | ~60 | Gestion de la pagination | { currentPage, currentItems, nextPage, previousPage, ... } |
| `useDataFetch.js` | ~50 | Chargement des données | { data, loading, error, refetch } |

**Principe appliqué** : Separation of Concerns - La logique est séparée de l'UI

#### 🔧 Services (src/services/)

| Fichier | Lignes | Description | Méthodes Principales |
|---------|--------|-------------|---------------------|
| `dataService.js` | ~150 | Gestion des données | getAlerts(), getStatistics(), getTimeSeriesData() |

**Principe appliqué** : Dependency Inversion - L'application dépend d'une abstraction, pas de l'implémentation

#### 📊 Données (src/data/)

| Fichier | Lignes | Description | Format |
|---------|--------|-------------|--------|
| `mockData.json` | ~100 | Données mockées | JSON avec alerts, statistics, timeSeriesData, etc. |

**Avantage** : Facilement remplaçable par l'API Wazuh

#### 📌 Constantes (src/constants/)

| Fichier | Lignes | Description | Contient |
|---------|--------|-------------|----------|
| `index.js` | ~60 | Constantes centralisées | CLOUD_PROVIDERS, SERVICES, REGIONS, API_ENDPOINTS |

**Principe appliqué** : Open/Closed - Facile d'ajouter de nouvelles valeurs sans modifier le code

---

## 🔄 Flux de Données

```
User Interaction
      ↓
   App.jsx (orchestration)
      ↓
   useFilters (gestion filtres)
      ↓
   dataService (récupération données)
      ↓
   mockData.json OU API Wazuh
      ↓
   Components (affichage)
```

---

## 📏 Statistiques du Projet

- **Total de fichiers** : 23
- **Total de lignes de code** : ~1,500
- **Composants React** : 5
- **Hooks personnalisés** : 3
- **Services** : 1
- **Fichiers de configuration** : 6
- **Documentation** : 4 fichiers

---

## 🎯 Dépendances Importantes

### Production
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.10.3",
  "lucide-react": "^0.294.0"
}
```

### Développement
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "tailwindcss": "^3.4.0",
  "vite": "^5.0.8"
}
```

---

## 🔑 Points Clés par Fichier

### App.jsx
- ✅ Composant principal
- ✅ Utilise tous les hooks
- ✅ Coordonne les composants
- ✅ Gère l'état global

### dataService.js
- ✅ Abstraction des données
- ✅ Mode mock/API basculable
- ✅ Filtrage des données
- ✅ Transformation des données Wazuh

### Sidebar.jsx
- ✅ Interface de filtrage
- ✅ 5 types de filtres
- ✅ Clear filters
- ✅ Responsive

### Charts.jsx
- ✅ Stacked bar chart
- ✅ Donut chart avec pourcentages
- ✅ Utilise Recharts
- ✅ Responsive

### AlertsTable.jsx
- ✅ Tableau avec badges
- ✅ Pagination intégrée
- ✅ Tri et affichage
- ✅ Hover effects

---

## 🚀 Comment Modifier Chaque Partie

### Ajouter un nouveau filtre
1. ✏️ `constants/index.js` - Ajouter la constante
2. ✏️ `hooks/useFilters.js` - Ajouter la fonction
3. ✏️ `components/Sidebar.jsx` - Ajouter l'UI
4. ✏️ `services/dataService.js` - Ajouter la logique de filtrage

### Modifier les couleurs
1. ✏️ `tailwind.config.js` - Palette de couleurs
2. ✏️ `src/index.css` - Classes personnalisées

### Changer les graphiques
1. ✏️ `components/Charts.jsx` - Modifier les composants Recharts
2. ✏️ `data/mockData.json` - Adapter les données

### Intégrer l'API Wazuh
1. ✏️ `services/dataService.js` - Ligne 149, passer à `false`
2. ✏️ Créer `.env.local` - Ajouter l'URL API
3. ✏️ `services/dataService.js` - Implémenter les appels API

---

## 🧪 Tests Suggérés

### Tests Unitaires (à implémenter)
- ✅ Hooks (useFilters, usePagination)
- ✅ Services (dataService)
- ✅ Composants (Sidebar, AlertsTable)

### Tests d'Intégration
- ✅ Filtrage + Pagination
- ✅ API + Affichage
- ✅ Navigation complète

### Tests E2E
- ✅ Parcours utilisateur complet
- ✅ Filtrage et visualisation
- ✅ Refresh des données

---

## 🔐 Sécurité

### Fichiers Sensibles
- ⚠️ `.env.local` - NE PAS COMMIT
- ⚠️ `.env.production` - NE PAS COMMIT
- ✅ `.gitignore` - Déjà configuré

### Best Practices Appliquées
- ✅ Variables d'environnement
- ✅ Pas de credentials en dur
- ✅ Services séparés
- ✅ Validation des données

---

## 📈 Performance

### Optimisations Appliquées
- ✅ Code splitting (Vite)
- ✅ Lazy loading possible
- ✅ Pagination des données
- ✅ Filtrage côté client

### Optimisations Futures
- 🔄 React.memo pour les composants
- 🔄 useMemo pour les calculs lourds
- 🔄 Virtualisation du tableau
- 🔄 Service Worker pour le cache

---

## 🎨 Design System

### Couleurs Principales
- **Primary** : #3B82F6 (Bleu)
- **Success** : #10B981 (Vert)
- **Warning** : #F59E0B (Orange)
- **Error** : #DC2626 (Rouge)
- **Neutral** : #6B7280 (Gris)

### Typographie
- **Font** : Inter (Google Fonts)
- **Sizes** : text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Spacing
- **Gap** : gap-2, gap-4, gap-6, gap-8
- **Padding** : p-2, p-4, p-6, p-8
- **Margin** : m-2, m-4, m-6, m-8

---

## ✅ Checklist de Vérification

Avant de déployer :

- [ ] `npm install` fonctionne
- [ ] `npm run dev` lance le serveur
- [ ] Dashboard s'affiche correctement
- [ ] Filtres fonctionnent
- [ ] Graphiques s'affichent
- [ ] Pagination fonctionne
- [ ] Responsive sur mobile
- [ ] `npm run build` réussit
- [ ] Pas de console.log en production
- [ ] Documentation à jour

---

## 🎓 Ressources d'Apprentissage

Pour mieux comprendre le code :

1. **React** : [react.dev](https://react.dev)
2. **Tailwind** : [tailwindcss.com](https://tailwindcss.com)
3. **Recharts** : [recharts.org](https://recharts.org)
4. **SOLID** : [Wikipedia SOLID](https://en.wikipedia.org/wiki/SOLID)
5. **Vite** : [vitejs.dev](https://vitejs.dev)
6. **Wazuh API** : [documentation.wazuh.com](https://documentation.wazuh.com)

---

**Projet créé avec ❤️ en suivant les meilleures pratiques**
