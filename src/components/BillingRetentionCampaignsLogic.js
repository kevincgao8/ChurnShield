// src/components/BillingRetentionCampaignsLogic.js
import axios from 'axios';

/**
 * Returns campaign details (name and plan) based on SubscriptionPlan and PaymentStatus.
 */
function getCampaignDetails(subscriptionPlan, paymentStatus) {
  // Normalize key
  const normalizedKey = `${(subscriptionPlan || "").toLowerCase()}::${(paymentStatus || "").toLowerCase()}`;
  
  // Define specific campaign details for certain combinations.
  const campaignPlans = {
    "basic::paid": {
      campaignName: "Billing - Basic Paid Retention",
      campaignPlan: `
        For customers on the Basic plan who are current on payments, our focus is on reinforcing value.
        We will provide personalized offers and friendly check-ins to ensure they continue to see the benefits of our service.
      `,
    },
    "premium::paid": {
      campaignName: "Billing - Premium Paid Loyalty",
      campaignPlan: `
        Premium customers with a paid status receive exclusive communications and loyalty rewards.
        Our strategy emphasizes high-touch support and exclusive benefits to maintain their satisfaction.
      `,
    },
    "basic::past_due": {
      campaignName: "Billing - Basic Past Due Recovery",
      campaignPlan: `
        For Basic plan customers with past-due payments, our approach is gentle yet proactive.
        We will offer flexible payment options and personalized support to help them get back on track.
      `,
    },
    // Add more specific combinations as needed...
  };

  if (campaignPlans[normalizedKey]) {
    return campaignPlans[normalizedKey];
  } else {
    const fallbackCampaignName = `Billing - ${subscriptionPlan} / ${paymentStatus} Outreach`;
    const fallbackCampaignPlan = `
      This campaign targets customers on the ${subscriptionPlan} plan with a payment status of ${paymentStatus}.
      We focus on re-engagement through friendly reminders, personalized offers, and clear support pathways.
    `;
    return {
      campaignName: fallbackCampaignName,
      campaignPlan: fallbackCampaignPlan,
    };
  }
}


export async function fetchDynamicBillingCampaigns() {
  try {
    const apiUrl = "https://cntf8tmynd.execute-api.us-east-2.amazonaws.com/prod/billing-predictions";
    const response = await axios.get(apiUrl);
    const billingData = response.data.predictions || [];

    // Filter for records with Predicted_Churn === 1.
    const churnedRecords = billingData.filter(record => record.Predicted_Churn === 1);

    // Group records by unique (SubscriptionPlan, PaymentStatus) combination.
    const pairMap = new Map();
    churnedRecords.forEach(record => {
      const subscriptionPlan = record.SubscriptionPlan || "Unknown";
      const paymentStatus = record.PaymentStatus || "Unknown";
      const key = `${subscriptionPlan}::${paymentStatus}`;
      if (!pairMap.has(key)) {
        pairMap.set(key, { subscriptionPlan, paymentStatus, customers: [] });
      }
      pairMap.get(key).customers.push(record);
    });

    // Build an array of campaign objects.
    const results = [];
    pairMap.forEach(pairObj => {
      const { subscriptionPlan, paymentStatus, customers } = pairObj;
      const campaignDetails = getCampaignDetails(subscriptionPlan, paymentStatus);
      results.push({
        subscriptionPlan,
        paymentStatus,
        recommendedCampaign: {
          name: campaignDetails.campaignName,
          plan: campaignDetails.campaignPlan.trim(),
        },
        customers,
      });
    });
    return results;
  } catch (error) {
    console.error("Error fetching or processing Billing data:", error);
    return [];
  }
}
