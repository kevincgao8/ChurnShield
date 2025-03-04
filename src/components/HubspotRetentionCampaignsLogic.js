// src/components/HubspotRetentionCampaignsLogic.js
import axios from 'axios';

/**
 * Segments a numerical LeadScore (0-100) into one of four buckets:
 * - "low" (0-25)
 * - "low - med" (25-50)
 * - "med - high" (50-75)
 * - "high" (75-100)
 */
function segmentLeadScore(leadScore) {
  const score = Number(leadScore);
  if (isNaN(score)) return "unknown";
  if (score < 25) return "low";
  if (score < 50) return "low - med";
  if (score < 75) return "med - high";
  return "high";
}

/**
 * Returns the campaign details (name and plan) for a given LifecycleStage and leadScoreSegment.
 * The keys are normalized as: "<lifecycleStage in lower-case>::<leadScoreSegment in lower-case>"
 */
function getCampaignDetails(lifecycleStage, leadScoreSegment) {
  const normalizedKey = `${(lifecycleStage || "").toLowerCase()}::${(leadScoreSegment || "").toLowerCase()}`;

  const campaignPlans = {
    "opportunity::low": {
      campaignName: "HubSpot - Opportunity Low Engagement",
      campaignPlan: `
        This campaign targets opportunities with a low lead score, indicating limited initial interest.
        We will re-engage these opportunities with targeted content and personalized outreach to identify barriers to conversion.
        Tactics include a tailored email sequence emphasizing key benefits followed by a follow-up call.
        The goal is to stimulate interest and move these opportunities further down the funnel.
      `,
    },
    "marketing qualified lead::low": {
      campaignName: "HubSpot - MQL Low Activation",
      campaignPlan: `
        This campaign is aimed at marketing qualified leads with a low score, suggesting early-stage engagement.
        The plan focuses on providing educational content and gentle reminders about our solution’s benefits.
        Outreach will include informative emails and targeted social media interactions to nurture trust and encourage further exploration.
      `,
    },
    "sales qualified lead::low": {
      campaignName: "HubSpot - SQL Low Conversion Boost",
      campaignPlan: `
        Sales qualified leads with low scores may indicate hesitation.
        This campaign uses personalized sales interventions—including one-on-one consultations and targeted case studies—to address concerns and boost conversion.
        Direct follow-up calls and tailored content highlighting success stories are key components.
      `,
    },
    "customer::low": {
      campaignName: "HubSpot - Customer Low Retention Revival",
      campaignPlan: `
        For customers with low scores, retention is at risk.
        This campaign focuses on re-engagement through loyalty incentives and personalized check-ins.
        Customized offers and proactive support communications will reinforce the value of our service and gather feedback for improvement.
      `,
    },
    "opportunity::high": {
      campaignName: "HubSpot - Opportunity High Value Revival",
      campaignPlan: `
        Opportunities with high lead scores represent significant potential.
        This campaign capitalizes on that interest with high-touch, personalized outreach.
        It includes exclusive webinars, one-on-one meetings with senior executives, and premium content that underscores our competitive advantages.
        The aim is to convert these high-value opportunities into long-term customers.
      `,
    },
    "lead::low - med": {
      campaignName: "HubSpot - Lead Low-Med Nurturing",
      campaignPlan: `
        This campaign targets leads in the low-to-medium range, indicating moderate initial engagement.
        We nurture these prospects with regular follow-ups, drip email sequences, and gentle social media retargeting.
        The goal is to gradually increase engagement and push these leads toward a more active interest in our solutions.
      `,
    },
    "customer::med - high": {
      campaignName: "HubSpot - Customer Med-High Loyalty Drive",
      campaignPlan: `
        For customers with a medium-to-high score, the focus is on deepening loyalty and increasing lifetime value.
        This campaign offers exclusive benefits such as early access to new features, loyalty rewards, and personalized success consultations.
        The strategy is to reinforce their relationship with our brand and encourage long-term retention.
      `,
    },
    "lead::low": {
      campaignName: "HubSpot - Lead Low Prospecting",
      campaignPlan: `
        Leads with a low score require initial activation.
        This campaign uses straightforward outreach through introductory emails, basic product demos, and clear calls-to-action.
        The aim is to spark interest and convert passive leads into active prospects.
      `,
    },
    "subscriber::med - high": {
      campaignName: "HubSpot - Subscriber Med-High Engagement",
      campaignPlan: `
        Subscribers in the medium-to-high range are ready for deeper engagement.
        This campaign focuses on converting subscribers into active users with personalized newsletters, exclusive content, and invitations to interactive events.
        The goal is to enhance product familiarity and foster a sense of community.
      `,
    },
    "subscriber::low - med": {
      campaignName: "HubSpot - Subscriber Low-Med Onboarding",
      campaignPlan: `
        This campaign targets subscribers with a low-to-medium score.
        It offers a smooth onboarding process through a series of welcome emails, detailed user guides, and community invitations.
        The objective is to educate subscribers on key features and encourage ongoing engagement.
      `,
    },
    "marketing qualified lead::low - med": {
      campaignName: "HubSpot - MQL Low-Med Nurturing",
      campaignPlan: `
        For marketing qualified leads in the low-to-medium range, this campaign uses a nurturing approach focused on building trust.
        A mix of educational content, customer testimonials, and gentle follow-ups will help move these leads toward higher engagement.
        The goal is to elevate their interest and prepare them for conversion.
      `,
    },
    "opportunity::low - med": {
      campaignName: "HubSpot - Opportunity Low-Med Re-engagement",
      campaignPlan: `
        Opportunities with low-to-medium scores might be underperforming.
        This campaign re-engages these prospects through targeted email campaigns, retargeting ads, and personalized outreach.
        By reinforcing value and addressing potential objections, we aim to move these opportunities further along the funnel.
      `,
    },
    "customer::low - med": {
      campaignName: "HubSpot - Customer Low-Med Retention Boost",
      campaignPlan: `
        This campaign is designed for customers with low-to-medium scores to boost retention.
        Personalized check-ins, loyalty incentives, and tailored offers will be deployed to address their specific needs.
        The goal is to strengthen the customer relationship and reduce churn.
      `,
    },
    "subscriber::low": {
      campaignName: "HubSpot - Subscriber Low Activation",
      campaignPlan: `
        For subscribers with a low score, the focus is on activation.
        A series of introductory messages will highlight key benefits and prompt them to explore our offerings further.
        The objective is to drive initial engagement and convert passive subscribers into active users.
      `,
    },
    "opportunity::med - high": {
      campaignName: "HubSpot - Opportunity Med-High Optimization",
      campaignPlan: `
        This campaign targets opportunities with medium-to-high scores that indicate strong interest.
        We will optimize the conversion process through high-touch interactions, exclusive content, and personalized consultations.
        The strategy is to swiftly move these prospects to closure by addressing objections and highlighting differentiators.
      `,
    },
    "marketing qualified lead::high": {
      campaignName: "HubSpot - MQL High Conversion Accelerator",
      campaignPlan: `
        For marketing qualified leads with high scores, this campaign focuses on accelerating conversion with intensive personalized engagement.
        Tactics include premium content offers, one-on-one consultations, and targeted follow-ups to overcome any final objections.
        The aim is to rapidly convert these high-potential leads into customers.
      `,
    },
  };

  // Return the defined campaign if it exists; otherwise return a generic fallback.
  if (campaignPlans[normalizedKey]) {
    return campaignPlans[normalizedKey];
  } else {
    const fallbackCampaignName = `HubSpot - ${lifecycleStage} / ${leadScoreSegment} Outreach`;
    const fallbackCampaignPlan = `
      This campaign is designed for leads in the "${lifecycleStage}" stage with a lead score segment of "${leadScoreSegment}".
      It will use personalized engagement strategies to highlight our unique value and address specific concerns.
      
      Tactics include tailored email sequences, targeted content, and follow-up calls aimed at nurturing these leads toward conversion.
    `;
    return {
      campaignName: fallbackCampaignName,
      campaignPlan: fallbackCampaignPlan,
    };
  }
}

