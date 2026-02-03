import React, { useState } from 'react';
import { X, Eye, Copy, Check } from 'lucide-react';
import { SEVERITY_COLORS } from '../constants';

/**
 * Fonction utilitaire pour aplatir un objet imbriqué
 */
const flattenObject = (obj, prefix = '') => {
  const result = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      result.push({ key: fullKey, value: 'N/A', type: 'null' });
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenObject(value, fullKey));
    } else if (Array.isArray(value)) {
      result.push({ 
        key: fullKey, 
        value: value.length > 0 ? value.join(', ') : '[]', 
        type: 'array' 
      });
    } else {
      result.push({ key: fullKey, value: String(value), type: typeof value });
    }
  }
  
  return result;
};

/**
 * Catégoriser les champs par section
 */
const categorizeFields = (fields) => {
  const categories = {
    'Informations générales': [],
    'Agent': [],
    'Règle': [],
    'MITRE ATT&CK': [],
    'Données': [],
    'Autres': []
  };

  fields.forEach(field => {
    if (field.key.startsWith('agent')) {
      categories['Agent'].push(field);
    } else if (field.key.startsWith('rule.mitre')) {
      categories['MITRE ATT&CK'].push(field);
    } else if (field.key.startsWith('rule')) {
      categories['Règle'].push(field);
    } else if (field.key.startsWith('data') || field.key === 'full_log') {
      categories['Données'].push(field);
    } else if (['id', 'timestamp', 'time', 'provider', 'service', 'severity', 'status', 'environment', 'region', 'description', 'message'].includes(field.key)) {
      categories['Informations générales'].push(field);
    } else {
      categories['Autres'].push(field);
    }
  });

  return categories;
};

/**
 * Composant pour afficher une catégorie de champs
 */
const FieldCategory = ({ category, fields, copiedField, onCopy }) => {
  if (fields.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-primary-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
        {category}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-tertiary/50">
              <th className="px-4 py-2 text-left text-xs font-bold text-primary-200 border-b border-primary-500/30 w-1/3">
                Champ
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-primary-200 border-b border-primary-500/30">
                Valeur
              </th>
              <th className="px-4 py-2 text-center text-xs font-bold text-primary-200 border-b border-primary-500/30 w-16">
                Copier
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr 
                key={field.key}
                className={`hover:bg-primary-500/10 transition-colors ${idx % 2 === 0 ? 'bg-surface-secondary/30' : ''}`}
              >
                <td className="px-4 py-2.5 text-sm font-mono text-primary-300 border-b border-primary-500/10">
                  {field.key}
                </td>
                <td className="px-4 py-2.5 text-sm text-gray-300 border-b border-primary-500/10 break-all">
                  {field.value.length > 200 ? (
                    <details className="cursor-pointer">
                      <summary className="text-primary-400 hover:text-primary-300">
                        {field.value.substring(0, 200)}...
                      </summary>
                      <pre className="mt-2 p-2 bg-surface-tertiary/50 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {field.value}
                      </pre>
                    </details>
                  ) : (
                    <span className={field.type === 'array' ? 'text-cyber-pink' : ''}>
                      {field.value}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center border-b border-primary-500/10">
                  <button
                    onClick={() => onCopy(field.value, field.key)}
                    className="p-1.5 rounded hover:bg-primary-500/20 text-gray-500 hover:text-primary-300 transition-all"
                    title="Copier la valeur"
                  >
                    {copiedField === field.key ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Modal pour afficher les détails complets d'un log
 */
const LogDetailsModal = ({ alert, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!alert) return null;

  const allFields = flattenObject(alert);
  const categorizedFields = categorizeFields(allFields);

  const copyToClipboard = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] bg-surface-card border border-primary-500/30 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface-tertiary/90 backdrop-blur-md border-b border-primary-500/30">
          <div className="flex items-center gap-3">
            <Eye size={22} className="text-primary-400" />
            <h2 className="text-lg font-bold text-gradient">Détails du Log</h2>
            <span 
              className="px-2 py-1 rounded text-xs font-bold"
              style={{ 
                backgroundColor: `${SEVERITY_COLORS[alert.severity]}20`,
                color: SEVERITY_COLORS[alert.severity],
                border: `1px solid ${SEVERITY_COLORS[alert.severity]}40`
              }}
            >
              {alert.severity}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-primary-500/20 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
          {Object.entries(categorizedFields).map(([category, fields]) => (
            <FieldCategory 
              key={category}
              category={category}
              fields={fields}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          ))}

          {/* Full Log brut */}
          {alert.full_log && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-primary-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-pink"></span>
                Log Brut Complet
              </h3>
              <pre className="p-4 bg-surface-tertiary/50 rounded-lg text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap border border-primary-500/20">
                {alert.full_log}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
