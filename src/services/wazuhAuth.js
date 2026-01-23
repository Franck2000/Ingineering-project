/**
 * Service d'authentification Wazuh
 * Gère la connexion et le token JWT
 */
class WazuhAuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_WAZUH_API_URL || 'https://localhost:55000';
    this.token = null;
  }

  /**
   * Authentification et obtention du token
   * @param {string} username - Nom d'utilisateur Wazuh
   * @param {string} password - Mot de passe
   * @returns {Promise<string>} Token JWT
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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Échec de l\'authentification');
      }

      const data = await response.json();
      this.token = data.data.token;
      
      // Stocker le token de manière sécurisée
      sessionStorage.setItem('wazuh_token', this.token);
      sessionStorage.setItem('wazuh_user', username);
      
      return this.token;
    } catch (error) {
      console.error('Erreur d\'authentification Wazuh:', error);
      throw error;
    }
  }

  /**
   * Récupérer le token stocké
   * @returns {string|null} Token JWT ou null
   */
  getToken() {
    if (!this.token) {
      this.token = sessionStorage.getItem('wazuh_token');
    }
    return this.token;
  }

  /**
   * Récupérer le nom d'utilisateur
   * @returns {string|null} Nom d'utilisateur ou null
   */
  getUsername() {
    return sessionStorage.getItem('wazuh_user');
  }

  /**
   * Déconnexion
   */
  logout() {
    this.token = null;
    sessionStorage.removeItem('wazuh_token');
    sessionStorage.removeItem('wazuh_user');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Rafraîchir le token (si nécessaire)
   * @returns {Promise<string>} Nouveau token
   */
  async refreshToken() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token disponible');
    }

    try {
      const response = await fetch(`${this.baseUrl}/security/user/authenticate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.logout();
        throw new Error('Token expiré');
      }

      const data = await response.json();
      this.token = data.data.token;
      sessionStorage.setItem('wazuh_token', this.token);
      
      return this.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

export const wazuhAuth = new WazuhAuthService();
