import { SurveySchemaType } from "./survey-schema";

export interface SubmissionResponse {
  message: string;
  path?: string;
  responseId?: string;
}

/**
 * Submits the validated survey data to the Netlify backend function.
 * The netlify.toml redirects /api/* to /.netlify/functions/*
 */
export async function submitSurvey(data: SurveySchemaType): Promise<SubmissionResponse> {
  // Structure the payload to match the backend's expected schema
  const payload = {
    surveyData: {
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
      responses: {
        section1_beie: { understanding: data.q1_1, relevance: data.q1_2 },
        section2_mg: {
          importance: data.q2_1,
          implementation: data.q2_2,
          archetype: data.q2_3_archetype,
          peace_milestones: data.q2_4_peace,
        },
        section3_foundations: {
          priorities: data.q3_1_priorities,
          feasibility: data.q3_2_feasibility,
          el_nino_impact: data.q3_el_nino_impact,
          el_nino_likelihood: data.q3_el_nino_like,
          pestalotiopsis_impact: data.q3_pestalotiopsis_impact,
          pestalotiopsis_likelihood: data.q3_pestalotiopsis_like,
          postharvest_impact: data.q3_postharvest_impact,
          postharvest_likelihood: data.q3_postharvest_like,
          limits_growth: data.q3_limits_growth,
        },
        section4_transformers: {
          barrier: data.q4_1_barrier,
          halal_park: data.q4_2_halal_park,
          fixes_fail: data.q4_3_fixes_fail,
          commodity_impact: data.q4_4_commodity_impact,
          heds_ranking: data.q4_5_heds_ranking,
        },
        section5_enablers: {
          infra_rating: data.q5_1_infra,
          sectors: data.q5_2_sectors,
          broadband: data.q5_3_broadband,
          literacy: data.q5_4_literacy,
          stunting: data.q5_5_stunting,
          digital_divide: data.q5_6_digital_divide,
        },
        section6_connectors: {
          bimpeaga_importance: data.q6_1_bimpeaga,
          markets: data.q6_2_markets,
          export_target: data.q6_3_export_target,
          uae_feasibility: data.q6_4_uae_feasibility,
          perception: data.q6_5_perception,
        },
        section7_financiers: {
          criticality: data.q7_1_criticality,
          instruments: data.q7_2_instruments,
          inclusion_target: data.q7_3_inclusion_target,
          asset_paradox: data.q7_4_asset_paradox,
          block_grant: data.q7_5_block_grant,
        },
        section8_options: {
          strategy: data.q8_1_strategy,
          sequencing: data.q8_2_sequencing,
          comments: data.q8_3_comments,
        },
        section9_budget: { realism: data.q9_1_budget },
        section10_targets: {
          ambition: data.q10_1_ambition,
          matrix: data.q10_matrix,
        },
        section11_equity: {
          affirmative: data.q11_1_affirmative,
          mechanisms: data.q11_2_mechanisms,
        },
        section12_climate: {
          green_priority: data.q12_1_green_priority,
          adaptation: data.q12_2_adaptation,
        },
        section13_policy: {
          legislation: data.q13_1_legislation,
          bicc: data.q13_2_bicc,
        },
        section16_care: {
          context: data.care_context,
          action: data.care_action,
          realtime: data.care_realtime,
          evidence: data.care_evidence,
          overall: data.care_overall,
        },
      },
      demographics: {
        category: data.demo_category,
        province: data.demo_province,
        expertise: data.demo_expertise,
        name: data.demo_name,
        email: data.demo_email,
        organization: data.demo_organization,
      },
      consent: data.consent_final,
    },
  };

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Survey submission failed:", error);
    throw error;
  }
}
