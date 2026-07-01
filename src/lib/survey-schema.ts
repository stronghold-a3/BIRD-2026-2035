import { z } from "zod";

// Helper for 1-5 Likert scales
const scale1to5 = z.enum(["1", "2", "3", "4", "5"], {
  errorMap: () => ({ message: "Please select a rating to proceed." }),
});

// Helper for 1-4 scales
const scale1to4 = z.enum(["1", "2", "3", "4"], {
  errorMap: () => ({ message: "Please select a rating to proceed." }),
});

// Helper for Checkbox arrays (requires at least 1 selection)
const checkboxArray = z.array(z.string()).min(1, "Please select at least one option.");

export const surveySchema = z.object({
  // --- SECTION 1: BEIE Framework ---
  q1_1: scale1to5, // Understanding
  q1_2: scale1to5, // Relevance

  // --- SECTION 2: Moral Governance ---
  q2_1: scale1to5, // Importance
  q2_2: scale1to5, // Implementation effectiveness

  // --- SECTION 3: Foundations ---
  q3_1: checkboxArray, // Priority areas (checkboxes)
  q3_2: scale1to5,     // Feasibility of post-harvest target

  // --- SECTION 4: Transformers ---
  q4_1: z.enum(["cert", "recognition", "infra", "skills"], {
    errorMap: () => ({ message: "Please identify the most critical barrier." }),
  }),
  q4_2: scale1to5, // Halal Park effectiveness

  // --- SECTION 5: Enablers ---
  q5_1: z.array(z.string()).min(1, "Please select at least one enabler investment."),
  q5_2: scale1to5, // Broadband realism

  // --- SECTION 6: Connectors ---
  q6_1: z.array(z.string()).min(1, "Please select at least one export market."),
  q6_2: scale1to5, // BIMP-EAGA importance

  // --- SECTION 7: Financiers ---
  q7_1: scale1to5, // Islamic finance criticality
  q7_2: checkboxArray, // Financial instruments

  // --- SECTION 8: Strategic Options ---
  q8_1: z.enum(['heds', 'gems', 'ifes', 'ieds'], {
    errorMap: () => ({ message: "Please select a strategic option." }),
  }),
  q8_2: z.enum(['highly_logical', 'mostly_logical', 'needs_adjustment', 'flawed'], {
    errorMap: () => ({ message: "Please rate the sequencing logic." }),
  }),

  // --- SECTION 9: Budget & Targets ---
  q9_1: z.enum(['realistic', 'underestimated', 'overestimated', 'unable'], {
    errorMap: () => ({ message: "Please assess budget realism." }),
  }),
  q10_1: z.enum(['appropriately_ambitious', 'too_conservative', 'too_ambitious', 'mixed'], {
    errorMap: () => ({ message: "Please assess target ambition." }),
  }),

  // --- SECTION 10: IEDS Evaluation Matrix (1-10 scale) ---
  q10_matrix: z.object({
    heds: z.object({
      economic_impact: z.coerce.number().min(1).max(10),
      feasibility: z.coerce.number().min(1).max(10),
      identity_alignment: z.coerce.number().min(1).max(10),
      systems_leverage: z.coerce.number().min(1).max(10),
      risk_return: z.coerce.number().min(1).max(10),
      inclusivity: z.coerce.number().min(1).max(10),
      sustainability: z.coerce.number().min(1).max(10),
    }),
    gems: z.object({
      economic_impact: z.coerce.number().min(1).max(10),
      feasibility: z.coerce.number().min(1).max(10),
      identity_alignment: z.coerce.number().min(1).max(10),
      systems_leverage: z.coerce.number().min(1).max(10),
      risk_return: z.coerce.number().min(1).max(10),
      inclusivity: z.coerce.number().min(1).max(10),
      sustainability: z.coerce.number().min(1).max(10),
    }),
    ifes: z.object({
      economic_impact: z.coerce.number().min(1).max(10),
      feasibility: z.coerce.number().min(1).max(10),
      identity_alignment: z.coerce.number().min(1).max(10),
      systems_leverage: z.coerce.number().min(1).max(10),
      risk_return: z.coerce.number().min(1).max(10),
      inclusivity: z.coerce.number().min(1).max(10),
      sustainability: z.coerce.number().min(1).max(10),
    }),
    ieds: z.object({
      economic_impact: z.coerce.number().min(1).max(10),
      feasibility: z.coerce.number().min(1).max(10),
      identity_alignment: z.coerce.number().min(1).max(10),
      systems_leverage: z.coerce.number().min(1).max(10),
      risk_return: z.coerce.number().min(1).max(10),
      inclusivity: z.coerce.number().min(1).max(10),
      sustainability: z.coerce.number().min(1).max(10),
    }),
  }),
  // --- SECTIONS 9 & 10: Budget & Targets ---
  q9_1: scale1to5,  // Budget realism
  q10_1: scale1to5, // Target ambition

  // --- SECTIONS 11 & 12: Equity & Climate ---
  q11_1: scale1to5, // Affirmative policy
  q12_1: scale1to5, // Green economy priority

  // --- SECTION 13: Policy ---
  q13_1: checkboxArray, // Priority legislation

  // --- SECTION 11: Provincial Equity ---
  q11_1: scale1to5, // Affirmative investment policies
  q11_2: checkboxArray, // Mechanisms to reduce disparity

  // --- SECTION 12: Climate Resilience ---
  q12_1: scale1to5, // Green economy prioritization
  q12_2: checkboxArray, // Climate adaptation mechanisms

  // --- SECTION 13: Policy & Governance ---
  q13_1: checkboxArray.min(1).max(2, "Please select no more than 2 priorities."), // Priority laws
  q13_2: scale1to5, // BICC effectiveness

  // --- SECTION 14: Demographics ---
  demo_category: z.string().min(1, "Please select your stakeholder category."),
  demo_province: z.string().min(1, "Please select your province."),
  demo_expertise: checkboxArray,

  // --- SECTION 15: Submission ---
  consent_final: z.literal(true, {
    errorMap: () => ({ message: "You must consent to submit the survey." }),
  }),
  // --- DEMOGRAPHICS (Section 14) ---
  name: z.string().min(1, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  organization: z.string().min(1, "Organization is required."),
  position: z.string().min(1, "Position/Title is required."),
  sector: z.string().min(1, "Please select your sector."),
  province: z.string().min(1, "Please select your province."),
});

// Export the inferred TypeScript type for use in our React components
export type SurveySchemaType = z.infer<typeof surveySchema>;
