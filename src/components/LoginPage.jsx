import React, { useState } from 'react';
import { wazuhAuth } from '../services/wazuhAuth';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * Composant de page de connexion
 * Thème Cyber Security - Unicorns
 */
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Fond avec gradient et effets */}
      <div className="login-background">
        <div className="login-grid"></div>
        {/* Orbes décoratives */}
        <div className="cyber-orb w-96 h-96 -top-20 -left-20"></div>
        <div className="cyber-orb-pink w-80 h-80 bottom-10 right-10"></div>
        <div className="cyber-orb w-64 h-64 top-1/2 right-1/4"></div>
      </div>

      {/* Contenu de la page */}
      <div className="login-content">
        {/* Logo Unicorns */}
        <img 
          src={logo} 
          alt="Unicorns" 
          className="w-32 h-32 mb-6 object-contain animate-float" 
          style={{filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6))'}} 
        />

        {/* Badge */}
        <div className="login-badge">
          🦄 Unicorns SIEM
        </div>

        {/* Titre */}
        <h1 className="login-title">
          Unicorns Security Dashboard
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
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400/60" />
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input pl-11"
                placeholder="admin@wazuh.local"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Champ Password */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input pl-11 pr-11"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400/60 hover:text-primary-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
          <span>Secure Connection</span>
        </div>

        {/* Info supplémentaire */}
        <p className="login-info">
          🔒 Connect to your Wazuh SIEM server with encrypted credentials
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
