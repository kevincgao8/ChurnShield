// src/components/AtRiskCustomers.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AtRiskCustomers() {
  const [atRiskList, setAtRiskList] = useState([]);
  const navigate = useNavigate();

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
        const sfData = sfRes.data.predictions || [];
        const hsData = hsRes.data.predictions || [];
        const zdData = zdRes.data.predictions || [];
        const blData = blRes.data.predictions || [];

        // Label each record with its source
        const labeledSf = sfData.map(item => ({ ...item, source: "Salesforce" }));
        const labeledHs = hsData.map(item => ({ ...item, source: "Hubspot" }));
        const labeledZd = zdData.map(item => ({ ...item, source: "Zendesk" }));
        const labeledBl = blData.map(item => ({ ...item, source: "Billing" }));

        // Combine all
        const combined = [
          ...labeledSf,
          ...labeledHs,
          ...labeledZd,
          ...labeledBl
        ];

        // Filter for predicted churn
        const churned = combined.filter(r => r.Predicted_Churn === 1);

        // Randomly pick 7
        const selected = getRandomItems(churned, 7);

        setAtRiskList(selected);
      })
      .catch(err => {
        console.error("Error fetching at-risk data:", err);
      });
  }, []);

  // Utility: pick `count` random items from an array
  function getRandomItems(array, count) {
    if (array.length <= count) return array;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  // Navigate to /customers?selectedName=... when user is clicked
  function handleUserClick(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`.trim();
    navigate(`/customers?selectedName=${encodeURIComponent(fullName)}`);
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '1rem' }}>
        At-Risk Customers
      </h3>

      {atRiskList.length === 0 ? (
        <p style={{ fontSize: '0.9rem' }}>
          (No at-risk customers found)
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {atRiskList.map((cust, idx) => {
            const firstName = cust.FirstName || "Unknown";
            const lastName = cust.LastName || "User";
            const source = cust.source || "N/A";

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #E0E0E0',
                  width: '100%',
                  cursor: 'pointer'
                }}
                onClick={() => handleUserClick(firstName, lastName)}
              >
                {/* Left side: icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: '#D8D8D8' }}
                  >
                    <path
                      d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2ZM12 14C8.134 14 2 16.067 2 20V22H22V20C22 16.067 15.866 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span style={{ fontSize: '0.95rem', fontWeight: 'normal' }}>
                    {firstName} {lastName}
                  </span>
                </div>

                {/* Right side: source in grey (#808080) */}
                <span style={{ fontSize: '0.9rem', color: '#808080' }}>
                  {source}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AtRiskCustomers;
