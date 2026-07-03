// src/lib/survey-schema.ts
import { z } from "zod";

// ─── Helper Schemas ──────────────────────────────────────────────────────────
const scale1to5 = z.enum(["1", "2", "3", "4", "5"], {
  errorMap: () => ({ message: "Please select a rating to proceed." }),
});

const scale1to4 = z.enum(["1", "2", "3", "4"], {
  errorMap: () => ({ message: "Please select a rating to proceed." }),
});

const checkboxArray = z.array(z.string()).min(1, "Please select at least one option.");

const optionalText = z.string().optional();

// ─── IEDS Matrix Sub-Schema (7 criteria × 4 options) ────────────────────────
const iedsCriteria = z.object({
  economic_impact: z.coerce.number().min(1).max(10),
  feasibility: z.coerce.number().min(1).max(10),
  identity_alignment: z.coerce.number().min(1).max(10),
  systems_leverage: z.coerce.number().min(1).max(10),
  risk_return: z.coerce.number().min(1).max(10),
  inclusivity: z.coerce.number().min(1).max(10),
  sustainability: z.coerce.number().min(1).max(10),
});

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SURVEY SCHEMA — 16 Sections
// ═════════════════════════════════════════════════════════════════════════════
export const surveySchema = z.object({

  // ── SECTION 1: BEIE Framework ──────────────────────────────────────────────
  q1_1: scale1to5, // Understanding
  q1_2: scale1to5, // Relevance

  // ── SECTION 2: Moral Governance (Cross-Cutting) ────────────────────────────
  q2_1: scale1to5, // Moral Governance importance
  q2_2: scale1to5, // Implementation effectiveness
  // Elephant: Shifting the Burden archetype agreement
  q2_3_archetype: scale1to5, // "Fragmented BMOA coordination triggers Shifting the Burden"
  // Elephant: Peace Dividend milestones
  q2_4_peace: checkboxArray, // Which milestones validate peace dividend

  // ── SECTION 3: Cluster 1 – Foundations ─────────────────────────────────────
  q3_1_priorities: checkboxArray, // Priority investment areas
  q3_2_feasibility: scale1to5,    // Post-harvest loss reduction feasibility
  // Elephant: Specific threats Impact × Likelihood
  q3_el_nino_impact: scale1to5,
  q3_el_nino_like: scale1to5,
  q3_pestalotiopsis_impact: scale1to5,
  q3_pestalotiopsis_like: scale1to5,
  q3_postharvest_impact: scale1to5,
  q3_postharvest_like: scale1to5,
  // Elephant: Limits to Growth
  q3_limits_growth: z.enum(["zbip", "cold_chain", "watershed", "fmr"]),

  // ── SECTION 4: Cluster 2 – Transformers ────────────────────────────────────
  q4_1_barrier: z.enum(["cert", "recognition", "infra", "skills"]),
  q4_2_halal_park: scale1to5,
  // Elephant: Fixes that Fail archetype
  q4_3_fixes_fail: scale1to5, // BHB bottleneck triggering Fixes that Fail
  // Elephant: Raw Commodity Curse
  q4_4_commodity_impact: scale1to5,
  // HEDS anchor ranking
  q4_5_heds_ranking: checkboxArray, // Select top 2

  // ── SECTION 5: Cluster 3 – Enablers ────────────────────────────────────────
  q5_1_infra: scale1to5,          // Infrastructure rating
  q5_2_sectors: checkboxArray,    // Enabler sectors needing investment
  q5_3_broadband: scale1to5,      // Broadband realism
  // Elephant: Human Capital Crisis severity
  q5_4_literacy: scale1to5,       // 59.3% literacy constraint
  q5_5_stunting: scale1to5,       // 45% child stunting constraint
  // Elephant: Digital Divide
  q5_6_digital_divide: scale1to5, // Constraint on BIMP-EAGA trade formalization

  // ── SECTION 6: Cluster 4 – Connectors ──────────────────────────────────────
  q6_1_bimpeaga: scale1to5,       // BIMP-EAGA importance
  q6_2_markets: checkboxArray,    // Export market priorities
  q6_3_export_target: scale1to5,  // ₱40B export realism
  // Elephant: UAE/GCC Corridor feasibility
  q6_4_uae_feasibility: scale1to5,
  // Elephant: Ghost of Conflict Past
  q6_5_perception: z.enum(["informal_trade", "rido", "halal_hospitality", "logistics"]),

  // ── SECTION 7: Cluster 5 – Financiers ──────────────────────────────────────
  q7_1_criticality: scale1to5,    // Islamic finance criticality
  q7_2_instruments: checkboxArray, // Financial instruments to prioritize
  q7_3_inclusion_target: scale1to5,
  // Elephant: Growth and Underinvestment archetype
  q7_4_asset_paradox: z.enum(["cultural", "regulatory", "products", "branches"]),
  // Elephant: Block Grant Dependency
  q7_5_block_grant: scale1to5,

  // ── SECTION 8: Strategic Options ───────────────────────────────────────────
  q8_1_strategy: z.enum(["heds", "gems", "ifes", "ieds"]),
  q8_2_sequencing: z.enum(["highly_logical", "mostly_logical", "needs_adjustment", "flawed"]),
  q8_3_comments: optionalText,

  // ── SECTION 9: Budget & Targets ────────────────────────────────────────────
  q9_1_budget: z.enum(["realistic", "underestimated", "overestimated", "unable"]),
  q10_1_ambition: z.enum(["appropriately_ambitious", "too_conservative", "too_ambitious", "mixed"]),

  // ── SECTION 10: IEDS Evaluation Matrix ─────────────────────────────────────
  q10_matrix: z.object({
    heds: iedsCriteria,
    gems: iedsCriteria,
    ifes: iedsCriteria,
    ieds: iedsCriteria,
  }),

  // ── SECTION 11: Provincial Equity ──────────────────────────────────────────
  q11_1_affirmative: scale1to5,
  q11_2_mechanisms: checkboxArray,

  // ── SECTION 12: Climate Resilience ─────────────────────────────────────────
  q12_1_green_priority: scale1to5,
  q12_2_adaptation: checkboxArray,

  // ── SECTION 13: Policy & Governance ────────────────────────────────────────
  q13_1_legislation: z.array(z.string()).min(1).max(2, "Select no more than 2."),
  q13_2_bicc: scale1to5,

  // ── SECTION 14: Demographics ───────────────────────────────────────────────
  demo_category: z.string().min(1, "Please select your stakeholder category."),
  demo_province: z.string().min(1, "Please select your province."),
  demo_expertise: checkboxArray,
  demo_name: optionalText,
  demo_email: z.string().email("Valid email required.").optional().or(z.literal("")),
  demo_organization: optionalText,

  // ── SECTION 15: Submission Consent ─────────────────────────────────────────
  consent_final: z.literal(true, {
    errorMap: () => ({ message: "You must consent to submit." }),
  }),

  // ── SECTION 16: C.A.R.E. & Khalifa Validation ─────────────────────────────
  care_context: scale1to5,
  care_action: scale1to5,
  care_realtime: scale1to5,
  care_evidence: scale1to5,
  care_overall: scale1to5,
});

export type SurveySchemaType = z.infer<typeof surveySchema>;
