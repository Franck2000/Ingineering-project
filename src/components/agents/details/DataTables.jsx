import React from 'react';
import { Shield, Package } from 'lucide-react';
import { Card, SeverityBadge } from '../../ui/index.jsx';
import { countBySeverity } from '../../../utils/formatters';

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];

// Tableau des vulnérabilités
export const VulnerabilitiesTable = ({ vulnerabilities }) => {
  if (!vulnerabilities?.length) return null;

  const vulnStats = countBySeverity(vulnerabilities);

  return (
    <Card title={`Vulnérabilités (${vulnerabilities.length})`} icon={Shield}>
      {/* Stats des vulnérabilités */}
      <div className="flex gap-4 mb-4">
        {SEVERITY_ORDER.map(sev => (
          <div key={sev} className="flex items-center gap-2">
            <SeverityBadge severity={sev} />
            <span className="text-gray-300 font-bold">{vulnStats[sev] || 0}</span>
          </div>
        ))}
      </div>
      
      {/* Tableau */}
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-primary">
            <tr className="border-b border-primary-500/20">
              <th className="text-left py-2 px-3 text-gray-400">CVE</th>
              <th className="text-left py-2 px-3 text-gray-400">Sévérité</th>
              <th className="text-left py-2 px-3 text-gray-400">Package</th>
              <th className="text-left py-2 px-3 text-gray-400">Version</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.slice(0, 20).map((vuln, i) => (
              <tr key={i} className="border-b border-primary-500/10 hover:bg-primary-500/5">
                <td className="py-2 px-3 text-primary-300 font-mono">{vuln.cve}</td>
                <td className="py-2 px-3"><SeverityBadge severity={vuln.severity} /></td>
                <td className="py-2 px-3 text-gray-300">{vuln.name}</td>
                <td className="py-2 px-3 text-gray-400 font-mono">{vuln.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Tableau des packages
export const PackagesTable = ({ packages }) => (
  <Card title={`Packages Installés (${packages?.length || 0})`} icon={Package}>
    <div className="overflow-x-auto max-h-64">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-primary">
          <tr className="border-b border-primary-500/20">
            <th className="text-left py-2 px-3 text-gray-400">Nom</th>
            <th className="text-left py-2 px-3 text-gray-400">Version</th>
            <th className="text-left py-2 px-3 text-gray-400">Architecture</th>
          </tr>
        </thead>
        <tbody>
          {packages?.slice(0, 30).map((pkg, i) => (
            <tr key={i} className="border-b border-primary-500/10 hover:bg-primary-500/5">
              <td className="py-2 px-3 text-gray-200">{pkg.name}</td>
              <td className="py-2 px-3 text-gray-400 font-mono">{pkg.version}</td>
              <td className="py-2 px-3 text-gray-500">{pkg.architecture}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
