// src/lib/survey-schema.ts
import { z } from "zod";

const form = useForm<SurveySchemaType>({
  resolver: zodResolver(surveySchema),
  defaultValues: {
    // Section 1: BEIE Framework (Radio)
    q1_1: "", q1_2: "",
    
    // Section 2: Moral Governance (Radio)
    q2_1: "", q2_2: "",
    
    // Section 3: Foundations (Checkbox, Radio)
    q3_1: [], q3_2: "",
    
    // Section 4: Transformers (Radio, Radio)
    q4_1: "", q4_2: "",
    
    // Section 5: Enablers (Radio, Checkbox, Radio) - CORRECTED
    q5_1: "", q5_2: [], q5_3: "",
    
    // Section 6: Connectors (Radio, Checkbox, Radio) - CORRECTED
    q6_1: "", q6_2: [], q6_3: "",
    
    // Section 7: Financiers (Radio, Checkbox, Radio) - CORRECTED
    q7_1: "", q7_2: [], q7_3: "",
    
    // Section 8: Strategic Options (Radio, Radio)
    q8_1: "", q8_2: "",
    
    // Section 9: Budget (Radio)
    q9_1: "",
    
    // Section 10: Targets (Radio)
    q10_1: "",
    
    // Section 11: Equity (Radio, Checkbox)
    q11_1: "", q11_2: [],
    
    // Section 12: Climate (Radio, Checkbox)
    q12_1: "", q12_2: [],
    
    // Section 13: Policy (Checkbox, Radio)
    q13_1: [], q13_2: "",
    
    // Section 14: Demographics (Select, Select, Checkbox)
    demo_category: "", demo_province: "", demo_expertise: [],
    
    // Section 15: Submission (Checkbox)
    consent_final: false,
  },
  mode: "onTouched",
});

// ─── HELPER SCHEMAS ─────────────────────────────────────────────────────────
const scale1to5 = z.enum(["1", "2", "3", "4", "5"], {
  errorMap: () => ({ message: "Please select a rating to proceed." }),
});

const checkboxArray = z.array(z.string()).min(1, "Please select at least one option.");

// ─── MAIN SCHEMA ────────────────────────────────────────────────────────────
export const surveySchema = z.object({
  // ── SECTION 1: BEIE Framework ──
  q1_1: scale1to5, // Understanding (Radio 1-5)
  q1_2: scale1to5, // Relevance (Radio 1-5)

  // ── SECTION 2: Moral Governance ──
  q2_1: scale1to5, // Importance (Radio 1-5)
  q2_2: scale1to5, // Implementation effectiveness (Radio 1-5)

  // ── SECTION 3: Foundations ──
  q3_1: checkboxArray, // Priority areas (Checkboxes)
  q3_2: scale1to5,     // Feasibility of post-harvest target (Radio 1-5)

  // ── SECTION 4: Transformers ──
  q4_1: z.enum(["cert", "recognition", "infra", "skills"], {
    errorMap: () => ({ message: "Please identify the most critical barrier." }),
  }),
  q4_2: scale1to5, // Halal Park effectiveness (Radio 1-5)

  // ── SECTION 5: Enablers ──
  q5_1: scale1to5,     // Infrastructure rating (Radio 1-5)
  q5_2: checkboxArray, // Enabler sectors (Checkboxes)
  q5_3: scale1to5,     // Broadband realism (Radio 1-5)

  // ── SECTION 6: Connectors ──
  q6_1: scale1to5,     // BIMP-EAGA importance (Radio 1-5)
  q6_2: checkboxArray, // Export markets (Checkboxes)
  q6_3: scale1to5,     // Export target realism (Radio 1-5)

  // ── SECTION 7: Financiers ──
  q7_1: scale1to5,     // Islamic finance criticality (Radio 1-5)
  q7_2: checkboxArray, // Financial instruments (Checkboxes)
  q7_3: scale1to5,     // Inclusion target realism (Radio 1-5)

  // ── SECTION 8: Strategic Options ──
  q8_1: z.enum(["heds", "gems", "ifes", "ieds"], {
    errorMap: () => ({ message: "Please select a strategic option." }),
  }),
  q8_2: z.enum(["highly_logical", "mostly_logical", "needs_adjustment", "flawed"], {
    errorMap: () => ({ message: "Please rate the sequencing logic." }),
  }),

  // ── SECTION 9: Budget ──
  q9_1: z.enum(["realistic", "underestimated", "overestimated", "unable"], {
    errorMap: () => ({ message: "Please assess budget realism." }),
  }),

  // ── SECTION 10: Targets & IEDS Matrix ──
  q10_1: z.enum(["appropriately_ambitious", "too_conservative", "too_ambitious", "mixed"], {
    errorMap: () => ({ message: "Please assess target ambition." }),
  }),
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

  // ── SECTION 11: Provincial Equity ──
  q11_1: scale1to5,     // Affirmative policy (Radio 1-5)
  q11_2: checkboxArray, // Mechanisms to reduce disparity (Checkboxes)

  // ── SECTION 12: Climate Resilience ──
  q12_1: scale1to5,     // Green economy priority (Radio 1-5)
  q12_2: checkboxArray, // Climate adaptation mechanisms (Checkboxes)

  // ── SECTION 13: Policy & Governance ──
  q13_1: z.array(z.string()).min(1, "Please select at least one priority.").max(2, "Please select no more than 2 priorities."),
  q13_2: scale1to5, // BICC effectiveness (Radio 1-5)

  // ── SECTION 14: Demographics ──
  demo_category: z.string().min(1, "Please select your stakeholder category."),
  demo_province: z.string().min(1, "Please select your province."),
  demo_expertise: checkboxArray,

  // ── SECTION 15: Submission ──
  consent_final: z.literal(true, {
    errorMap: () => ({ message: "You must consent to submit the survey." }),
  }),
});

// ─── EXPORTED TYPE ──────────────────────────────────────────────────────────
export type SurveySchemaType = z.infer<typeof surveySchema>;
