// src/components/Feedback.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// A simple component to render the rating text and stars for average satisfaction.
function StarRating({ rating, max = 10 }) {
  // Round the rating to the nearest whole number.
  const filledStars = Math.round(rating);
  const emptyStars = max - filledStars;
  const starStyle = { color: '#FFD700', fontSize: '2rem', marginRight: '0.2rem' };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Display the rating as X/10 above the stars */}
      <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#121212', marginBottom: '0.5rem' }}>
        {rating}/{max}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {Array(filledStars)
          .fill(0)
          .map((_, i) => (
            <span key={`filled-${i}`} style={starStyle}>★</span>
          ))
        }
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <span key={`empty-${i}`} style={{ ...starStyle, color: '#E0E0E0' }}>☆</span>
          ))
        }
      </div>
    </div>
  );
}

// A simple component to display the NPS value.
function NPSDisplay({ nps }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#121212' }}>
        {nps}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'underline', color: '#121212' }}>
        NPS
      </div>
    </div>
  );
}

function Feedback() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET endpoint for processed feedback metrics.
  const API_ENDPOINT = "https://hwqmh5mjo2.execute-api.us-east-2.amazonaws.com/prod/feedback-metrics";

  useEffect(() => {
    axios.get(API_ENDPOINT)
      .then((response) => {
        console.log("Full API response:", response);
        if (response.data && response.data.metrics) {
          setMetrics(response.data.metrics);
        } else {
          setError("No 'metrics' field found in API response.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feedback metrics:", err);
        setError("Error fetching feedback metrics");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading feedback metrics...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!metrics) return <p>No feedback metrics available.</p>;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', minHeight: '80vh' }}>
      <h1 style={{ fontWeight: 'normal', fontSize: '2rem', marginBottom: '1rem' }}>Feedback Metrics</h1>
      <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #C8CBD9' }} />

      {/* Container for the two sections side by side with a vertical divider */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2rem',
          marginBottom: '2rem',
          alignItems: 'stretch'
        }}
      >
        {/* Left section: Average Satisfaction as stars with rating text */}
        <div style={{ flex: 1, height: '300px', backgroundColor: '#fff', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 'normal', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            Average Satisfaction
          </h3>
          <StarRating rating={metrics.averageSatisfaction} />
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', backgroundColor: '#C8CBD9', height: '250px' }} />

        {/* Right section: NPS display */}
        <div style={{ flex: 1, height: '300px', backgroundColor: '#fff', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 'normal', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            Net Promoter Score (NPS)
          </h3>
          <NPSDisplay nps={metrics.netPromoterScore} />
        </div>
      </div>

      {/* Horizontal divider below the charts */}
      <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #C8CBD9' }} />

      {/* Text-based metrics, left-aligned */}
      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', color: '#121212' }}>
        <p><strong>Pre-Intervention Responses:</strong> {metrics.preInterventionCount}</p>
        <p><strong>Post-Intervention Responses:</strong> {metrics.postInterventionCount}</p>
        <p><strong>Total Responses:</strong> {metrics.totalResponses}</p>
        <p><strong>Last Updated:</strong> {new Date(metrics.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Feedback;
