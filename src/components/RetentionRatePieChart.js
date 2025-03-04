// src/components/RetentionRatePieChart.js
import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function RetentionRatePieChart({ retentionRate }) {
  const retainedValue = retentionRate;
  const churnedValue = 100 - retentionRate;

  const data = [
    { name: 'Retention Rate', value: retainedValue },
    { name: 'Predicted Churn Rate', value: churnedValue }
  ];

  const COLORS = ['#5A6ACF', '#F2383A'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="normal"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '150px',  // ensure vertical space
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '4px'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '1rem' }}>
        Retention Rate
      </h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: '#000', fontWeight: 'normal' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RetentionRatePieChart;
