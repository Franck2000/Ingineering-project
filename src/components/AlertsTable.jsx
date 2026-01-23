import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SEVERITY_COLORS, STATUS_COLORS, CLOUD_PROVIDERS } from '../constants';

/**
 * Composant AlertsTable - Affiche le tableau des alertes
 * Suit le principe de responsabilité unique (Single Responsibility)
 */
const AlertsTable = ({ alerts, currentPage, totalPages, onNextPage, onPreviousPage, hasNextPage, hasPreviousPage }) => {
  // Trouve l'icône du provider
  const getProviderIcon = (providerName) => {
    const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
    return provider ? provider.icon : '●';
  };

  // Trouve la couleur du provider
  const getProviderColor = (providerName) => {
    const provider = CLOUD_PROVIDERS.find(p => p.name === providerName);
    return provider ? provider.color : '#6B7280';
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold text-gray-900 dark:text-white">Alerts Table</div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500"></div>
          <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500"></div>
          <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500"></div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Time
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Provider
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Service
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Severity
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Alert Message
              </th>
              <th className="px-3.5 py-3.5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <td className="px-3.5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {alert.time}
                </td>
                <td className="px-3.5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-xl"
                      style={{ color: getProviderColor(alert.provider) }}
                    >
                      {getProviderIcon(alert.provider)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {alert.provider}
                    </span>
                  </div>
                </td>
                <td className="px-3.5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {alert.service}
                </td>
                <td className="px-3.5 py-4">
                  <span
                    className="inline-block px-3.5 py-1.5 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: SEVERITY_COLORS[alert.severity] }}
                  >
                    {alert.severity}
                  </span>
                </td>
                <td className="px-3.5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {alert.message}
                </td>
                <td className="px-3.5 py-4">
                  <span
                    className="inline-block px-3.5 py-1.5 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: STATUS_COLORS[alert.status] }}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 items-center">
          <button
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsTable;
