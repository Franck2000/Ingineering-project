import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import { Card } from '../../ui/index.jsx';

const COLORS = {
  Low: '#3B82F6',
  Medium: '#F59E0B',
  High: '#F97316',
  Critical: '#EF4444',
  total: '#8B5CF6'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="backdrop-blur-md border border-primary-500/30 rounded-lg p-3"
         style={{ backgroundColor: 'rgba(45, 31, 74, 0.95)' }}>
      <p className="text-gray-300 text-sm mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const EventTimelineChart = ({ data, total, severityBreakdown }) => {
  if (!data?.length) {
    return (
      <Card title="Évolution des Événements (24h)" icon={Activity}>
        <p className="text-gray-500 text-center py-8">Aucun événement</p>
      </Card>
    );
  }

  return (
    <Card title="Évolution des Événements (24h)" icon={Activity}>
      {/* Stats rapides */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        {Object.entries(severityBreakdown).map(([sev, count]) => (
          <div key={sev} className="text-center">
            <p className="text-xl font-bold" style={{ color: COLORS[sev] }}>{count}</p>
            <p className="text-xs text-gray-400">{sev}</p>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.15)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#a78bfa" 
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="#a78bfa" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Critical" stackId="a" fill={COLORS.Critical} radius={[0, 0, 0, 0]} />
            <Bar dataKey="High" stackId="a" fill={COLORS.High} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Medium" stackId="a" fill={COLORS.Medium} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Low" stackId="a" fill={COLORS.Low} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default EventTimelineChart;
