# SURVEYGUIDE.md — BIRD 2026–2035 SurveyWizard Integration Guide

> **Version:** 1.0  
> **Date:** 2026-07-09  
> **Purpose:** Wire the SurveyWizard to the BIRD strategic planning engine, Supabase backend, and domain-specific computation layer.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [File-by-File Integration Assessment](#3-file-by-file-integration-assessment)
4. [Required Enhancements](#4-required-enhancements)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Appendix: Type Mappings](#6-appendix-type-mappings)

---

## 1. Executive Summary

The SurveyWizard (`src/components/strategic/SurveyWizard.tsx`) is a 16-step wizard that collects stakeholder input across the BEIE framework, Moral Governance, cluster assessments, and strategic validation. The uploaded BIRD files provide:

| File | Role | Integration Necessity |
|------|------|----------------------|
| `strategicPlanStore.ts` | Core domain schema (types, factories, storage) | **CRITICAL** — Survey responses must hydrate into `StrategicPlan` entities |
| `formulas.ts` | BIRD mathematical formulas (RI, KPI, ROI, leverage) | **CRITICAL** — Survey scoring must use official BIRD formulas |
| `supabase.ts` | Supabase client + Edge Functions | **CRITICAL** — Survey submission must persist via `STRATEGIC_PLANNER_SYNC` |
| `utils.ts` | Utilities + template converter | **HIGH** — Template-to-plan conversion for survey-generated plans |
| `motion-shim.tsx` | Framer-motion shim | **LOW** — Only if SurveyWizard uses animations |

**Verdict:** All files except `motion-shim.tsx` require integration wiring. The SurveyWizard currently submits raw survey data; it must be enhanced to:

- Compute BIRD scores using `formulas.ts` during survey progression
- Convert survey responses into `StrategicPlan` entities using `strategicPlanStore.ts`
- Persist plans via Supabase Edge Functions in `supabase.ts`
- Use `utils.ts` for SWOT metric computation and template conversion

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SURVEYWIZARD ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ 16 Sections  │───▶│  Form State  │───▶│  BIRD Score  │                  │
│  │ (react-hook- │    │  (useForm)   │    │  Computation │                  │
│  │  form + zod) │    │              │    │  (formulas)  │                  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                  │                          │
│                                                  ▼                          │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              STRATEGIC PLAN ENTITY (strategicPlanStore)       │          │
│  │  ┌─────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────┐    │          │
│  │  │ SWOT    │ │ Strategic   │ │ BSC      │ │ PAPs       │    │          │
│  │  │ Items   │ │ Options     │ │ Objectives│ │            │    │          │
│  │  └─────────┘ └─────────────┘ └──────────┘ └────────────┘    │          │
│  └────────────────────┬─────────────────────────────────────────┘          │
│                       │                                                     │
│                       ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              SUPABASE EDGE FUNCTIONS (supabase.ts)            │          │
│  │  • STRATEGIC_PLANNER_SYNC (POST/GET/DELETE)                  │          │
│  │  • AI_STRATEGY_ASSISTANT (optional: AI recommendations)      │          │
│  │  • EMAIL_NOTIFICATIONS (post-submission alerts)              │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. File-by-File Integration Assessment

### 3.1 `strategicPlanStore.ts` — Domain Schema & Factories

**Status:** ⚠️ **MISSING WIRING** — SurveyWizard does not import or use this file.

**What it provides:**
- `StrategicPlan` root entity with `swotItems`, `strategicOptions`, `objectives`, `paps`
- `SWOTItem`, `StrategicOption`, `BSCObjective`, `PAP` interfaces
- `createEmptyPlan()` and `createSamplePlan()` factories
- `computePlanCompletion()` utility
- `loadFromStorage()` / `saveToStorage()` for local persistence

**Integration Requirements:**

```typescript
// NEW: Import in SurveyWizard.tsx
import {
  createEmptyPlan,
  type StrategicPlan,
  type SWOTItem,
  type StrategicOption,
  type BSCObjective,
  type PAP,
  type SWOTCategory,
  type BEIECluster,
  type LeveragePoint,
  generateId,
} from "@/lib/strategicPlanStore";
```

**Mapping Survey Responses → StrategicPlan:**

| Survey Field | StrategicPlan Field | Section |
|-------------|---------------------|---------|
| `q1_1`, `q1_2` | `organization`, `strategicIntent` | 1 |
| `q2_1`–`q2_4` | `swotItems` (moral governance archetype) | 2 |
| `q3_1`–`q3_limits_growth` | `swotItems` (Foundations cluster) | 3 |
| `q4_1`–`q4_5` | `swotItems` (Transformers cluster) | 4 |
| `q5_1`–`q5_6` | `swotItems` (Enablers cluster) | 5 |
| `q6_1`–`q6_5` | `swotItems` (Connectors cluster) | 6 |
| `q7_1`–`q7_5` | `swotItems` (Financiers cluster) | 7 |
| `q8_1`–`q8_3` | `strategicOptions` | 8 |
| `q9_1` | `paps[].budget` aggregate | 9 |
| `q10_matrix` | `strategicOptions[].priorityScore` | 10 |
| `q11_1`–`q11_2` | `objectives` (equity KPIs) | 11 |
| `q12_1`–`q12_2` | `objectives` (climate KPIs) | 12 |
| `q13_1`–`q13_2` | `objectives` (governance KPIs) | 13 |
| `demo_*` | `createdByName`, `organization` | 14 |
| `care_*` | Plan metadata / validation score | 15 |
| `consent_final` | Plan status activation | 16 |

**Implementation Pattern:**

```typescript
// NEW FUNCTION: Add to SurveyWizard or a new survey-converter.ts
function convertSurveyToPlan(data: SurveySchemaType, userInfo: UserInfo): StrategicPlan {
  const plan = createEmptyPlan({
    name: `BIRD Survey — ${data.demo_organization || "Anonymous"}`,
    organization: data.demo_organization || "",
    vision: "Emerging Bangsamoro — Survey-derived strategic plan",
    mission: data.q8_1 || "",
    strategicIntent: data.q1_2 || "",
  }, userInfo);

  // Map SWOT items from survey responses
  plan.swotItems = buildSwotItemsFromSurvey(data);

  // Map strategic options
  plan.strategicOptions = buildStrategicOptionsFromSurvey(data);

  // Map objectives + KPIs
  plan.objectives = buildObjectivesFromSurvey(data);

  // Map PAPs
  plan.paps = buildPAPsFromSurvey(data);

  return plan;
}
```

---

### 3.2 `formulas.ts` — BIRD Mathematical Formulas

**Status:** ⚠️ **MISSING WIRING** — SurveyWizard computes no scores.

**What it provides:**
- `calculateResilienceIndex()` — √(Impact × Likelihood)
- `calculateRiskLevel()` — Critical/High/Medium/Low/Minimal
- `calculateVulnerabilityIndex()` — (Impact × Likelihood) / Control
- `calculateKPIProgress()` — (Current / Target) × 100
- `calculateLeveragePriority()` — Weighted leverage point scoring
- `estimateInvestmentROI()` — Sector-specific ROI estimates
- `getStatusColor()` — Status color mapping
- `PHASE1_BUDGET_ALLOCATION` — Reference budget data

**Integration Requirements:**

```typescript
// NEW: Import in SurveyWizard.tsx
import {
  calculateResilienceIndex,
  calculateRiskLevel,
  calculateVulnerabilityIndex,
  calculateKPIProgress,
  calculateLeveragePriority,
  estimateInvestmentROI,
  getStatusColor,
  formatCurrency,
  formatGrowthRate,
} from "@/lib/formulas";
```

**Where to apply formulas:**

| Survey Section | Formula Application | UI Impact |
|---------------|---------------------|-----------|
| Sections 3–7 (Cluster assessments) | `calculateResilienceIndex()` + `calculateRiskLevel()` | Real-time risk badges on each cluster |
| Section 9 (Budget) | `estimateInvestmentROI()` | ROI preview per sector |
| Section 10 (IEDS Matrix) | `calculateLeveragePriority()` | Priority ranking of strategies |
| Section 12 (Climate) | `calculateVulnerabilityIndex()` | Vulnerability score display |
| All KPI fields | `calculateKPIProgress()` | Progress bars on targets |

**Implementation Pattern:**

```typescript
// NEW: Add to SurveyWizard — real-time score computation
const computedScores = useMemo(() => {
  const scores: Record<string, number> = {};

  // Example: Section 3 (Foundations) resilience
  if (values.q3_el_nino_impact && values.q3_el_nino_like) {
    scores.foundationsResilience = calculateResilienceIndex(
      values.q3_el_nino_impact,
      values.q3_el_nino_like
    );
  }

  // Example: Section 9 budget ROI
  if (values.q9_1 && values.q8_1) {
    const sector = inferSectorFromStrategy(values.q8_1);
    scores.estimatedROI = estimateInvestmentROI(values.q9_1, sector);
  }

  return scores;
}, [form.watch()]);
```

---

### 3.3 `supabase.ts` — Backend Persistence

**Status:** ⚠️ **PARTIAL WIRING** — SurveyWizard calls `submitSurvey()` but this is NOT the Supabase Edge Function.

**Current code:**
```typescript
import { submitSurvey } from "@/lib/api"; // ← Unknown implementation
```

**What `supabase.ts` provides:**
- `supabase` client (auth + data)
- `EDGE_FUNCTIONS.STRATEGIC_PLANNER_SYNC` — Plan CRUD
- `EDGE_FUNCTIONS.AI_STRATEGY_ASSISTANT` — AI recommendations
- `EDGE_FUNCTIONS.EMAIL_NOTIFICATIONS` — Email alerts
- `fetchPlannerState()`, `saveFullState()`, `saveSinglePlan()`, `archivePlan()`

**Integration Requirements:**

**Replace `submitSurvey()` with Supabase-backed persistence:**

```typescript
// NEW: In SurveyWizard.tsx — replace the onSubmit handler
import {
  supabase,
  saveSinglePlan,
  triggerEmailNotification,
  EDGE_FUNCTIONS,
} from "@/lib/supabase";

const onSubmit = useCallback(async (data: SurveySchemaType) => {
  // ... validation ...

  setIsSubmitting(true);
  try {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error("Session expired");

    // 2. Build user info
    const userInfo: UserInfo = {
      id: user.id,
      email: user.email!,
      name: data.demo_name || user.email!,
      organization: data.demo_organization,
    };

    // 3. Convert survey → StrategicPlan
    const plan = convertSurveyToPlan(data, userInfo);

    // 4. Save to Supabase
    const saved = await saveSinglePlan(plan, token);
    if (!saved) throw new Error("Failed to save plan to BIRD repository");

    // 5. Trigger email notification
    await triggerEmailNotification("welcome", user.id, {
      plan_name: plan.name,
      organization: plan.organization,
    });

    setIsSuccess(true);
    toast.success("Your strategic input has been securely recorded in the BIRD repository.");
  } catch (error) {
    console.error("Submission failed:", error);
    toast.error(error instanceof Error ? error.message : "Submission failed.");
  } finally {
    setIsSubmitting(false);
  }
}, [form]);
```

**Also required:** Update the success-state button to use `EXTERNAL_URLS.PWA`:

```typescript
// CURRENT (hardcoded):
window.open("https://strategy-ai-planner-1.deploypad.app/", "_blank")

// RECOMMENDED (from supabase.ts):
import { EXTERNAL_URLS } from "@/lib/supabase";
window.open(EXTERNAL_URLS.PWA, "_blank")
```

---

### 3.4 `utils.ts` — Utilities & Template Converter

**Status:** ⚠️ **MISSING WIRING** — SurveyWizard does not import this file.

**What it provides:**
- `cn()` — Tailwind class merging
- `calculateSWOTMetric()` — Unified SWOT scoring (strength/weakness/opportunity/threat)
- `convertTemplateToPlan()` — Template → StrategicPlan conversion
- `getStatusColor()` — Status badge styling

**Integration Requirements:**

```typescript
// NEW: Import in SurveyWizard.tsx
import {
  calculateSWOTMetric,
  getStatusColor,
  cn,
} from "@/lib/utils";
```

**Usage in survey sections:**

```typescript
// In section components (e.g., Section3_Foundations):
const swotScore = calculateSWOTMetric(
  "weakness", // or "strength", "opportunity", "threat"
  impactScore,
  likelihoodScore
);

// Display with appropriate color
const statusClass = getStatusColor(riskLevel); // e.g., "on-track", "delayed"
```

**Note:** `convertTemplateToPlan()` is useful if the SurveyWizard offers "start from template" functionality. This is a **future enhancement**.

---

### 3.5 `motion-shim.tsx` — Animation Shim

**Status:** ✅ **NOT REQUIRED** — SurveyWizard does not use `framer-motion`.

The SurveyWizard uses CSS transitions (`animate-pulse`, `transition-colors`) and native React state. No animation library integration is needed.

---

## 4. Required Enhancements

### 4.1 Critical (Must-Have)

#### E1. Wire `strategicPlanStore.ts` — Survey-to-Plan Conversion

**File:** `src/lib/survey-converter.ts` (NEW)

```typescript
// src/lib/survey-converter.ts
import {
  createEmptyPlan,
  generateId,
  type StrategicPlan,
  type SWOTItem,
  type StrategicOption,
  type BSCObjective,
  type PAP,
  type UserInfo,
  type SWOTCategory,
  type BEIECluster,
  type LeveragePoint,
} from "./strategicPlanStore";

import type { SurveySchemaType } from "./survey-schema";

export function convertSurveyToPlan(
  data: SurveySchemaType,
  userInfo: UserInfo
): StrategicPlan {
  const plan = createEmptyPlan(
    {
      name: `BIRD Survey — ${data.demo_organization || "Stakeholder Input"}`,
      organization: data.demo_organization || "",
      vision: "Emerging Bangsamoro 2026–2035",
      mission: data.q8_1 || "",
      strategicIntent: data.q1_2 || "",
      planningPeriodStart: "2026-01-01",
      planningPeriodEnd: "2035-12-31",
      status: "draft",
    },
    userInfo
  );

  plan.swotItems = buildSwotItems(data, userInfo);
  plan.strategicOptions = buildStrategicOptions(data, userInfo);
  plan.objectives = buildObjectives(data, userInfo);
  plan.paps = buildPAPs(data, userInfo);

  return plan;
}

function buildSwotItems(data: SurveySchemaType, userInfo: UserInfo): SWOTItem[] {
  const items: SWOTItem[] = [];
  const now = new Date().toISOString();

  // Section 3: Foundations
  if (data.q3_el_nino_impact && data.q3_el_nino_like) {
    items.push({
      id: generateId(),
      category: "threat",
      description: `El Niño impact assessment: ${data.q3_el_nino_impact}/5 impact, ${data.q3_el_nino_like}/5 likelihood`,
      impactScore: data.q3_el_nino_impact,
      likelihoodScore: data.q3_el_nino_like,
      aiGenerated: false,
      beieCluster: "foundations",
      leveragePoint: "LP5",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Section 4: Transformers — Halal barrier
  if (data.q4_1_barrier) {
    items.push({
      id: generateId(),
      category: "weakness",
      description: data.q4_1_barrier,
      impactScore: 4,
      likelihoodScore: 4,
      aiGenerated: false,
      beieCluster: "transformers",
      leveragePoint: "LP1",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Section 5: Enablers — Infrastructure
  if (data.q5_1_infra) {
    items.push({
      id: generateId(),
      category: data.q5_1_infra >= 4 ? "weakness" : "strength",
      description: `Infrastructure adequacy rated ${data.q5_1_infra}/5`,
      impactScore: data.q5_1_infra,
      likelihoodScore: 5,
      aiGenerated: false,
      beieCluster: "enablers",
      leveragePoint: "LP2",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Section 6: Connectors — BIMP-EAGA
  if (data.q6_1_bimpeaga) {
    items.push({
      id: generateId(),
      category: data.q6_1_bimpeaga >= 4 ? "opportunity" : "weakness",
      description: `BIMP-EAGA integration potential rated ${data.q6_1_bimpeaga}/5`,
      impactScore: data.q6_1_bimpeaga,
      likelihoodScore: 4,
      aiGenerated: false,
      beieCluster: "connectors",
      leveragePoint: "LP3",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Section 7: Financiers — Islamic finance
  if (data.q7_1_criticality) {
    items.push({
      id: generateId(),
      category: data.q7_1_criticality >= 4 ? "opportunity" : "weakness",
      description: `Islamic finance criticality rated ${data.q7_1_criticality}/5`,
      impactScore: data.q7_1_criticality,
      likelihoodScore: 4,
      aiGenerated: false,
      beieCluster: "financiers",
      leveragePoint: "LP4",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Section 2: Moral Governance — Archetype
  if (data.q2_3_archetype) {
    items.push({
      id: generateId(),
      category: "strength",
      description: `Moral Governance archetype: ${data.q2_3_archetype}`,
      impactScore: data.q2_1 || 3,
      likelihoodScore: data.q2_2 || 4,
      aiGenerated: false,
      beieCluster: "cross-cutting",
      leveragePoint: "LP3",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  return items;
}

function buildStrategicOptions(
  data: SurveySchemaType,
  userInfo: UserInfo
): StrategicOption[] {
  const options: StrategicOption[] = [];
  const now = new Date().toISOString();

  if (data.q8_1) {
    options.push({
      id: generateId(),
      optionType: "SO",
      title: data.q8_1,
      description: data.q8_3 || "",
      priorityScore: data.q10_1_ambition || 3,
      feasibilityScore: data.q3_2_feasibility || 3,
      selected: true,
      leveragePoint: "LP1",
      beieCluster: "transformers",
      birdPhase: "1",
      resourceRequirement: data.q9_1 && data.q9_1 > 1_000_000_000 ? "high" : "medium",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  // Add IEDS as selected if matrix scores it highest
  if (data.q10_matrix) {
    const matrix = data.q10_matrix;
    const scores = {
      heds: Object.values(matrix.heds).reduce((a, b) => a + b, 0),
      gems: Object.values(matrix.gems).reduce((a, b) => a + b, 0),
      ifes: Object.values(matrix.ifes).reduce((a, b) => a + b, 0),
      ieds: Object.values(matrix.ieds).reduce((a, b) => a + b, 0),
    };
    const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "ieds") as
      | "heds" | "gems" | "ifes" | "ieds";

    const strategyMap = {
      heds: { title: "Halal Ecosystem Development Strategy", lp: "LP1" as LeveragePoint, cluster: "transformers" as BEIECluster },
      gems: { title: "Green Economy & MSME Strategy", lp: "LP5" as LeveragePoint, cluster: "foundations" as BEIECluster },
      ifes: { title: "Islamic Finance Ecosystem Strategy", lp: "LP4" as LeveragePoint, cluster: "financiers" as BEIECluster },
      ieds: { title: "Integrated Ecosystem Development Strategy", lp: "LP1" as LeveragePoint, cluster: "cross-cutting" as BEIECluster },
    };

    options.push({
      id: generateId(),
      optionType: "SO",
      title: strategyMap[winner].title,
      description: `Highest-scoring strategy from IEDS Matrix evaluation (${scores[winner]} points)`,
      priorityScore: 5,
      feasibilityScore: data.q3_2_feasibility || 3,
      selected: true,
      leveragePoint: strategyMap[winner].lp,
      beieCluster: strategyMap[winner].cluster,
      birdPhase: "1",
      resourceRequirement: "high",
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: now,
    });
  }

  return options;
}

function buildObjectives(data: SurveySchemaType, userInfo: UserInfo): BSCObjective[] {
  const objectives: BSCObjective[] = [];
  const now = new Date().toISOString();

  // Financial: Budget target
  if (data.q9_1) {
    const objId = generateId();
    objectives.push({
      id: objId,
      perspective: "financial",
      objective: `Mobilize ₱${(data.q9_1 / 1e9).toFixed(1)}B in strategic investments`,
      description: "Survey-derived budget target for BIRD 2026–2035 implementation",
      weight: 1.5,
      leveragePoint: "LP1",
      beieCluster: "transformers",
      birdPhase: "1",
      createdBy: userInfo.id,
      createdByName: userInfo.name,
      createdAt: now,
      champion: userInfo.id,
      championName: userInfo.name,
      kpis: [
        {
          id: generateId(),
          objectiveId: objId,
          name: "Total Investment Mobilized",
          description: "Cumulative investment approvals and commitments",
          unit: "₱B",
          baselineValue: 5.1,
          targetValue: data.q9_1 / 1e9,
          target2030: (data.q9_1 / 1e9) * 0.6,
          currentValue: 5.1,
          frequency: "quarterly",
          owner: userInfo.id,
          ownerName: userInfo.name,
          ownerEmail: userInfo.email,
          status: "on-track",
          leveragePoint: "LP1",
        },
      ],
    });
  }

  // Stakeholder: Poverty reduction
  if (data.q11_1_affirmative) {
    const objId = generateId();
    objectives.push({
      id: objId,
      perspective: "stakeholder",
      objective: "Ensure equitable provincial development across BARMM",
      description: `Affirmative action approach: ${data.q11_1_affirmative}`,
      weight: 1.5,
      leveragePoint: "LP3",
      beieCluster: "cross-cutting",
      birdPhase: "1",
      createdBy: userInfo.id,
      createdByName: userInfo.name,
      createdAt: now,
      champion: userInfo.id,
      championName: userInfo.name,
      kpis: [
        {
          id: generateId(),
          objectiveId: objId,
          name: "Provincial Equity Index",
          description: "Inter-provincial development gap closure metric",
          unit: "index",
          baselineValue: 0,
          targetValue: 100,
          target2030: 60,
          currentValue: 0,
          frequency: "annually",
          owner: userInfo.id,
          ownerName: userInfo.name,
          ownerEmail: userInfo.email,
          status: "on-track",
          leveragePoint: "LP3",
        },
      ],
    });
  }

  // Internal Process: Climate resilience
  if (data.q12_1_green_priority) {
    const objId = generateId();
    objectives.push({
      id: objId,
      perspective: "internal_process",
      objective: "Integrate climate resilience into all BEIE cluster investments",
      description: `Green economy priority rating: ${data.q12_1_green_priority}/5`,
      weight: 1.5,
      leveragePoint: "LP5",
      beieCluster: "foundations",
      birdPhase: "2",
      createdBy: userInfo.id,
      createdByName: userInfo.name,
      createdAt: now,
      champion: userInfo.id,
      championName: userInfo.name,
      kpis: [
        {
          id: generateId(),
          objectiveId: objId,
          name: "Climate-Adaptive Investments",
          description: "Percentage of PAPs with climate risk assessment",
          unit: "%",
          baselineValue: 0,
          targetValue: 100,
          target2030: 75,
          currentValue: 0,
          frequency: "annually",
          owner: userInfo.id,
          ownerName: userInfo.name,
          ownerEmail: userInfo.email,
          status: "on-track",
          leveragePoint: "LP5",
        },
      ],
    });
  }

  return objectives;
}

function buildPAPs(data: SurveySchemaType, userInfo: UserInfo): PAP[] {
  const paps: PAP[] = [];
  const now = new Date().toISOString();

  if (data.q9_1 && data.q9_1 > 0) {
    paps.push({
      id: generateId(),
      papType: "program",
      name: "BIRD Survey-Derived Investment Program",
      description: `Strategic investment program derived from stakeholder survey. Priority sectors: ${data.q5_2_sectors?.join(", ") || "TBD"}`,
      owner: userInfo.id,
      ownerName: userInfo.name,
      ownerEmail: userInfo.email,
      budget: data.q9_1,
      spent: 0,
      startDate: "2026-01-01",
      endDate: "2035-12-31",
      progress: 0,
      status: "planned",
      beieCluster: "transformers",
      birdPhase: "1",
      leveragePoint: "LP1",
      leadAgency: data.demo_organization || "TBD",
      sdgAlignment: "SDG 8, 9, 17",
      createdBy: userInfo.id,
      createdByName: userInfo.name,
      createdAt: now,
      teamMembers: [userInfo.id],
    });
  }

  return paps;
}
```

---

#### E2. Wire `formulas.ts` — Real-Time Score Computation

**File:** `src/hooks/useSurveyScores.ts` (NEW)

```typescript
// src/hooks/useSurveyScores.ts
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { SurveySchemaType } from "@/lib/survey-schema";

import {
  calculateResilienceIndex,
  calculateRiskLevel,
  calculateVulnerabilityIndex,
  calculateLeveragePriority,
  estimateInvestmentROI,
  getStatusColor,
  formatCurrency,
} from "@/lib/formulas";

export interface SurveyScores {
  // Per-cluster resilience scores
  foundationsResilience: number | null;
  transformersResilience: number | null;
  enablersResilience: number | null;
  connectorsResilience: number | null;
  financiersResilience: number | null;

  // Risk levels
  foundationsRisk: string | null;
  transformersRisk: string | null;
  enablersRisk: string | null;
  connectorsRisk: string | null;
  financiersRisk: string | null;

  // Strategic
  iedsPriorityScore: number | null;
  estimatedROI: { estimatedReturn: number; multiplier: number; timeframe: string } | null;

  // C.A.R.E.
  careAverage: number | null;
  careStatus: string;
}

export function useSurveyScores(form: UseFormReturn<SurveySchemaType>): SurveyScores {
  const values = useWatch({ control: form.control });

  return useMemo(() => {
    const scores: SurveyScores = {
      foundationsResilience: null,
      transformersResilience: null,
      enablersResilience: null,
      connectorsResilience: null,
      financiersResilience: null,
      foundationsRisk: null,
      transformersRisk: null,
      enablersRisk: null,
      connectorsRisk: null,
      financiersRisk: null,
      iedsPriorityScore: null,
      estimatedROI: null,
      careAverage: null,
      careStatus: "incomplete",
    };

    // Section 3: Foundations
    if (values.q3_el_nino_impact && values.q3_el_nino_like) {
      scores.foundationsResilience = calculateResilienceIndex(
        values.q3_el_nino_impact,
        values.q3_el_nino_like
      );
      scores.foundationsRisk = calculateRiskLevel(
        values.q3_el_nino_impact,
        values.q3_el_nino_like
      );
    }

    // Section 4: Transformers
    if (values.q4_4_commodity_impact) {
      scores.transformersResilience = calculateResilienceIndex(
        values.q4_4_commodity_impact,
        4 // assumed likelihood
      );
      scores.transformersRisk = calculateRiskLevel(
        values.q4_4_commodity_impact,
        4
      );
    }

    // Section 5: Enablers
    if (values.q5_1_infra) {
      scores.enablersResilience = calculateResilienceIndex(
        values.q5_1_infra,
        5
      );
      scores.enablersRisk = calculateRiskLevel(values.q5_1_infra, 5);
    }

    // Section 6: Connectors
    if (values.q6_1_bimpeaga) {
      scores.connectorsResilience = calculateResilienceIndex(
        values.q6_1_bimpeaga,
        4
      );
      scores.connectorsRisk = calculateRiskLevel(values.q6_1_bimpeaga, 4);
    }

    // Section 7: Financiers
    if (values.q7_1_criticality) {
      scores.financiersResilience = calculateResilienceIndex(
        values.q7_1_criticality,
        4
      );
      scores.financiersRisk = calculateRiskLevel(values.q7_1_criticality, 4);
    }

    // Section 10: IEDS Matrix priority
    if (values.q10_matrix) {
      const matrix = values.q10_matrix;
      const iedsScores = matrix.ieds;
      scores.iedsPriorityScore = calculateLeveragePriority(
        iedsScores.systems_leverage,
        iedsScores.inclusivity,
        iedsScores.feasibility
      );
    }

    // Section 9: Budget ROI
    if (values.q9_1 && values.q8_1) {
      const sector = inferSector(values.q8_1);
      scores.estimatedROI = estimateInvestmentROI(values.q9_1, sector);
    }

    // Section 15: C.A.R.E.
    if (
      values.care_context !== undefined &&
      values.care_action !== undefined &&
      values.care_realtime !== undefined &&
      values.care_evidence !== undefined &&
      values.care_overall !== undefined
    ) {
      scores.careAverage =
        (values.care_context +
          values.care_action +
          values.care_realtime +
          values.care_evidence +
          values.care_overall) / 5;
      scores.careStatus =
        scores.careAverage >= 4
          ? "excellent"
          : scores.careAverage >= 3
          ? "good"
          : scores.careAverage >= 2
          ? "needs-improvement"
          : "critical";
    }

    return scores;
  }, [values]);
}

function inferSector(strategy: string): "halal" | "agro-industrial" | "green-economy" | "digital" | "infrastructure" {
  const s = strategy.toLowerCase();
  if (s.includes("halal")) return "halal";
  if (s.includes("green") || s.includes("climate") || s.includes("carbon")) return "green-economy";
  if (s.includes("digital") || s.includes("tech") || s.includes("broadband")) return "digital";
  if (s.includes("infra") || s.includes("road") || s.includes("power")) return "infrastructure";
  return "agro-industrial";
}
```

---

#### E3. Wire `supabase.ts` — Backend Persistence

**File:** `src/lib/api.ts` (MODIFY existing `submitSurvey`)

```typescript
// src/lib/api.ts
import {
  supabase,
  saveSinglePlan,
  triggerEmailNotification,
  EXTERNAL_URLS,
} from "./supabase";
import { convertSurveyToPlan } from "./survey-converter";
import type { SurveySchemaType } from "./survey-schema";
import type { UserInfo } from "./strategicPlanStore";

export async function submitSurvey(data: SurveySchemaType): Promise<void> {
  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required. Please sign in.");

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Session expired. Please sign in again.");

  // 2. Build user info from survey demographics
  const userInfo: UserInfo = {
    id: user.id,
    email: user.email!,
    name: data.demo_name || user.email!,
    role: "editor",
    organization: data.demo_organization || undefined,
  };

  // 3. Convert survey → StrategicPlan
  const plan = convertSurveyToPlan(data, userInfo);

  // 4. Persist to Supabase
  const saved = await saveSinglePlan(plan, token);
  if (!saved) {
    // Fallback: save to localStorage
    const { loadFromStorage, saveToStorage } = await import("./strategicPlanStore");
    const existing = loadFromStorage(user.id);
    existing.plans.push(plan);
    saveToStorage(existing.plans, plan.id, user.id);
    console.warn("[submitSurvey] Edge function failed — saved to localStorage as fallback");
  }

  // 5. Send confirmation email
  await triggerEmailNotification("welcome", user.id, {
    plan_name: plan.name,
    organization: plan.organization,
    survey_completed: true,
  });
}

export { EXTERNAL_URLS };
```

---

#### E4. Wire `utils.ts` — SWOT Metric Display

**File:** `src/components/strategic/SurveyScorePanel.tsx` (NEW)

```typescript
// src/components/strategic/SurveyScorePanel.tsx
import React from "react";
import { useSurveyScores } from "@/hooks/useSurveyScores";
import { getStatusColor, cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formulas";
import type { UseFormReturn } from "react-hook-form";
import type { SurveySchemaType } from "@/lib/survey-schema";

interface Props {
  form: UseFormReturn<SurveySchemaType>;
}

export const SurveyScorePanel: React.FC<Props> = ({ form }) => {
  const scores = useSurveyScores(form);

  const clusters = [
    { name: "Foundations", resilience: scores.foundationsResilience, risk: scores.foundationsRisk },
    { name: "Transformers", resilience: scores.transformersResilience, risk: scores.transformersRisk },
    { name: "Enablers", resilience: scores.enablersResilience, risk: scores.enablersRisk },
    { name: "Connectors", resilience: scores.connectorsResilience, risk: scores.connectorsRisk },
    { name: "Financiers", resilience: scores.financiersResilience, risk: scores.financiersRisk },
  ];

  return (
    <div className="space-y-4">
      {/* Cluster Resilience Cards */}
      <div className="grid grid-cols-1 gap-2">
        {clusters.map((c) =>
          c.resilience !== null ? (
            <div
              key={c.name}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                getStatusColor(
                  c.risk === "Critical"
                    ? "critical"
                    : c.risk === "High"
                    ? "behind"
                    : c.risk === "Medium"
                    ? "watch"
                    : "on-track"
                )
              )}
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-70">RI: {c.resilience}</span>
                <span className="text-xs font-bold">{c.risk}</span>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* ROI Preview */}
      {scores.estimatedROI && (
        <div className="rounded-lg border border-[#C9A84C]/30 bg-[#022c22]/60 p-3">
          <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
            Estimated ROI
          </p>
          <p className="text-lg font-serif text-[#E8C560]">
            {formatCurrency(scores.estimatedROI.estimatedReturn)}
          </p>
          <p className="text-xs text-[#ecfdf5]/60">
            {scores.estimatedROI.multiplier}x multiplier · {scores.estimatedROI.timeframe}
          </p>
        </div>
      )}

      {/* C.A.R.E. Score */}
      {scores.careAverage !== null && (
        <div className="rounded-lg border border-[#C9A84C]/30 bg-[#022c22]/60 p-3">
          <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
            C.A.R.E. Validation
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-[#064e3b]">
              <div
                className="h-2 rounded-full bg-[#C9A84C] transition-all"
                style={{ width: `${(scores.careAverage / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[#E8C560]">
              {scores.careAverage.toFixed(1)}/5
            </span>
          </div>
          <p className="text-xs text-[#ecfdf5]/60 mt-1 capitalize">
            {scores.careStatus.replace(/-/g, " ")}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

### 4.2 High Priority (Should-Have)

#### E5. Add Score Panel to SurveyWizard Layout

**File:** `src/components/strategic/SurveyWizard.tsx` (MODIFY)

Insert the `SurveyScorePanel` into the right sidebar, below `ContextPanel`:

```tsx
{/* Context Panel Column — Videos, Images, Sites + Scores */}
<div className="lg:col-span-1">
  <div className="sticky top-6 space-y-4">
    <ContextPanel sectionId={currentSectionId} compact />

    {/* NEW: Live Score Panel */}
    <SurveyScorePanel form={form} />

    {/* Quick Links Card */}
    <Card className="bg-[#022c22]/40 backdrop-blur-xl border-[#C9A84C]/20">
      {/* ... existing content ... */}
    </Card>
  </div>
</div>
```

---

#### E6. Use `EXTERNAL_URLS` from `supabase.ts`

**File:** `src/components/strategic/SurveyWizard.tsx` (MODIFY)

```tsx
// REPLACE hardcoded URL:
import { EXTERNAL_URLS } from "@/lib/supabase";

// In success state:
<Button onClick={() => window.open(EXTERNAL_URLS.PWA, "_blank")}>
  Access BIRD App →
</Button>
```

---

### 4.3 Medium Priority (Nice-to-Have)

#### E7. Local Storage Fallback

Use `loadFromStorage()` / `saveToStorage()` from `strategicPlanStore.ts` as a fallback when Supabase is unavailable.

#### E8. Plan Completion Tracking

Use `computePlanCompletion()` from `strategicPlanStore.ts` to show survey-to-plan completion progress.

#### E9. AI Strategy Assistant Integration

Call `EDGE_FUNCTIONS.AI_STRATEGY_ASSISTANT` after survey submission to generate AI-powered strategic recommendations based on the survey data.

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create `src/lib/survey-converter.ts` (E1)
- [ ] Create `src/hooks/useSurveyScores.ts` (E2)
- [ ] Modify `src/lib/api.ts` to use Supabase (E3)
- [ ] Test survey → plan conversion with sample data

### Phase 2: UI Integration (Week 2)
- [ ] Create `src/components/strategic/SurveyScorePanel.tsx` (E4)
- [ ] Integrate score panel into SurveyWizard sidebar (E5)
- [ ] Replace hardcoded URLs with `EXTERNAL_URLS` (E6)
- [ ] Add real-time resilience badges to section components

### Phase 3: Polish & Fallbacks (Week 3)
- [ ] Implement localStorage fallback (E7)
- [ ] Add plan completion tracking (E8)
- [ ] Integrate AI Strategy Assistant (E9)
- [ ] End-to-end testing with Supabase Edge Functions

---

## 6. Appendix: Type Mappings

### Survey Schema → StrategicPlan Mapping (Complete)

| Survey Field | Type | StrategicPlan Target | Transform Logic |
|-------------|------|---------------------|-----------------|
| `q1_1` | `string` | `organization` | Direct assignment |
| `q1_2` | `string` | `strategicIntent` | Direct assignment |
| `q2_1` | `number` | `swotItems[].impactScore` | Moral Governance strength |
| `q2_2` | `number` | `swotItems[].likelihoodScore` | Moral Governance strength |
| `q2_3_archetype` | `string` | `swotItems[].description` | Archetype name + scores |
| `q2_4_peace` | `string[]` | `swotItems[]` | One item per peace pillar |
| `q3_1_priorities` | `string[]` | `swotItems[]` | Foundations priorities |
| `q3_2_feasibility` | `number` | `strategicOptions[].feasibilityScore` | Global feasibility |
| `q3_el_nino_impact` | `number` | `swotItems[].impactScore` | Climate threat |
| `q3_el_nino_like` | `number` | `swotItems[].likelihoodScore` | Climate threat |
| `q3_pestalotiopsis_impact` | `number` | `swotItems[].impactScore` | Disease threat |
| `q3_pestalotiopsis_like` | `number` | `swotItems[].likelihoodScore` | Disease threat |
| `q3_postharvest_impact` | `number` | `swotItems[].impactScore` | Post-harvest weakness |
| `q3_postharvest_like` | `number` | `swotItems[].likelihoodScore` | Post-harvest weakness |
| `q3_limits_growth` | `string` | `swotItems[].description` | Growth limiter |
| `q4_1_barrier` | `string` | `swotItems[].description` | Halal barrier |
| `q4_2_halal_park` | `string` | `swotItems[].description` | Park assessment |
| `q4_3_fixes_fail` | `string` | `swotItems[].description` | Systemic weakness |
| `q4_4_commodity_impact` | `number` | `swotItems[].impactScore` | Commodity threat |
| `q4_5_heds_ranking` | `string[]` | `strategicOptions[]` | HEDS strategy ranking |
| `q5_1_infra` | `number` | `swotItems[].impactScore` | Infrastructure weakness |
| `q5_2_sectors` | `string[]` | `paps[].description` | Priority sectors |
| `q5_3_broadband` | `number` | `swotItems[].impactScore` | Digital gap |
| `q5_4_literacy` | `number` | `swotItems[].impactScore` | Human capital weakness |
| `q5_5_stunting` | `number` | `swotItems[].impactScore` | Health weakness |
| `q5_6_digital_divide` | `string` | `swotItems[].description` | Digital narrative |
| `q6_1_bimpeaga` | `number` | `swotItems[].impactScore` | BIMP-EAGA opportunity |
| `q6_2_markets` | `string[]` | `swotItems[]` | Target markets |
| `q6_3_export_target` | `number` | `objectives[].kpis[].targetValue` | Export KPI |
| `q6_4_uae_feasibility` | `number` | `swotItems[].impactScore` | UAE opportunity |
| `q6_5_perception` | `string` | `swotItems[].description` | Perception threat |
| `q7_1_criticality` | `number` | `swotItems[].impactScore` | Finance opportunity |
| `q7_2_instruments` | `string[]` | `swotItems[]` | Finance instruments |
| `q7_3_inclusion_target` | `number` | `objectives[].kpis[].targetValue` | Inclusion KPI |
| `q7_4_asset_paradox` | `string` | `swotItems[].description` | Asset paradox |
| `q7_5_block_grant` | `string` | `swotItems[].description` | Fiscal threat |
| `q8_1_strategy` | `string` | `strategicOptions[].title` | Primary strategy |
| `q8_2_sequencing` | `string` | `strategicOptions[].description` | Sequencing logic |
| `q8_3_comments` | `string` | `strategicOptions[].description` | Append to description |
| `q9_1_budget` | `number` | `paps[].budget` | Total budget |
| `q10_1_ambition` | `number` | `strategicOptions[].priorityScore` | Ambition level |
| `q10_matrix` | `object` | `strategicOptions[]` | Matrix winner → selected strategy |
| `q11_1_affirmative` | `string` | `objectives[].description` | Equity approach |
| `q11_2_mechanisms` | `string[]` | `objectives[].description` | Equity mechanisms |
| `q12_1_green_priority` | `number` | `objectives[].weight` | Climate priority |
| `q12_2_adaptation` | `string[]` | `objectives[].description` | Adaptation measures |
| `q13_1_legislation` | `string[]` | `swotItems[]` | Legislative gaps |
| `q13_2_bicc` | `number` | `swotItems[].impactScore` | BICC strength |
| `demo_category` | `string` | `plan.metadata` | Stakeholder category |
| `demo_province` | `string` | `plan.organization` | Province context |
| `demo_expertise` | `string[]` | `plan.metadata` | Expertise areas |
| `demo_name` | `string` | `createdByName` | Submitter name |
| `demo_email` | `string` | `createdByEmail` | Submitter email |
| `demo_organization` | `string` | `organization` | Organization |
| `care_context` | `number` | `plan.metadata` | C.A.R.E. score |
| `care_action` | `number` | `plan.metadata` | C.A.R.E. score |
| `care_realtime` | `number` | `plan.metadata` | C.A.R.E. score |
| `care_evidence` | `number` | `plan.metadata` | C.A.R.E. score |
| `care_overall` | `number` | `plan.metadata` | C.A.R.E. score |
| `consent_final` | `boolean` | `plan.status` | `"active"` if true |

---

## End of Document

> **Maintainers:** BIRD Engineering Team  
> **Next Review:** 2026-07-23
