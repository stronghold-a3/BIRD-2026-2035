// src/lib/survey-schema.ts
// BIRD 2026–2035 · Validation Survey Zod Schema
// Single source of truth for all 16 survey sections

import { z } from "zod";

// ── Reusable field validators ───────────────────────────────────────────────

const requiredString = z.string().min(1, "This field is required");
const optionalString = z.string().optional();
const requiredNumber = z.number().min(1, "Required").max(5, "Max 5");
const optionalNumber = z.number().min(1).max(5).optional();
const requiredBoolean = z.boolean();
const requiredArray = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).min(1, "Select at least one option");

// ── IEDS Matrix sub-schema ──────────────────────────────────────────────────

const matrixRowSchema = z.object({
  economic_impact: z.number().min(0).max(10).default(5),
  feasibility: z.number().min(0).max(10).default(5),
  identity_alignment: z.number().min(0).max(10).default(5),
  systems_leverage: z.number().min(0).max(10).default(5),
  risk_return: z.number().min(0).max(10).default(5),
  inclusivity: z.number().min(0).max(10).default(5),
  sustainability: z.number().min(0).max(10).default(5),
});

const iedsMatrixSchema = z.object({
  heds: matrixRowSchema,
  gems: matrixRowSchema,
  ifes: matrixRowSchema,
  ieds: matrixRowSchema,
});

// ── Conditional rules type (for UI logic, not validation) ───────────────────

export type ConditionalRules = Record<string, (values: Record<string, unknown>) => boolean>;

export const conditionalRules: ConditionalRules = {
  // Section 3: Basilan-specific questions
  showBasilanAlert: (v) => v.demo_province === "basilan",
  // Section 3: El Niño questions
  showElNino: (v) => Array.isArray(v.q3_1_priorities) && v.q3_1_priorities.includes("agriculture"),
  // Section 4: Show commodity impact only if halal selected
  showCommodityImpact: (v) => v.q4_2_halal_park === "yes",
};

// ── Main Survey Schema ──────────────────────────────────────────────────────

export const surveySchema = z.object({
  // ═══ Section 1: BEIE Framework Context ═══
  q1_1: requiredString.describe("Understanding of BEIE Framework"),
  q1_2: requiredString.describe("Relevance of BEIE to BARMM"),

  // ═══ Section 2: Moral Governance Operating System ═══
  q2_1: requiredNumber.describe("Importance of Moral Governance"),
  q2_2: requiredNumber.describe("Implementation readiness"),
  q2_3_archetype: requiredString.describe("Dominant systems archetype"),
  q2_4_peace: z.array(z.string()).default([]).describe("Peace milestones"),

  // ═══ Section 3: Cluster 1 — Foundations ═══
  q3_1_priorities: z.array(z.string()).min(1, "Select at least one priority"),
  q3_2_feasibility: requiredNumber,
  q3_el_nino_impact: optionalNumber,
  q3_el_nino_like: optionalNumber,
  q3_pestalotiopsis_impact: optionalNumber,
  q3_pestalotiopsis_like: optionalNumber,
  q3_postharvest_impact: optionalNumber,
  q3_postharvest_like: optionalNumber,
  q3_limits_growth: optionalString,

  // ═══ Section 4: Cluster 2 — Transformers ═══
  q4_1_barrier: requiredString,
  q4_2_halal_park: requiredString,
  q4_3_fixes_fail: requiredString,
  q4_4_commodity_impact: optionalString,
  q4_5_heds_ranking: z.array(z.string()).default([]),

  // ═══ Section 5: Cluster 3 — Enablers ═══
  q5_1_infra: requiredNumber,
  q5_2_sectors: z.array(z.string()).min(1, "Select at least one sector"),
  q5_3_broadband: requiredNumber,
  q5_4_literacy: requiredNumber,
  q5_5_stunting: requiredNumber,
  q5_6_digital_divide: requiredString,

  // ═══ Section 6: Cluster 4 — Connectors ═══
  q6_1_bimpeaga: requiredNumber,
  q6_2_markets: z.array(z.string()).min(1, "Select at least one market"),
  q6_3_export_target: requiredNumber,
  q6_4_uae_feasibility: requiredNumber,
  q6_5_perception: requiredString,

  // ═══ Section 7: Cluster 5 — Financiers ═══
  q7_1_criticality: requiredNumber,
  q7_2_instruments: z.array(z.string()).min(1, "Select at least one instrument"),
  q7_3_inclusion_target: requiredNumber,
  q7_4_asset_paradox: requiredString,
  q7_5_block_grant: requiredString,

  // ═══ Section 8: Strategic Options ═══
  q8_1_strategy: requiredString,
  q8_2_sequencing: requiredString,
  q8_3_comments: z.string().default(""),

  // ═══ Section 9: Budget & Targets ═══
  q9_1_budget: requiredNumber,

  // ═══ Section 10: IEDS Matrix Evaluation ═══
  q10_1_ambition: requiredNumber,
  q10_matrix: iedsMatrixSchema,

  // ═══ Section 11: Provincial Equity ═══
  q11_1_affirmative: requiredString,
  q11_2_mechanisms: z.array(z.string()).default([]),

  // ═══ Section 12: Climate Resilience ═══
  q12_1_green_priority: requiredNumber,
  q12_2_adaptation: z.array(z.string()).min(1, "Select at least one adaptation measure"),

  // ═══ Section 13: Policy & Governance ═══
  q13_1_legislation: z.array(z.string()).min(1, "Select at least one legislation priority"),
  q13_2_bicc: requiredNumber,

  // ═══ Section 14: Demographics ═══
  demo_category: requiredString,
  demo_province: requiredString,
  demo_expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
  demo_name: requiredString,
  demo_email: z.string().email("Valid email required"),
  demo_organization: optionalString,

  // ═══ Province-specific conditional fields ═══
  basilan_peace_questions: z.string().optional(),
  maguindanao_halal_questions: z.string().optional(),
  tawitawi_seaweed_questions: z.string().optional(),
  lanao_lake_questions: z.string().optional(),

  // ═══ Section 15: Final Consent ═══
  consent_final: z.literal(true, {
    errorMap: () => ({ message: "You must consent to submit" }),
  }),

  // ═══ Section 16: C.A.R.E. Validation ═══
  care_context: requiredNumber,
  care_action: requiredNumber,
  care_realtime: requiredNumber,
  care_evidence: requiredNumber,
  care_overall: requiredNumber,
});

export type SurveySchemaType = z.infer<typeof surveySchema>;
