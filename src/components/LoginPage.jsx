import React, { useState } from 'react';
import { wazuhAuth } from '../services/wazuhAuth';

/**
 * Composant de page de connexion
 * Style inspiré du design Otake avec gradient rose/violet
 */
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Authentification avec Wazuh
      await wazuhAuth.login(email, password);
      
      // Si "Remember me" est coché, stocker dans localStorage
      if (rememberMe) {
        localStorage.setItem('wazuh_remember', 'true');
      }
      
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fond avec gradient */}
      <div className="login-background">
        <div className="login-grid"></div>
      </div>

      {/* Contenu de la page */}
      <div className="login-content">
        {/* Badge */}
        <div className="login-badge">
          Wazuh SIEM
        </div>

        {/* Titre */}
        <h1 className="login-title">
          Welcome to SIEM Dashboard!
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Message d'erreur */}
          {error && (
            <div className="login-error">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Champ Email/Username */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email / Username
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="admin@wazuh.local"
              required
              autoComplete="username"
            />
          </div>

          {/* Champ Password */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember me & Forgot password */}
          <div className="login-options">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot">
              Forgot password?
            </a>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="login-spinner">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connexion...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Info supplémentaire */}
        <p className="login-info">
          Connect to your Wazuh SIEM server to access the dashboard
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
