import React from 'react';
import { Activity, AlertTriangle, FileCheck, Shield } from 'lucide-react';
import { Card } from '../ui';

/**
 * SecurityOperations - Pages des opérations de sécurité
 */
const SecurityOperations = ({ activePage }) => {
  const pages = {
    'security-events': {
      title: 'Security Events',
      description: 'Real-time security event monitoring',
      icon: AlertTriangle
    },
    'integrity-monitoring': {
      title: 'Integrity Monitoring',
      description: 'System and file integrity monitoring',
      icon: Shield
    },
    'regulatory-compliance': {
      title: 'Regulatory Compliance',
      description: 'PCI DSS, GDPR, HIPAA compliance monitoring',
      icon: FileCheck
    }
  };

  const currentPage = pages[activePage] || pages['security-events'];
  const Icon = currentPage.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
          <Activity size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Security Operations</h1>
          <p className="text-gray-400 text-sm">{currentPage.description}</p>
        </div>
      </div>

      {/* Content */}
      <Card title={currentPage.title} icon={Icon}>
        <div className="text-center py-12 text-gray-500">
          <Icon size={64} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">{currentPage.title}</h3>
          <p className="text-sm mb-4">{currentPage.description}</p>
          <p className="text-xs">This feature is coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export { SecurityOperations };
export default SecurityOperations;