/**
 * Fetches from the HubSpot endpoint, filters records with Predicted_Churn === 1,
 * segments the numerical LeadScore into buckets, groups by (LifecycleStage, leadScoreSegment),
 * and returns an array of campaign objects in the format:
 *
 * [
 *   {
 *     lifecycleStage: string,
 *     leadScoreSegment: string,
 *     recommendedCampaign: {
 *       name: string,
 *       plan: string
 *     },
 *     customers: array
 *   },
 *   ...
 * ]
 */
export async function fetchDynamicHubSpotCampaigns() {
  try {
    const apiUrl = "https://sosryyaiz2.execute-api.us-east-2.amazonaws.com/prod/hubspot-predictions";
    const response = await axios.get(apiUrl);
    const hsData = response.data.predictions || [];

    // Filter for records where Predicted_Churn === 1.
    const churnedRecords = hsData.filter(record => record.Predicted_Churn === 1);

    // Group records by LifecycleStage and segmented LeadScore.
    const pairMap = new Map();
    churnedRecords.forEach(record => {
      const lifecycleStage = record.LifecycleStage || "Unknown";
      const leadScoreSegment = segmentLeadScore(record.LeadScore);
      const pairKey = `${lifecycleStage}::${leadScoreSegment}`;

      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, { lifecycleStage, leadScoreSegment, customers: [] });
      }
      pairMap.get(pairKey).customers.push(record);
    });

    // Build an array of campaign objects for each unique combination.
    const results = [];
    pairMap.forEach(pairObj => {
      const { lifecycleStage, leadScoreSegment, customers } = pairObj;
      const campaignDetails = getCampaignDetails(lifecycleStage, leadScoreSegment);
      results.push({
        lifecycleStage,
        leadScoreSegment,
        recommendedCampaign: {
          name: campaignDetails.campaignName,
          plan: campaignDetails.campaignPlan.trim()
        },
        customers
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching or processing HubSpot data:", error);
    return [];
  }
}
