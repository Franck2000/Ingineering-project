import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuration Vite
 * 
 * Les proxies sont nécessaires pour contourner les restrictions CORS.
 * Le navigateur bloque les requêtes cross-origin pour des raisons de sécurité.
 * Le proxy Vite agit comme intermédiaire : le navigateur communique avec localhost,
 * et Vite relaie les requêtes vers les serveurs Wazuh.
 */

// Configuration des serveurs Wazuh
const WAZUH_SERVERS = {
  manager: 'https://10.10.0.154:55000',  // API Manager (auth, agents)
  indexer: 'https://10.10.0.154:9200',   // OpenSearch (alertes)
};

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true,
    
    proxy: {
      // Proxy vers l'API Wazuh Manager
      '/api/wazuh': {
        target: WAZUH_SERVERS.manager,
        changeOrigin: true,
        secure: false,  // Accepte les certificats auto-signés
        rewrite: (path) => path.replace(/^\/api\/wazuh/, ''),
      },
      
      // Proxy vers l'Indexer OpenSearch  
      '/api/indexer': {
        target: WAZUH_SERVERS.indexer,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/indexer/, ''),
      }
    }
  }
})
