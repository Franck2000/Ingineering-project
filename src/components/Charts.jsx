import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

// Couleurs du thème cyber
const CYBER_COLORS = {
  purple: '#8b5cf6',
  pink: '#ec4899',
  violet: '#7c3aed',
  magenta: '#d946ef',
  indigo: '#6366f1',
  grid: 'rgba(139, 92, 246, 0.15)',
  axis: '#a78bfa',
};

/**
 * Composant Charts - Affiche les graphiques
 * Thème Cyber Security - Violet/Rose
 */
const Charts = ({ timeSeriesData, providerDistribution }) => {
  // Label personnalisé pour le donut chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '16px', fontWeight: '700' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip style
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md border border-primary-500/30 rounded-lg p-3" style={{backgroundColor: 'rgba(45, 31, 74, 0.95)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'}}>
          <p className="text-primary-200 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Stacked Bar Chart */}
      <div className="col-span-2 card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-primary-400" />
          <span className="text-lg font-bold text-gradient">
            Alerts Over Time
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CYBER_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="time"
              stroke={CYBER_COLORS.axis}
              style={{ fontSize: '0.85rem', fontWeight: '500' }}
              axisLine={{ stroke: CYBER_COLORS.grid }}
              tickLine={false}
            />
            <YAxis
              stroke={CYBER_COLORS.axis}
              style={{ fontSize: '0.85rem', fontWeight: '500' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Azure" stackId="a" fill={CYBER_COLORS.violet} radius={[0, 0, 0, 0]} />
            <Bar dataKey="AWS" stackId="a" fill={CYBER_COLORS.pink} radius={[0, 0, 0, 0]} />
            <Bar dataKey="GCP" stackId="a" fill={CYBER_COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={20} className="text-cyber-pink" />
          <span className="text-lg font-bold text-gradient">
            Distribution
          </span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={providerDistribution}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
              stroke="rgba(30, 16, 51, 0.5)"
              strokeWidth={2}
            >
              {providerDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || [CYBER_COLORS.purple, CYBER_COLORS.pink, CYBER_COLORS.violet][index % 3]} 
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: '#e9d5ff', fontSize: '0.9rem', fontWeight: '600' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
