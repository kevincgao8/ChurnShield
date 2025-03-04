// src/components/ZendeskRetentionCampaignsLogic.js
import axios from 'axios';

/**
 * Segments a numerical CompoundScore into one of three buckets:
 * - "lowpriority" if score is between 0.0 and -0.2 (i.e. score >= -0.2)
 * - "mediumpriority" if score is between -0.2 and -0.4 (i.e. score < -0.2 and >= -0.4)
 * - "highpriority" if score is below -0.4
 */
export function segmentCompoundScore(compoundScore) {
  const score = Number(compoundScore);
  if (isNaN(score)) return "unknown"; 
  if (score >= -0.2) return "lowpriority";
  if (score >= -0.4) return "mediumpriority";
  return "highpriority";
}

/**
 * Returns campaign details (name and plan) based on the priority segment.
 */
function getCampaignDetailsForZendesk(priority) {
  switch (priority) {
    case "lowpriority":
      return {
        campaignName: "Zendesk - Low Priority Retention",
        campaignPlan: `
          This campaign targets Zendesk customers who, while showing some signs of churn, remain relatively engaged.
          Our approach focuses on proactive check-ins and personalized offers to reinforce their satisfaction and value.
        `,
      };
    case "mediumpriority":
      return {
        campaignName: "Zendesk - Medium Priority Retention",
        campaignPlan: `
          This campaign is designed for Zendesk customers at moderate risk of churning.
          We provide enhanced support and tailored communications to address emerging concerns and keep them engaged.
        `,
      };
    case "highpriority":
      return {
        campaignName: "Zendesk - High Priority Retention",
        campaignPlan: `
          This campaign is aimed at Zendesk customers at high risk of churning.
          Immediate, intensive outreach combined with dedicated support and compelling incentives is deployed to retain these customers.
        `,
      };
    default:
      return {
        campaignName: `Zendesk - ${priority} Outreach`,
        campaignPlan: `
          This is a generic outreach campaign for Zendesk customers with a priority level of: ${priority}.
        `,
      };
  }
}

/**
 * Fetches from the Zendesk predictions endpoint, filters records with Predicted_Churn === 1,
 * maps each record to use the "Agent" field as the customer's full name, segments the CompoundScore,
 * groups by the resulting priority, and returns an array of campaign objects.
 *
 * Returned objects are in the format:
 * [
 *   {
 *     priority: string,
 *     recommendedCampaign: {
 *       name: string,
 *       plan: string
 *     },
 *     customers: array  // Each customer has FirstName (full name) and LastName (empty string)
 *   },
 *   ...
 * ]
 */
export async function fetchDynamicZendeskCampaigns() {
  try {
    const apiUrl = "https://xesttf8m5b.execute-api.us-east-2.amazonaws.com/prod/zendesk-predictions";
    const response = await axios.get(apiUrl);
    const zdData = response.data.predictions || [];
    
    // Filter for records with Predicted_Churn === 1.
    const churnedRecords = zdData.filter(record => record.Predicted_Churn === 1);
    
    // Map each churned record so that the full name is taken from "Agent"
    const mappedRecords = churnedRecords.map(record => {
      const priority = segmentCompoundScore(record.CompoundScore);
      const fullName = record.Agent || record.agent || "Unknown";
      return {
        FirstName: fullName,
        LastName: "",
        compoundScore: record.CompoundScore,
        priority
      };
    });
    
    // Group records by the priority segment.
    const groupMap = new Map();
    mappedRecords.forEach(record => {
      const prio = record.priority;
      if (!groupMap.has(prio)) {
        groupMap.set(prio, { priority: prio, customers: [] });
      }
      groupMap.get(prio).customers.push(record);
    });
    
    // Build an array of campaign objects.
    const results = [];
    groupMap.forEach(group => {
      const { priority, customers } = group;
      const campaignDetails = getCampaignDetailsForZendesk(priority);
      results.push({
        priority,
        recommendedCampaign: {
          name: campaignDetails.campaignName,
          plan: campaignDetails.campaignPlan.trim()
        },
        customers
      });
    });
    
    return results;
  } catch (error) {
    console.error("Error fetching or processing Zendesk data:", error);
    return [];
  }
}
