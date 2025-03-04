// src/components/BillingPredictionsDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BillingPredictionsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Gateway endpoint for Billing predictions
  const apiUrl = "https://cntf8tmynd.execute-api.us-east-2.amazonaws.com/prod/billing-predictions";

  useEffect(() => {
    axios.get(apiUrl)
      .then(response => {
        setPredictions(response.data.predictions);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching billing predictions:", err);
        setError("Error fetching billing predictions");
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <p>Loading billing predictions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Billing Churn Predictions</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Billing_ID</th>
            <th>SubscriptionPlan</th>
            <th>PaymentStatus</th>
            <th>Amount</th>
            <th>Predicted_Churn</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((record, index) => (
            <tr key={index}>
              <td>{record.Billing_ID}</td>
              <td>{record.SubscriptionPlan}</td>
              <td>{record.PaymentStatus}</td>
              <td>{record.Amount}</td>
              <td>{record.Predicted_Churn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BillingPredictionsDashboard;
