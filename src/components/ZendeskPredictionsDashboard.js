// src/components/ZendeskPredictionsDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ZendeskPredictionsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Gateway endpoint for Zendesk predictions
  const apiUrl = "https://xesttf8m5b.execute-api.us-east-2.amazonaws.com/prod/zendesk-predictions";

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
      <h2>Zendesk Churn Predictions</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Ticket_ID</th>
            <th>TicketSubject</th>
            <th>TicketDescription</th>
            <th>CompoundScore</th>
            <th>Predicted_Churn</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((record, index) => (
            <tr key={index}>
              <td>{record.Ticket_ID}</td>
              <td>{record.TicketSubject}</td>
              <td>{record.TicketDescription}</td>
              <td>{record.CompoundScore}</td>
              <td>{record.Predicted_Churn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ZendeskPredictionsDashboard;
