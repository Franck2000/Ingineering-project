# Guide de Déploiement - Wazuh Security Dashboard

## 📦 Build de Production

### Étape 1 : Préparer l'environnement

```bash
# Installer les dépendances de production
npm ci --production=false
```

### Étape 2 : Build

```bash
# Créer le build de production
npm run build
```

Cela génère un dossier `dist/` avec les fichiers optimisés.

## 🚀 Options de Déploiement

### Option 1 : Netlify (Recommandé pour les débutants)

1. **Via l'interface Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Connectez votre repository GitHub
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Déployez !

2. **Via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Option 2 : Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Option 3 : Serveur Apache/Nginx

1. **Build le projet**
```bash
npm run build
```

2. **Copier les fichiers sur le serveur**
```bash
scp -r dist/* user@server:/var/www/html/wazuh-dashboard/
```

3. **Configuration Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/wazuh-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

4. **Configuration Apache (.htaccess)**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### Option 4 : Docker

1. **Créer un Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Créer nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Build et run**
```bash
docker build -t wazuh-dashboard .
docker run -p 8080:80 wazuh-dashboard
```

## 🔐 Configuration de Production

### Variables d'Environnement

Créez un fichier `.env.production` :

```env
VITE_API_URL=https://your-wazuh-api.com
VITE_API_TOKEN=your_secure_token
VITE_ENVIRONMENT=production
```

### Sécurité

1. **Activer HTTPS**
   - Utilisez Let's Encrypt pour un certificat gratuit
   - Configurez la redirection HTTP -> HTTPS

2. **Headers de sécurité**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

3. **CORS**
Si votre API Wazuh est sur un domaine différent :
```javascript
// Dans dataService.js
const response = await fetch(API_ENDPOINTS.ALERTS, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  credentials: 'include' // Si nécessaire
});
```

## ⚡ Optimisations de Performance

### 1. Lazy Loading des composants

```javascript
// Dans App.jsx
import { lazy, Suspense } from 'react';

const Charts = lazy(() => import('./components/Charts'));

// Utilisation
<Suspense fallback={<div>Loading...</div>}>
  <Charts />
</Suspense>
```

### 2. Code Splitting

Vite le fait automatiquement, mais vous pouvez optimiser :

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
})
```

### 3. Compression

```bash
# Installer vite-plugin-compression
npm install vite-plugin-compression --save-dev
```

```javascript
// vite.config.js
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression()
  ]
})
```

## 🔍 Monitoring et Analytics

### Google Analytics

```javascript
// src/utils/analytics.js
export const initGA = () => {
  // Configuration Google Analytics
};

export const logPageView = () => {
  // Log page view
};
```

### Sentry pour le suivi des erreurs

```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

## 📊 Tests avant déploiement

### Checklist

- [ ] Tous les tests passent
- [ ] Build réussit sans erreurs
- [ ] Les données mockées fonctionnent
- [ ] Les filtres fonctionnent
- [ ] La pagination fonctionne
- [ ] Les graphiques s'affichent
- [ ] Responsive design testé
- [ ] Performance acceptable (Lighthouse > 90)
- [ ] Pas de console.log en production
- [ ] Variables d'environnement configurées

### Tester le build localement

```bash
npm run build
npm run preview
```

## 🔄 CI/CD avec GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.API_URL }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      with:
        args: deploy --prod --dir=dist
```

## 🐛 Debugging en Production

### Activer les Source Maps

```javascript
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true // Attention : augmente la taille du build
  }
})
```

### Logs

```javascript
// src/utils/logger.js
export const logger = {
  info: (message, data) => {
    if (import.meta.env.MODE === 'development') {
      console.log(message, data);
    }
  },
  error: (message, error) => {
    console.error(message, error);
    // Envoyer à Sentry en production
  }
};
```

## 📈 Métriques de Performance

Objectifs recommandés :
- First Contentful Paint (FCP) : < 1.8s
- Time to Interactive (TTI) : < 3.8s
- Cumulative Layout Shift (CLS) : < 0.1
- Largest Contentful Paint (LCP) : < 2.5s

## 🔄 Mise à jour

```bash
# 1. Pull les dernières modifications
git pull origin main

# 2. Installer les nouvelles dépendances
npm install

# 3. Build
npm run build

# 4. Déployer
# (selon votre méthode choisie ci-dessus)
```

## 📞 Support

En cas de problème pendant le déploiement :
1. Vérifiez les logs de build
2. Testez localement avec `npm run preview`
3. Vérifiez les variables d'environnement
4. Consultez la documentation de votre plateforme

---

Bon déploiement ! 🚀
