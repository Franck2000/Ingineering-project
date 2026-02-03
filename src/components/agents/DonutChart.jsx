import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="backdrop-blur-md border border-primary-500/30 rounded-lg p-3"
         style={{ backgroundColor: 'rgba(45, 31, 74, 0.95)' }}>
      <p className="text-white font-semibold">
        {payload[0].name}: <span className="text-primary-300">{payload[0].value}</span>
      </p>
    </div>
  );
};

const DonutChart = ({ data, title }) => {
  if (!data?.length) {
    return (
      <div className="card flex items-center justify-center h-52">
        <span className="text-gray-500">Aucune donnée</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-4">
        <span className="px-4 py-1.5 bg-surface-secondary border border-primary-500/30 rounded-full text-xs font-bold text-primary-300 uppercase tracking-wider">
          {title}
        </span>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="ml-4 space-y-1.5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-300">{item.name}</span>
              <span className="text-gray-500">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
