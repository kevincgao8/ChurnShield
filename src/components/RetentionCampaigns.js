// src/components/RetentionCampaigns.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDynamicSalesforceCampaigns } from './SalesforceCampaignsLogic';
import { fetchDynamicHubSpotCampaigns } from './HubspotRetentionCampaignsLogic';
import { fetchDynamicZendeskCampaigns } from './ZendeskRetentionCampaignsLogic';
import { fetchDynamicBillingCampaigns } from './BillingRetentionCampaignsLogic';

function RetentionCampaigns() {
  const [campaignCount, setCampaignCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all campaigns from the four data sources
    Promise.all([
      fetchDynamicSalesforceCampaigns(),
      fetchDynamicHubSpotCampaigns(),
      fetchDynamicZendeskCampaigns(),
      fetchDynamicBillingCampaigns()
    ])
      .then(([sfCamps, hsCamps, zdCamps, blCamps]) => {
        // Combine all campaigns into one array
        const combinedCamps = [...sfCamps, ...hsCamps, ...zdCamps, ...blCamps];

        // Extract the campaign name from each entry
        const campaignNames = combinedCamps.map(
          (c) => c.recommendedCampaign?.name || "Unnamed Campaign"
        );

        // Use a Set to remove duplicates
        const uniqueNames = new Set(campaignNames);

        // Update state with the total number of unique campaign names
        setCampaignCount(uniqueNames.size);
      })
      .catch((err) => {
        console.error("Error fetching campaigns for RetentionCampaigns tile:", err);
      });
  }, []);

  // When the tile is clicked, navigate to the retention campaigns page.
  function handleClick() {
    navigate("campaigns"); // Adjust the route as needed
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '1rem' }}>
        Retention Campaigns
      </h3>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '60px',
            fontWeight: 'bold',
            color: '#000',
            marginBottom: '0.5rem'
          }}
        >
          {campaignCount}
        </div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: '#000'
          }}
        >
          campaigns available
        </div>
      </div>
    </div>
  );
}

export default RetentionCampaigns;
