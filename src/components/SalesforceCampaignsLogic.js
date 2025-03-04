// src/logic/RetentionCampaignsLogic.js
import axios from 'axios';

/**
 * Returns a custom campaign name and a 2–5 paragraph plan,
 * incorporating the LeadSource and Status details.
 */
function getCampaignDetails(leadSource, status) {
  // Build a normalized key for matching (leadSource/status) pairs.
  const normalizedKey = `${(leadSource || "").toLowerCase()}::${(status || "").toLowerCase()}`;

  // A dictionary of example campaigns for specific leadSource/status combinations.
  const campaignPlans = {
    // Referral - New
    "referral::new": {
      campaignName: "Salesforce - Welcome Referral",
      campaignPlan: `
        This campaign is tailored for new customers acquired through referrals. We will send a warm welcome email that highlights their referral connection, offers an exclusive discount for their first purchase, and invites them to an introductory webinar.
        
        The goal is to build immediate rapport, validate the trust placed in the referral, and set the stage for a long-term relationship. Follow-up communications will include personalized onboarding content and a dedicated support channel.
      `,
    },
    // Cold Call - Closed - Lost
    "cold call::closed - lost": {
      campaignName: "Salesforce - Reconnect Outreach",
      campaignPlan: `
        For prospects lost after a cold call, this campaign focuses on re-establishing contact with a fresh, personalized approach. We will send a series of re-engagement emails that highlight new product features and success stories.
        
        The outreach will include a follow-up call from a dedicated account manager who will address previous concerns and offer tailored solutions. A limited-time incentive may be provided to reignite their interest.
      `,
    },
    // Partner - Converted
    "partner::converted": {
      campaignName: "Salesforce - Partner Appreciation",
      campaignPlan: `
        This campaign targets customers who converted via our partner channel. The plan includes hosting exclusive partner appreciation events, such as a virtual roundtable with leadership and sneak peeks at upcoming product innovations.
        
        Follow-up communications will reinforce their importance in our ecosystem through success stories and collaborative opportunities, aiming to deepen the existing relationship.
      `,
    },
    // Web - Converted
    "web::converted": {
      campaignName: "Salesforce - Digital Thank You",
      campaignPlan: `
        Targeting customers who converted through our website, this campaign expresses our gratitude with a personalized video message from our CEO and an invitation to join an exclusive online community.
        
        Subsequent emails will share customer success stories and tailored offers to encourage ongoing engagement and loyalty.
      `,
    },
    // Web - Working
    "web::working": {
      campaignName: "Salesforce - Digital Engagement Boost",
      campaignPlan: `
        For leads in the 'Working' stage who have shown interest via our website, this campaign provides a series of educational emails, case studies, and invitations to interactive webinars.
        
        The objective is to nurture these prospects through the sales funnel by addressing any friction points and showcasing advanced product features to facilitate their decision-making.
      `,
    },
    // Web - Closed - Lost
    "web::closed - lost": {
      campaignName: "Salesforce - Digital Re-Engagement",
      campaignPlan: `
        This campaign is designed for website leads that were lost. It features personalized outreach with a focus on product improvements and new benefits since their last interaction.
        
        Retargeting ads and re-engagement emails will be deployed to rebuild trust, offer limited-time promotions, and invite these prospects to exclusive demo sessions.
      `,
    },
    // Trade Show - Closed - Lost
    "trade show::closed - lost": {
      campaignName: "Salesforce - Trade Show Revival",
      campaignPlan: `
        Targeting leads from trade shows that were lost post-event, this campaign begins with a post-event survey to collect feedback, followed by personalized outreach that highlights new product updates.
        
        Prospects will be invited to an exclusive trade show alumni webinar featuring industry insights and case studies, with the goal of rekindling their interest.
      `,
    },
    // Web - New
    "web::new": {
      campaignName: "Salesforce - Digital Welcome",
      campaignPlan: `
        For new customers acquired through our website, this campaign offers a warm digital welcome. A series of onboarding emails, video tutorials, and community invitations will be sent to familiarize them with our offerings.
        
        The focus is on building trust and ensuring a smooth transition into an engaged customer relationship, with personalized follow-up to answer any questions.
      `,
    },
    // Referral - Closed - Lost
    "referral::closed - lost": {
      campaignName: "Salesforce - Referral Reconnect",
      campaignPlan: `
        This campaign targets customers who were referred to us but ultimately did not convert. We will send personalized messages that remind them of the trust inherent in referrals, combined with special offers and customer testimonials.
        
        A dedicated outreach effort will involve follow-up calls from our customer success team to address past concerns and re-open dialogue.
      `,
    },
    // Partner - Nurturing
    "partner::nurturing": {
      campaignName: "Salesforce - Dinner Invitation",
      campaignPlan: `
        In this campaign, we invite our close partner leads to a private dinner event designed to strengthen our existing relationship and address any concerns they may have. By offering a relaxed environment for face-to-face conversation, we aim to foster trust and loyalty.
        
        During the dinner, our account managers and product specialists will deliver short presentations tailored to each customer’s unique challenges. We’ll also schedule dedicated Q&A sessions so that these high-value leads receive direct feedback.
        
        We specifically target customers who joined us via a "Partner" lead source and currently have a "Nurturing" status. These leads are already engaged and familiar with our offerings, making them prime candidates for a high-touch, relationship-focused outreach.
      `,
    },
    // Partner - Closed - Lost
    "partner::closed - lost": {
      campaignName: "Salesforce - Partner Recovery",
      campaignPlan: `
        This campaign is aimed at customers acquired via the partner channel who were lost despite early engagement. It involves personalized outreach that includes a review of their previous experience and tailored offers addressing their specific challenges.
        
        We will arrange one-on-one consultations with partner account managers and invite these customers to an exclusive recovery webinar. The objective is to rebuild trust and reintroduce our value propositions to re-engage them.
      `,
    },
  };

  // Return the matched campaign plan or a generic fallback.
  if (campaignPlans[normalizedKey]) {
    return campaignPlans[normalizedKey];
  } else {
    const fallbackCampaignName = `Salesforce - ${leadSource} / ${status} Outreach`;
    const fallbackCampaignPlan = `
      This outreach campaign focuses on re-engaging and retaining customers who, while not matching our predefined categories, still warrant a targeted strategy. The goal is to remind them of our product or service benefits, address any questions they may have, and ensure they feel supported by our customer success team.
      
      Implementation includes personalized emails and phone calls tailored to their known history with our brand, highlighting specific features or support options relevant to their industry. We may also invite them to webinars or localized events that align with their professional interests.
      
      We specifically target customers whose LeadSource is "${leadSource}" and Status is "${status}", ensuring our messaging resonates with their point of origin and current stage in the lifecycle.
    `;
    return {
      campaignName: fallbackCampaignName,
      campaignPlan: fallbackCampaignPlan,
    };
  }
}

