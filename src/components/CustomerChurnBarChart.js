// src/components/CustomerChurnBarChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function CustomerChurnBarChart({ data, totalCustomers, predictedChurn }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,               // allow horizontal expansion
        minHeight: '350px',    // ensure vertical space
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '1rem'
      }}
    >
      {/* Header + summary */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '0.5rem' }}>
          Total Customers
        </h3>
        <p style={{ fontSize: '2rem', fontWeight: 'normal', marginBottom: '0.5rem' }}>
          {totalCustomers}
        </p>
        <p style={{ fontSize: '1rem', fontWeight: 'normal', color: '#000000' }}>
          Predicted Churn <span style={{ color: '#F2383A' }}>{predictedChurn}</span>
        </p>
      </div>

      {/* Chart area */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#737B8B" />
            <YAxis stroke="#737B8B" domain={[0, 'dataMax + 10']} />
            <Tooltip />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: '#000000', fontWeight: 'normal' }}>{value}</span>
              )}
            />
            <Bar dataKey="total" fill="#5A6ACF" name="Customer Count" />
            <Bar dataKey="churn" fill="#F2383A" name="Predicted Churn" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CustomerChurnBarChart;
