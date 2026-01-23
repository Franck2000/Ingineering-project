import React, { useState } from 'react';
import { ChevronDown, User, Moon, Sun } from 'lucide-react';

// ✅ importe tes fonctions Wazuh
import {
  loginWazuh,
  getAgents,
  getFIMLogs,
  getThreatLogs
} from '../services/wazuhService';

/**
 * Composant Header - Affiche le titre et les actions du dashboard
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const Header = ({ onRefresh, darkMode, toggleDarkMode }) => {
  // --- mini state pour tests ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // champs rapides (tu peux changer direct ici)
  const [user, setUser] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [agentId, setAgentId] = useState('001');

  const run = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fn();
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e?.response?.data ?? e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('wazuh_token');
    setResult({ ok: true, message: 'Token supprimé du localStorage' });
    setError(null);
  };

  const token = localStorage.getItem('wazuh_token');

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
          Cloud Security Monitoring Dashboard
        </h1>

        <div className="flex gap-3 items-center">
          <button className="btn-secondary">Last 24h</button>
          <button className="btn-secondary">Live</button>
          <button onClick={onRefresh} className="btn-primary">
            Refresh
          </button>
          <button className="btn-secondary">Save View</button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Merit Desired
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Administrator
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* ✅ ZONE DE TEST RAPIDE */}
      {/* ===================== */}
      <div className="mt-6 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</label>
            <input
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input
              type="password"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Agent ID</label>
            <input
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              disabled={loading}
              onClick={() => run(() => loginWazuh(user, password))}
              className="btn-primary"
              title="Test loginWazuh()"
            >
              {loading ? '...' : 'Test Login'}
            </button>

            <button
              disabled={loading}
              onClick={() => run(() => getAgents())}
              className="btn-secondary"
              title="Test getAgents()"
            >
              Test Agents
            </button>

            <button
              disabled={loading}
              onClick={() => run(() => getFIMLogs(agentId))}
              className="btn-secondary"
              title="Test getFIMLogs(agentId)"
            >
              Test FIM Logs
            </button>

            <button
              disabled={loading}
              onClick={() => run(() => getThreatLogs())}
              className="btn-secondary"
              title="Test getThreatLogs()"
            >
              Test Threat Logs
            </button>

            <button
              onClick={clearToken}
              className="btn-secondary"
              title="Supprime wazuh_token du localStorage"
            >
              Clear Token
            </button>
          </div>

          <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            Token: {token ? '✅ présent' : '❌ absent'}
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-4">
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
              <div className="font-semibold mb-1">Erreur</div>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}

          {result && (
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                Résultat
              </div>
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {!result && !error && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Clique sur un bouton pour tester les appels Wazuh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
