# 🚀 Guide de Démarrage Rapide - Wazuh Dashboard

## ⚡ Installation en 3 Étapes

### 1️⃣ Installation des Dépendances

```bash
cd wazuh-project
npm install
```

### 2️⃣ Lancement du Projet

```bash
npm run dev
```

### 3️⃣ Ouvrir dans le Navigateur

Allez sur: **http://localhost:3000**

---

## 📁 Structure du Projet

```
wazuh-project/
├── src/
│   ├── components/        # Composants React (UI)
│   ├── hooks/            # Hooks personnalisés (logique)
│   ├── services/         # Services (API)
│   ├── data/             # Données JSON mockées
│   ├── constants/        # Constantes
│   ├── App.jsx          # Composant principal
│   └── main.jsx         # Point d'entrée
├── package.json
├── README.md             # Documentation complète
├── DEPLOYMENT.md         # Guide de déploiement
└── WAZUH_API_INTEGRATION.md  # Intégration API
```

---

## 🎯 Fonctionnalités Disponibles

✅ **Filtres Interactifs**
- Par Cloud Provider (AWS, Azure, GCP)
- Par Service (CloudTrail, Defender, etc.)
- Par Environnement (Prod, Preprod, Dev)
- Par Région

✅ **Visualisations**
- Graphique empilé des alertes dans le temps
- Donut chart de distribution des providers
- Cartes de statistiques

✅ **Tableau d'Alertes**
- Affichage détaillé
- Pagination fonctionnelle
- Badges colorés pour sévérité et statut

---

## 🔄 Passer des Données Mockées à l'API Réelle

### Option 1: Mode Développement

Dans `src/services/dataService.js` ligne 149 :

```javascript
// MODE MOCK (données de test)
export const dataService = new DataService(true);

// MODE API (données réelles Wazuh)
export const dataService = new DataService(false);
```

### Option 2: Variables d'Environnement

Créez `.env.local` :

```env
VITE_WAZUH_API_URL=https://your-wazuh-server:55000
VITE_MODE=development
```

---

## 📦 Commandes Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de dev

# Production
npm run build        # Build pour production
npm run preview      # Prévisualise le build

# Code Quality
npm run lint         # Vérifie le code
```

---

## 🎨 Personnalisation

### Modifier les Couleurs

`tailwind.config.js` ligne 7-18 :

```javascript
colors: {
  primary: {
    500: '#VotreCouleur',
    // ...
  }
}
```

### Modifier les Données Mockées

`src/data/mockData.json` - Éditez les alertes, statistiques, etc.

### Ajouter de Nouveaux Filtres

1. **Constantes** : `src/constants/index.js`
2. **Hook** : `src/hooks/useFilters.js`
3. **UI** : `src/components/Sidebar.jsx`
4. **Logique** : `src/services/dataService.js`

---

## 🔧 Résolution de Problèmes Rapides

### Le serveur ne démarre pas
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Les styles ne s'appliquent pas
```bash
npm run build
```

### Les graphiques ne s'affichent pas
```bash
npm install recharts --save
```

### Port 3000 déjà utilisé
Dans `vite.config.js`, changez le port :
```javascript
server: {
  port: 3001  // ou un autre port
}
```

---

## 📚 Documentation Complète

- **README.md** - Documentation générale
- **DEPLOYMENT.md** - Guide de déploiement
- **WAZUH_API_INTEGRATION.md** - Intégration API Wazuh

---

## 🏗️ Architecture SOLID

Le projet suit les **principes SOLID** pour un code :
- ✅ Maintenable
- ✅ Testable
- ✅ Extensible
- ✅ Réutilisable

### Exemples :

**Single Responsibility** : Chaque composant a UNE responsabilité
- `Sidebar.jsx` → Affiche les filtres
- `AlertsTable.jsx` → Affiche le tableau
- `dataService.js` → Gère les données

**Open/Closed** : Facile d'ajouter de nouveaux filtres sans modifier le code existant

**Dependency Inversion** : Les composants dépendent d'abstractions (hooks, services)

---

## 🎓 Points Clés à Retenir

1. **Données Mockées d'abord** : Testez avec JSON avant l'API
2. **Services Séparés** : La logique est dans `services/`, pas dans les composants
3. **Hooks Personnalisés** : Réutilisez la logique (filtres, pagination)
4. **Constants Centralisées** : Facile de modifier les configurations
5. **Tailwind CSS** : Classes utilitaires pour styling rapide

---

## 🤝 Besoin d'Aide ?

1. Consultez `README.md` pour la doc complète
2. Vérifiez les logs dans la console du navigateur
3. Testez avec les données mockées d'abord
4. Lisez les commentaires dans le code

---

## 🎉 Prochaines Étapes

1. ✅ Testez le dashboard avec les données mockées
2. ✅ Personnalisez les couleurs et le style
3. ✅ Configurez votre API Wazuh
4. ✅ Intégrez les données réelles
5. ✅ Déployez en production

---

**Bon codage ! 🚀**

Pour toute question, consultez la documentation complète dans README.md
