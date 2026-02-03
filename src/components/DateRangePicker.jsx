import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, X } from 'lucide-react';

/**
 * Options de périodes prédéfinies
 */
const TIME_RANGES = [
  { label: 'Last 15 min', value: '15m', minutes: 15 },
  { label: 'Last 30 min', value: '30m', minutes: 30 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 3 hours', value: '3h', minutes: 180 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 12 hours', value: '12h', minutes: 720 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 2 days', value: '2d', minutes: 2880 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 },
  { label: 'Last 30 days', value: '30d', minutes: 43200 },
];

/**
 * Composant DateRangePicker - Sélecteur de période temporelle
 */
const DateRangePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' ou 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const dropdownRef = useRef(null);

  // Trouver le label de la période sélectionnée
  const selectedRange = TIME_RANGES.find(r => r.value === value) || TIME_RANGES[6]; // Default: 24h

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Appliquer une période prédéfinie
  const handleQuickSelect = (range) => {
    onChange({
      type: 'relative',
      value: range.value,
      minutes: range.minutes,
      label: range.label
    });
    setIsOpen(false);
  };

  // Appliquer une période personnalisée
  const handleCustomApply = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      
      if (start < end) {
        onChange({
          type: 'absolute',
          start: start.toISOString(),
          end: end.toISOString(),
          label: `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
        });
        setIsOpen(false);
      }
    }
  };

  // Formater la date pour l'input datetime-local
  const formatDateForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

  // Initialiser les dates personnalisées
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setCustomEnd(formatDateForInput(now));
    setCustomStart(formatDateForInput(yesterday));
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary text-xs md:text-sm px-2 md:px-4 flex items-center gap-1 md:gap-2"
      >
        <Clock size={14} className="text-primary-400" />
        <span className="hidden sm:inline">{selectedRange.label}</span>
        <span className="sm:hidden">24h</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 backdrop-blur-md border border-primary-500/30 rounded-lg shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: 'rgba(45, 31, 74, 0.98)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}
        >
          {/* Tabs */}
          <div className="flex border-b border-primary-500/30">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'quick' 
                  ? 'text-primary-300 bg-primary-500/20 border-b-2 border-primary-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock size={14} className="inline mr-2" />
              Rapide
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'custom' 
                  ? 'text-primary-300 bg-primary-500/20 border-b-2 border-primary-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Calendar size={14} className="inline mr-2" />
              Personnalisé
            </button>
          </div>

          {/* Contenu Quick */}
          {activeTab === 'quick' && (
            <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleQuickSelect(range)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    value === range.value
                      ? 'bg-primary-500/30 text-primary-200'
                      : 'text-gray-300 hover:bg-primary-500/10 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}

          {/* Contenu Custom */}
          {activeTab === 'custom' && (
            <div className="p-4">
              <div className="space-y-4">
                {/* Date de début */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Date de début
                  </label>
                  <input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-secondary/80 border border-primary-500/30 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Date de fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Date de fin
                  </label>
                  <input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-secondary/80 border border-primary-500/30 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCustomApply}
                    className="flex-1 btn-primary text-sm"
                    disabled={!customStart || !customEnd}
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
