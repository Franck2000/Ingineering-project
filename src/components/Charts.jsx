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

/**
 * Composant Charts - Affiche les graphiques
 * Suit le principe de responsabilité unique (Single Responsibility)
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

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Stacked Bar Chart */}
      <div className="col-span-2 card">
        <div className="text-lg font-bold text-gray-900 mb-6">
          Alerts Over Time
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              style={{ fontSize: '0.85rem', fontWeight: '500' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '0.85rem', fontWeight: '500' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            />
            <Bar dataKey="Azure" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="AWS" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="GCP" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart */}
      <div className="card">
        <ResponsiveContainer width="100%" height={370}>
          <PieChart>
            <Pie
              data={providerDistribution}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={130}
              paddingAngle={0}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {providerDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="square"
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>
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
