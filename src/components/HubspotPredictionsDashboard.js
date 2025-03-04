// src/components/HubspotPredictionsDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HubspotPredictionsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Gateway endpoint for Hubspot predictions
  const apiUrl = "https://sosryyaiz2.execute-api.us-east-2.amazonaws.com/prod/hubspot-predictions";

  useEffect(() => {
    axios.get(apiUrl)
      .then(response => {
        setPredictions(response.data.predictions);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching predictions:", err);
        setError("Error fetching predictions");
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <p>Loading predictions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Hubspot Churn Predictions</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>HubSpot_ID</th>
            <th>LifecycleStage</th>
            <th>LeadScore</th>
            <th>Predicted_Churn</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((record, index) => (
            <tr key={index}>
              <td>{record.HubSpot_ID}</td>
              <td>{record.LifecycleStage}</td>
              <td>{record.LeadScore}</td>
              <td>{record.Predicted_Churn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HubspotPredictionsDashboard;
