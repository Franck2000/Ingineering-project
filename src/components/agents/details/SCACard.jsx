import React from 'react';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, ProgressBar } from '../../ui/index.jsx';
import { formatDate } from '../../../utils/formatters';

// Couleurs pour le score
const getScoreColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

// Composant pour afficher une policy SCA
const SCAPolicy = ({ policy }) => {
  const passRate = policy.total_checks > 0 
    ? ((policy.pass / policy.total_checks) * 100).toFixed(1) 
    : 0;

  return (
    <div className="p-4 bg-surface-secondary/50 rounded-lg border border-primary-500/10 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-gray-200 font-medium">{policy.name}</h4>
          <p className="text-xs text-gray-500">{policy.policy_id}</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${
            policy.score >= 80 ? 'text-green-400' : 
            policy.score >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {policy.score}%
          </span>
        </div>
      </div>

      {/* Barre de progression */}
      <ProgressBar 
        value={policy.pass} 
        max={policy.total_checks} 
        label="Compliance" 
        color={getScoreColor(policy.score)} 
      />

      {/* Stats des checks */}
      <div className="flex gap-4 text-sm mt-2">
        <div className="flex items-center gap-1">
          <CheckCircle size={14} className="text-green-400" />
          <span className="text-gray-300">{policy.pass}</span>
          <span className="text-gray-500">passed</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle size={14} className="text-red-400" />
          <span className="text-gray-300">{policy.fail}</span>
          <span className="text-gray-500">failed</span>
        </div>
        {policy.invalid > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span className="text-gray-300">{policy.invalid}</span>
            <span className="text-gray-500">invalid</span>
          </div>
        )}
      </div>

      {/* Dernière date de scan */}
      <p className="text-xs text-gray-500 mt-2">
        Dernier scan: {formatDate(policy.end_scan)}
      </p>
    </div>
  );
};

const SCACard = ({ scaData }) => {
  if (!scaData?.length) {
    return (
      <Card title="SCA - Security Configuration Assessment" icon={ShieldCheck}>
        <p className="text-gray-500 text-center py-4">Aucun scan SCA disponible</p>
      </Card>
    );
  }

  // Calculer le score global
  const totalPass = scaData.reduce((acc, p) => acc + (p.pass || 0), 0);
  const totalChecks = scaData.reduce((acc, p) => acc + (p.total_checks || 0), 0);
  const globalScore = totalChecks > 0 ? ((totalPass / totalChecks) * 100).toFixed(1) : 0;

  return (
    <Card title="SCA - Security Configuration Assessment" icon={ShieldCheck}>
      {/* Score global */}
      <div className="flex items-center justify-between mb-4 p-3 bg-surface-tertiary/50 rounded-lg">
        <span className="text-gray-300">Score Global</span>
        <span className={`text-2xl font-bold ${
          globalScore >= 80 ? 'text-green-400' : 
          globalScore >= 60 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {globalScore}%
        </span>
      </div>

      {/* Liste des policies */}
      <div className="max-h-80 overflow-y-auto">
        {scaData.map((policy, i) => (
          <SCAPolicy key={policy.policy_id || i} policy={policy} />
        ))}
      </div>
    </Card>
  );
};

export default SCACard;
