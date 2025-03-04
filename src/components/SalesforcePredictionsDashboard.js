import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesforcePredictionsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Gateway endpoint
  const apiUrl = "https://87i2y2l8gk.execute-api.us-east-2.amazonaws.com/prod/salesforce-predictions";

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
      <h2>Salesforce Churn Predictions</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Salesforce_ID</th>
            <th>LeadSource</th>
            <th>Status</th>
            <th>Predicted_Churn</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((record, index) => (
            <tr key={index}>
              <td>{record.Salesforce_ID}</td>
              <td>{record.LeadSource}</td>
              <td>{record.Status}</td>
              <td>{record.Predicted_Churn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesforcePredictionsDashboard;
