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
        section2_mg: { importance: data.q2_1, implementation: data.q2_2 },
        section3_foundations: { priorities: data.q3_1, feasibility: data.q3_2 },
        section4_transformers: { barrier: data.q4_1, halal_park_effectiveness: data.q4_2 },
        section5_enablers: { leverage: data.q5_1, broadband_realism: data.q5_2 },
        section6_connectors: { markets: data.q6_1, bimpeaga_importance: data.q6_2 },
        section7_financiers: { criticality: data.q7_1, instruments: data.q7_2 },
        section8_options: { strategy: data.q8_1, sequencing: data.q8_2, comments: data.q8_3 },
        section9_budget: { realism: data.q9_1 },
        section10_targets: { ambition: data.q10_1 },
        section11_equity: { affirmative_policy: data.q11_1 },
        section12_climate: { green_priority: data.q12_1 },
        section13_policy: { legislation: data.q13_1 },
      },
      demographics: {
        name: data.name,
        email: data.email,
        organization: data.organization,
        position: data.position,
        sector: data.sector,
        province: data.province,
      },
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