/**
 * Fetches from the Salesforce endpoint, filters customers with
 * Predicted_Churn === 1, extracts unique (LeadSource, Status) pairs,
 * and returns an array of objects in the format:
 *
 * [
 *   {
 *     leadSource: string,
 *     status: string,
 *     recommendedCampaign: {
 *       name: string,
 *       plan: string
 *     },
 *     customers: array
 *   },
 *   ...
 * ]
 */
export async function fetchDynamicSalesforceCampaigns() {
  try {
    // 1. Fetch from Salesforce predictions endpoint.
    const sfUrl = "https://87i2y2l8gk.execute-api.us-east-2.amazonaws.com/prod/salesforce-predictions";
    const response = await axios.get(sfUrl);

    // 2. Assume the data shape is:
    //    { predictions: [ { LeadSource, Status, Predicted_Churn, ... }, ... ] }
    const sfData = response.data.predictions || [];

    // 3. Filter records where Predicted_Churn === 1.
    const churnedRecords = sfData.filter(record => record.Predicted_Churn === 1);

    // 4. Create a Map to store unique (LeadSource, Status) pairs and accumulate matching customers.
    const pairMap = new Map();
    churnedRecords.forEach(record => {
      const leadSource = record.LeadSource || "Unknown";
      const status = record.Status || "Unknown";
      const pairKey = `${leadSource}::${status}`;

      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, { leadSource, status, customers: [] });
      }
      // Add this record as a customer.
      const entry = pairMap.get(pairKey);
      entry.customers.push(record);
    });

    // 5. For each unique pair, generate a recommended campaign (name + plan) and attach the customers.
    const results = [];
    pairMap.forEach(pairObj => {
      const { leadSource, status, customers } = pairObj;
      const { campaignName, campaignPlan } = getCampaignDetails(leadSource, status);

      results.push({
        leadSource,
        status,
        recommendedCampaign: {
          name: campaignName,
          plan: campaignPlan.trim() // Remove leading/trailing whitespace.
        },
        customers
      });
    });

    // 6. Return the array of unique campaign objects.
    return results;
  } catch (error) {
    console.error("Error fetching or processing Salesforce data:", error);
    return [];
  }
}
