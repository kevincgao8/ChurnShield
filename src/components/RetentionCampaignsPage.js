// src/components/RetentionCampaignsPage.js
import React, { useEffect, useState } from 'react';
import { fetchDynamicSalesforceCampaigns } from './SalesforceCampaignsLogic';
import { fetchDynamicHubSpotCampaigns } from './HubspotRetentionCampaignsLogic';
import { fetchDynamicZendeskCampaigns } from './ZendeskRetentionCampaignsLogic';
import { fetchDynamicBillingCampaigns } from './BillingRetentionCampaignsLogic';

function RetentionCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    // Fetch campaigns from Salesforce, HubSpot, Zendesk, and Billing
    Promise.all([
      fetchDynamicSalesforceCampaigns(),
      fetchDynamicHubSpotCampaigns(),
      fetchDynamicZendeskCampaigns(),
      fetchDynamicBillingCampaigns()
    ])
      .then(([sfResults, hsResults, zdResults, billingResults]) => {
        const combinedResults = [
          ...sfResults,
          ...hsResults,
          ...zdResults,
          ...billingResults
        ];
        setCampaigns(combinedResults);
        if (combinedResults.length > 0) {
          setSelectedCampaign(combinedResults[0]);
        }
      })
      .catch((err) => {
        console.error("Error loading campaigns:", err);
      });
  }, []);

  // When user clicks on a campaign name
  function handleSelectCampaign(campaign) {
    setSelectedCampaign(campaign);
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', height: '100vh', boxSizing: 'border-box' }}>
      <h1 style={{ fontWeight: 'normal', fontSize: '2rem' }}>Retention Campaigns</h1>
      <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #C8CBD9' }} />

      {/* 3-column layout: Name | Plan | Targeted Customers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gap: '1rem',
          height: 'calc(100% - 5rem)' // leave some space for header
        }}
      >
        {/* Left Column: Name */}
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #E0E0E0', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', padding: '1rem', margin: 0 }}>Name</h3>
          <div>
            {campaigns.map((c, index) => {
              const displayName = c.recommendedCampaign?.name || "Unnamed Campaign";
              return (
                <div
                  key={index}
                  onClick={() => handleSelectCampaign(c)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #F0F0F0',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedCampaign && selectedCampaign.recommendedCampaign?.name === displayName
                        ? '#f9f9f9'
                        : '#fff'
                  }}
                >
                  {displayName}
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Plan */}
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #E0E0E0', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', padding: '1rem', margin: 0 }}>Plan</h3>
          <div style={{ padding: '1rem', fontSize: '0.95rem' }}>
            {selectedCampaign ? (
              selectedCampaign.recommendedCampaign?.plan.trim().split('\n\n').map((para, index) => (
                <p key={index}>{para}</p>
              ))
            ) : (
              <p style={{ color: '#999' }}>(Select a campaign)</p>
            )}
          </div>
        </div>

        {/* Right Column: Targeted Customers */}
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #E0E0E0', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', padding: '1rem', margin: 0 }}>Targeted Customers</h3>
          <div style={{ padding: '1rem', fontSize: '0.95rem' }}>
            {selectedCampaign && selectedCampaign.customers && selectedCampaign.customers.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedCampaign.customers.map((cust, idx) => {
                  // Check for Billing records first, then Zendesk, then others.
                  const fullName = cust.UserID || cust.Agent || cust.FirstName || cust.firstName || "Unknown";
                  const lastName = cust.LastName || cust.lastName || "";
                  return (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      {fullName} {lastName}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ color: '#999' }}>(No targeted customers or no campaign selected)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetentionCampaignsPage;
