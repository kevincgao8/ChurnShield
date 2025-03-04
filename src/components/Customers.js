// src/pages/Customers.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Import campaign logic functions and helpers
import { fetchDynamicSalesforceCampaigns } from '../components/SalesforceCampaignsLogic';
import { fetchDynamicHubSpotCampaigns } from '../components/HubspotRetentionCampaignsLogic';
import { fetchDynamicZendeskCampaigns, segmentCompoundScore } from '../components/ZendeskRetentionCampaignsLogic';
import { fetchDynamicBillingCampaigns } from '../components/BillingRetentionCampaignsLogic';

// Helper for HubSpot segmentation
function segmentHubSpotLeadScore(leadScore) {
  const score = Number(leadScore);
  if (isNaN(score)) return "unknown";
  if (score < 25) return "low";
  if (score < 50) return "low - med";
  if (score < 75) return "med - high";
  return "high";
}

function Customers() {
  const [allData, setAllData] = useState([]); // unified list of customer records
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // States for recommended campaign arrays from each source
  const [sfCampaigns, setSfCampaigns] = useState([]);
  const [hsCampaigns, setHsCampaigns] = useState([]);
  const [zdCampaigns, setZdCampaigns] = useState([]);
  const [blCampaigns, setBlCampaigns] = useState([]);

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
      axios.get(blUrl),
      fetchDynamicSalesforceCampaigns(),
      fetchDynamicHubSpotCampaigns(),
      fetchDynamicZendeskCampaigns(),
      fetchDynamicBillingCampaigns()
    ])
      .then(([
        sfRes, hsRes, zdRes, blRes,
        sfCamps, hsCamps, zdCamps, blCamps
      ]) => {
        const sfData = sfRes.data.predictions || [];
        const hsData = hsRes.data.predictions || [];
        const zdData = zdRes.data.predictions || [];
        const blData = blRes.data.predictions || [];

        // Format each record into a common shape:
        const sfFormatted = sfData.map(r => ({
          name: `${r.FirstName || "Unknown"} ${r.LastName || "User"}`.trim(),
          predictedChurn: r.Predicted_Churn === 1 ? 1 : 0,
          source: "salesforce",
          raw: r
        }));
        const hsFormatted = hsData.map(r => ({
          name: `${r.FirstName || "Unknown"} ${r.LastName || "User"}`.trim(),
          predictedChurn: r.Predicted_Churn === 1 ? 1 : 0,
          source: "hubspot",
          raw: r
        }));
        const zdFormatted = zdData.map(r => ({
          name: r.Agent || "Unknown Agent",
          predictedChurn: r.Predicted_Churn === 1 ? 1 : 0,
          source: "zendesk",
          raw: r
        }));
        const blFormatted = blData.map(r => ({
          name: r.UserID || "Unknown User",
          predictedChurn: r.Predicted_Churn === 1 ? 1 : 0,
          source: "billing",
          raw: r
        }));

        const combined = [...sfFormatted, ...hsFormatted, ...zdFormatted, ...blFormatted];
        setAllData(combined);

        setSfCampaigns(sfCamps || []);
        setHsCampaigns(hsCamps || []);
        setZdCampaigns(zdCamps || []);
        setBlCampaigns(blCamps || []);
      })
      .catch(err => {
        console.error("Error fetching data for Customers page:", err);
      });
  }, []);

  function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
  }

  // Helper: Find recommended campaign for Salesforce by matching (LeadSource, Status)
  function findSalesforceCampaigns(record) {
    const leadSource = record.LeadSource || "Unknown";
    const status = record.Status || "Unknown";
    const match = sfCampaigns.find(c => c.leadSource === leadSource && c.status === status);
    return match ? [match.recommendedCampaign.name] : [];
  }

  // Helper: Find recommended campaign for HubSpot by matching (LifecycleStage, segmented LeadScore)
  function findHubSpotCampaigns(record) {
    const lifecycleStage = record.LifecycleStage || "Unknown";
    const leadScoreSegment = segmentHubSpotLeadScore(record.LeadScore);
    const match = hsCampaigns.find(c => 
      c.lifecycleStage === lifecycleStage && c.leadScoreSegment === leadScoreSegment
    );
    return match ? [match.recommendedCampaign.name] : [];
  }

  // Helper: Find recommended campaign for Zendesk by matching priority (from CompoundScore)
  function findZendeskCampaigns(record) {
    const priority = segmentCompoundScore(record.CompoundScore);
    const match = zdCampaigns.find(c => c.priority === priority);
    return match ? [match.recommendedCampaign.name] : [];
  }

  // Helper: Find recommended campaign for Billing by matching (SubscriptionPlan, PaymentStatus)
  function findBillingCampaigns(record) {
    const subscriptionPlan = record.SubscriptionPlan || "Unknown";
    const paymentStatus = record.PaymentStatus || "Unknown";
    const match = blCampaigns.find(c => 
      c.subscriptionPlan === subscriptionPlan && c.paymentStatus === paymentStatus
    );
    return match ? [match.recommendedCampaign.name] : [];
  }

  // Main function to get recommendations based on source and predictedChurn
  function getRecommendations(customerObj) {
    if (!customerObj || customerObj.predictedChurn !== 1) return [];
    const { source, raw } = customerObj;
    switch (source) {
      case "salesforce":
        return findSalesforceCampaigns(raw);
      case "hubspot":
        return findHubSpotCampaigns(raw);
      case "zendesk":
        return findZendeskCampaigns(raw);
      case "billing":
        return findBillingCampaigns(raw);
      default:
        return [];
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'normal' }}>Customers</h1>
        <hr style={{ marginTop: '0.5rem', border: '1px solid #ccc' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 100px)' }}>
        {/* Left tile: Name list */}
        <div style={{ gridColumn: '1', borderRight: '1px solid #ccc', backgroundColor: '#fff', overflowY: 'auto' }}>
          <h3 style={{ padding: '1rem', margin: 0, fontWeight: 'normal' }}>Name</h3>
          {allData.map((cust, idx) => {
            const isSelected = selectedCustomer && selectedCustomer.name === cust.name;
            return (
              <div
                key={idx}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: isSelected ? '#e0e0e0' : 'transparent'
                }}
                onClick={() => handleSelectCustomer(cust)}
              >
                {cust.name}
              </div>
            );
          })}
        </div>

        {/* Right tile: Top (Contact Details) and Bottom (Recommendations) */}
        <div style={{ gridColumn: '2', display: 'grid', gridTemplateRows: '3fr 1fr' }}>
          {/* Top Right: Contact Details */}
          <div style={{ gridRow: '1', borderBottom: '1px solid #ccc', backgroundColor: '#fff', overflowY: 'auto' }}>
            <h3 style={{ padding: '1rem', margin: 0, fontWeight: 'normal' }}>Contact Details</h3>
            {selectedCustomer ? (
              <div style={{ padding: '1rem' }}>
                {Object.entries(selectedCustomer.raw).map(([key, val]) => {
                  if (key === "Predicted_Churn") {
                    val = val === 1 ? "Yes" : "No";
                  }
                  return (
                    <div key={key} style={{ marginBottom: '0.5rem' }}>
                      <strong>{key}:</strong> {String(val)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ padding: '1rem' }}>(Select a customer)</p>
            )}
          </div>
          {/* Bottom Right: Recommendations */}
          <div style={{ gridRow: '2', backgroundColor: '#fff', overflowY: 'auto' }}>
            <h3 style={{ padding: '1rem', margin: 0, fontWeight: 'normal' }}>Recommendations</h3>
            {selectedCustomer ? (
              selectedCustomer.predictedChurn === 1 ? (
                <div style={{ padding: '1rem' }}>
                  {getRecommendations(selectedCustomer).length > 0 ? (
                    getRecommendations(selectedCustomer).map((rec, i) => (
                      <div key={i} style={{ marginBottom: '0.5rem' }}>
                        {rec}
                      </div>
                    ))
                  ) : (
                    <div>No matching campaigns found</div>
                  )}
                </div>
              ) : (
                <p style={{ padding: '1rem' }}>No recommendations at this time</p>
              )
            ) : (
              <p style={{ padding: '1rem' }}>(Select a customer)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customers;
