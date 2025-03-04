// src/components/PredictedChurnRate.js
import React from 'react';

function PredictedChurnRate({ data = [] }) {
  // We'll assume data is an array of 4 objects, e.g.:
  // [ { name: "Salesforce", total: 100, churn: 4 }, ... ]

  return (
    <div
      style={{
        width: '320px',
        minHeight: '220px',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '4px'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '0.3rem' }}>
        Predicted Churn Rate
      </h3>
      <p style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#808080', marginBottom: '1rem' }}>
        By Individual Data Sources Provided
      </p>

      {/*
        We'll arrange the circles in a 2x2 grid:
          display: grid;
          gridTemplateColumns: repeat(2, auto);
          gap: 1rem (horizontal & vertical)
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, auto)',
          gap: '1.5rem',
          justifyContent: 'center'
        }}
      >
        {data.map((source, idx) => {
          const churnRate = source.total > 0 ? (source.churn / source.total) * 100 : 0;
          // Example sizing formula: circleSize = 40 + (churnRate * 2)
          const circleSize = 40 + (churnRate * 2);
          const churnRateStr = `${Math.round(churnRate)}%`;

          return (
            <div
              key={idx}
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: '50%',
                backgroundColor: '#F2383A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              {/* e.g. "8% Hubspot" */}
              <div style={{ textAlign: 'center' }}>
                {churnRateStr} <br />
                {source.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PredictedChurnRate;
