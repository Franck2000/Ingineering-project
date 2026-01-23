import axios from 'axios';

// --- CONFIGURATION ---
// On tape sur Nginx, pas directement sur Wazuh
const MANAGER_URL = '/api-manager';
const INDEXER_URL = '/api-indexer';

// --- AUTHENTIFICATION (Manager) ---
export const loginWazuh = async (user, password) => {
    const basicAuth = 'Basic ' + btoa(`${user}:${password}`);
    const response = await axios.get(`${MANAGER_URL}/security/user/authenticate`, {
        params: { raw: 'true' },
        headers: { 'Authorization': basicAuth }
    });
    // On sauvegarde le token pour les futurs appels
    localStorage.setItem('wazuh_token', response.data);
    return response.data;
};

// Helper pour avoir les headers
const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('wazuh_token')}` }
});

// --- MODULE 1 : ÉTAT DU PARC (Manager) ---
export const getAgents = async () => {
    const response = await axios.get(`${MANAGER_URL}/agents`, getHeaders());
    return response.data.data.items; // Retourne la liste des agents
};

export const getFIMLogs = async (agentId) => {
    // Récupère les 10 derniers fichiers modifiés
    const response = await axios.get(`${MANAGER_URL}/syscheck/${agentId}/items`, {
        ...getHeaders(),
        params: { limit: 10, sort: '-mtime', type: 'file' }
    });
    return response.data.data.items;
};

// --- MODULE 2 : THREAT HUNTING (Indexer/OpenSearch) ---
export const getThreatLogs = async () => {
    // Authentification base de données (souvent admin:admin)
    const dbAuth = 'Basic ' + btoa('admin:mrvLbuuVJV2emWg?8agaz6KeNu6Pa1iJ'); 
    
    // La requête complexe pour chercher les alertes
    const query = {
        size: 20,
        sort: [{ timestamp: { order: "desc" } }],
        query: {
            bool: {
                filter: [
                    { range: { "rule.level": { gte: 5 } } } // Seulement niveau 5+
                ]
            }
        }
    };

    const response = await axios.post(`${INDEXER_URL}/wazuh-alerts-*/_search`, query, {
        headers: { 
            'Authorization': dbAuth,
            'Content-Type': 'application/json'
        }
    });
    
    // Extraction des logs propres
    return response.data.hits.hits.map(hit => hit._source);
};
