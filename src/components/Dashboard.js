// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CustomerChurnBarChart from '../components/CustomerChurnBarChart';
import RetentionRatePieChart from '../components/RetentionRatePieChart';
import PredictedChurnRate from '../components/PredictedChurnRate';
import AtRiskCustomers from '../components/AtRiskCustomers';
import RetentionCampaigns from '../components/RetentionCampaigns';

function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [predictedChurn, setPredictedChurn] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);

  // Endpoints
  const sfUrl = "https://87i2y2l8gk.execute-api.us-east-2.amazonaws.com/prod/salesforce-predictions";
  const hsUrl = "https://sosryyaiz2.execute-api.us-east-2.amazonaws.com/prod/hubspot-predictions";
  const zdUrl = "https://xesttf8m5b.execute-api.us-east-2.amazonaws.com/prod/zendesk-predictions";
  const blUrl = "https://cntf8tmynd.execute-api.us-east-2.amazonaws.com/prod/billing-predictions";

  useEffect(() => {
    Promise.all([
      axios.get(sfUrl),
      axios.get(hsUrl),
      axios.get(zdUrl),
      axios.get(blUrl)
    ])
      .then(([sfRes, hsRes, zdRes, blRes]) => {
        const sfPredictions = sfRes.data.predictions || [];
        const hsPredictions = hsRes.data.predictions || [];
        const zdPredictions = zdRes.data.predictions || [];
        const blPredictions = blRes.data.predictions || [];

        const sfTotal = sfPredictions.length;
        const sfChurn = sfPredictions.filter(p => p.Predicted_Churn === 1).length;

        const hsTotal = hsPredictions.length;
        const hsChurn = hsPredictions.filter(p => p.Predicted_Churn === 1).length;

        const zdTotal = zdPredictions.length;
        const zdChurn = zdPredictions.filter(p => p.Predicted_Churn === 1).length;

        const blTotal = blPredictions.length;
        const blChurn = blPredictions.filter(p => p.Predicted_Churn === 1).length;

        const newChartData = [
          { name: "Salesforce", total: sfTotal, churn: sfChurn },
          { name: "Zendesk", total: zdTotal, churn: zdChurn },
          { name: "Hubspot", total: hsTotal, churn: hsChurn },
          { name: "Billing", total: blTotal, churn: blChurn }
        ];
        setChartData(newChartData);

        const total = sfTotal + hsTotal + zdTotal + blTotal;
        const churn = sfChurn + hsChurn + zdChurn + blChurn;
        setTotalCustomers(total);
        setPredictedChurn(churn);

        const retRate = total > 0 ? (1 - churn / total) * 100 : 0;
        setRetentionRate(Math.round(retRate));
      })
      .catch(err => {
        console.error("Error fetching data for dashboard:", err);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', width: '100%', backgroundColor: '#FFFFFF' }}>
      <h1 style={{ marginBottom: '1rem', fontWeight: 'normal', fontSize: '2rem' }}>
        Dashboard
      </h1>

      {/* TOP ROW: 3 columns => "2fr 1px 1fr" */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1px 1fr',
          alignItems: 'stretch',
          marginBottom: '2rem',
          columnGap: 0
        }}
      >
        {/* Bar Chart => col1 (2fr) */}
        <div style={{ gridColumn: '1', display: 'flex', flex: 1 }}>
          <CustomerChurnBarChart
            data={chartData}
            totalCustomers={totalCustomers}
            predictedChurn={predictedChurn}
          />
        </div>

        {/* Vertical divider => col2 */}
        <div
          style={{
            gridColumn: '2',
            width: '1px',
            backgroundColor: '#C8CBD9',
            alignSelf: 'stretch'
          }}
        />

        {/* Retention Rate => col3 (1fr) */}
        <div style={{ gridColumn: '3', display: 'flex', flex: 1 }}>
          <RetentionRatePieChart retentionRate={retentionRate} />
        </div>
      </div>

      {/* Horizontal divider */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #C8CBD9',
          margin: '2rem 0'
        }}
      />

      {/* BOTTOM ROW: 5 columns => "1fr 1px 1fr 1px 1fr" */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
          alignItems: 'stretch',
          columnGap: 0
        }}
      >
        {/* PredictedChurnRate => col1 */}
        <div style={{ gridColumn: '1', display: 'flex', flex: 1 }}>
          <PredictedChurnRate data={chartData} />
        </div>

        {/* Vertical divider => col2 */}
        <div
          style={{
            gridColumn: '2',
            width: '1px',
            backgroundColor: '#C8CBD9',
            alignSelf: 'stretch'
          }}
        />

        {/* AtRiskCustomers => col3 */}
        <div style={{ gridColumn: '3', display: 'flex', flex: 1 }}>
          <AtRiskCustomers />
        </div>

        {/* Vertical divider => col4 */}
        <div
          style={{
            gridColumn: '4',
            width: '1px',
            backgroundColor: '#C8CBD9',
            alignSelf: 'stretch'
          }}
        />

        {/* RetentionCampaigns => col5 */}
        <div style={{ gridColumn: '5', display: 'flex', flex: 1 }}>
          <RetentionCampaigns />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
