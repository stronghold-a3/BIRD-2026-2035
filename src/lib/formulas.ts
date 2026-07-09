// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Strategic Computation Library
// Resilience, risk, vulnerability & KPI progress formulas.
// Derived from BIRD 2026–2035 Chapter 3: SWOT Analysis and Systems Mapping.
// ─────────────────────────────────────────────────────────────────────────────

import type { SWOTCategory } from "./strategicPlanStore";

// ── Resilience Index (BIRD SWOT Methodology) ──────────────────────────────
// For Strengths: RI = (Impact × Likelihood) / 5
// For Opportunities: RI = √(Impact × Likelihood)
// For Weaknesses: Risk = Impact × Likelihood
// For Threats: VI = (Impact² × Likelihood) / 25
// Reference: BIRD 2026–2035 Chapter 3-A, SWOT Scoring Framework.
 
export interface ResilienceScore {
  resilienceIndex: number;
  riskLevel: string;
  vulnerabilityIndex: number;
  interpretation: string;
  category: SWOTCategory;
}
 
/** Resilience Index for Strengths: (Impact × Likelihood) / 5 */
export function calculateStrengthRI(impact: number, likelihood: number): number {
  return Number(((impact * likelihood) / 5).toFixed(2));
}
 
/** Resilience Index for Opportunities: √(Impact × Likelihood) */
export function calculateOpportunityRI(impact: number, likelihood: number): number {
  return Number(Math.sqrt(impact * likelihood).toFixed(2));
}
 
/** Risk score for Weaknesses: Impact × Likelihood */
export function calculateWeaknessRisk(impact: number, likelihood: number): number {
  return Number((impact * likelihood).toFixed(2));
}
 
/** Vulnerability Index for Threats: (Impact² × Likelihood) / 25 */
export function calculateThreatVI(impact: number, likelihood: number): number {
  return Number(((Math.pow(impact, 2) * likelihood) / 25).toFixed(2));
}
 
/** Universal SWOT metric calculator (routes to category-specific formula) */
export function calculateSWOTMetric(
  category: SWOTCategory,
  impact: number,
  likelihood: number
): number {
  switch (category) {
    case "strength":
      return calculateStrengthRI(impact, likelihood);
    case "opportunity":
      return calculateOpportunityRI(impact, likelihood);
    case "weakness":
      return calculateWeaknessRisk(impact, likelihood);
    case "threat":
      return calculateThreatVI(impact, likelihood);
    default:
      return 0;
  }
}
 
/** Compute full resilience score with interpretation */
export function scoreResilience(
  category: SWOTCategory = "opportunity",
  impact: number,
  likelihood: number
): ResilienceScore {
  const score = calculateSWOTMetric(category, impact, likelihood);
 
  let riskLevel = "low";
  let interpretation = "";
 
  if (score < 2) {
    riskLevel = "low";
    interpretation = "Minimal impact expected";
  } else if (score < 4) {
    riskLevel = "moderate";
    interpretation = "Attention recommended";
  } else if (score < 6) {
    riskLevel = "elevated";
    interpretation = "Close monitoring required";
  } else {
    riskLevel = "critical";
    interpretation = "Immediate action necessary";
  }
 
  return {
    resilienceIndex: score,
    riskLevel,
    vulnerabilityIndex: score,
    interpretation,
    category,
  };
}

// ── Strategic Option Scoring (IEDS Matrix) ────────────────────────────────
interface StrategyScores {
  economic_impact: number;
  feasibility: number;
  identity_alignment: number;
  systems_leverage: number;
  risk_return: number;
  inclusivity: number;
  sustainability: number;
}
 
export function calculateStrategyOverallScore(scores: StrategyScores): number {
  const weights = {
    economic_impact: 0.20,
    feasibility: 0.18,
    identity_alignment: 0.15,
    systems_leverage: 0.15,
    risk_return: 0.16,
    inclusivity: 0.10,
    sustainability: 0.06,
  };
 
  const weightedSum = (Object.keys(scores) as (keyof StrategyScores)[]).reduce((sum, key) => {
    return sum + scores[key] * weights[key];
  }, 0);
 
  return Number(weightedSum.toFixed(2));
}
 
// ── BSC (Balanced Scorecard) Aggregations ─────────────────────────────────
/** Weighted average of perspective objectives */
export function calculatePerspectiveScore(
  objectives: Array<{ weight: number; kpiProgress: number }>
): number {
  if (objectives.length === 0) return 0;
  const totalWeight = objectives.reduce((sum, obj) => sum + obj.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = objectives.reduce((sum, obj) => sum + obj.kpiProgress * obj.weight, 0);
  return Number((weightedSum / totalWeight).toFixed(1));
}
 
/** Overall balanced scorecard health (0-100) */
export function calculateBSCHealth(
  perspectiveScores: Record<string, number>
): number {
  const scores = Object.values(perspectiveScores);
  if (scores.length === 0) return 0;
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Number(average.toFixed(1));
}

// ── KPI Progress ─────────────────────────────────────────────────────────────
export function calculateKPIProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/** Phase-weighted KPI progress (accounts for 2030 interim vs 2035 final targets) */
export function calculatePhaseProgress(
  current: number,
  target2030: number,
  target2035: number,
  currentYear = new Date().getFullYear(),
): { phase1Progress: number; overallProgress: number; phase: 1 | 2 | 3 } {
  const phase: 1 | 2 | 3 = currentYear <= 2028 ? 1 : currentYear <= 2032 ? 2 : 3;
  const phase1Progress = calculateKPIProgress(current, target2030);
  const overallProgress = calculateKPIProgress(current, target2035);
  return { phase1Progress, overallProgress, phase };
}

// ── Currency Formatting ───────────────────────────────────────────────────────
export function formatCurrency(value: number, symbol = '₱'): string {
  if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9)  return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6)  return `${symbol}${(value / 1e6).toFixed(0)}M`;
  if (value >= 1e3)  return `${symbol}${(value / 1e3).toFixed(0)}K`;
  return `${symbol}${value.toLocaleString()}`;
}

/** Format GRDP growth percentage */
export function formatGrowthRate(value: number): string {
  const sign = value >= 0 ? '▲' : '▼';
  return `${sign} ${Math.abs(value).toFixed(1)}%`;
}

// ── Status Colors ─────────────────────────────────────────────────────────────
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'on-track':   '#10b981', // emerald
    'watch':      '#3b82f6', // blue
    'behind':     '#f59e0b', // amber
    'building':   '#f59e0b',
    'critical':   '#ef4444', // red
    'active':     '#10b981',
    'planned':    '#64748b',
    'monitoring': '#8b5cf6',
    'completed':  '#06b6d4',
  };
  return map[status.toLowerCase()] || '#64748b';
}

// ── Leverage Point Priority Score ─────────────────────────────────────────────
/** Weighted score for ranking leverage points by strategic impact */
export function calculateLeveragePriority(
  systemicDepth: number,    // 1-10: how deep in the iceberg model
  breadthOfImpact: number,  // 1-10: how many clusters/KPIs affected
  timeToEffect: number,     // 1-10: (10=immediate, 1=long-term)
): number {
  // Meadows' insight: deeper leverage points have greater but slower impact
  const weights = { systemicDepth: 0.4, breadthOfImpact: 0.35, timeToEffect: 0.25 };
  return Number(
    (
      systemicDepth * weights.systemicDepth +
      breadthOfImpact * weights.breadthOfImpact +
      timeToEffect * weights.timeToEffect
    ).toFixed(2),
  );
}

// ── Investment ROI Estimate ───────────────────────────────────────────────────
/** Rough investment multiplier estimate for BIRD context */
export function estimateInvestmentROI(
  investmentPhp: number,
  sector: 'halal' | 'agro-industrial' | 'green-economy' | 'digital' | 'infrastructure',
): { estimatedReturn: number; multiplier: number; timeframe: string } {
  const multipliers: Record<string, { m: number; t: string }> = {
    'halal':           { m: 3.2, t: '5-8 years' },
    'agro-industrial': { m: 2.8, t: '4-7 years' },
    'green-economy':   { m: 4.5, t: '8-15 years' }, // carbon credits have long-tail
    'digital':         { m: 5.0, t: '3-6 years' },
    'infrastructure':  { m: 2.2, t: '10-15 years' },
  };
  const { m, t } = multipliers[sector] || { m: 2.5, t: '5-10 years' };
  return {
    estimatedReturn: investmentPhp * m,
    multiplier: m,
    timeframe: t,
  };
}

// ── Budget Allocation Breakdown ───────────────────────────────────────────────
export interface BudgetAllocation {
  cluster: string;
  amount: number;
  percentage: number;
  label: string;
}

/** Phase 1 (2026-2028) indicative budget allocation by BEIE cluster */
export const PHASE1_BUDGET_ALLOCATION: BudgetAllocation[] = [
  { cluster: 'Infrastructure & Energy',  amount: 15_000_000_000, percentage: 38, label: '₱15B' },
  { cluster: 'Halal & Industry',         amount:  8_000_000_000, percentage: 20, label: '₱8B'  },
  { cluster: 'Agriculture & Fisheries',  amount:  6_000_000_000, percentage: 15, label: '₱6B'  },
  { cluster: 'Green Economy',            amount:  4_000_000_000, percentage: 10, label: '₱4B'  },
  { cluster: 'Digital & Governance',     amount:  3_200_000_000, percentage:  8, label: '₱3.2B'},
  { cluster: 'Islamic Finance',          amount:  2_000_000_000, percentage:  5, label: '₱2B'  },
  { cluster: 'Tourism & BIMP-EAGA',      amount:  1_600_000_000, percentage:  4, label: '₱1.6B'},
];

// ── Trend Analysis ────────────────────────────────────────────────────────
export function calculateTrend(
  values: number[],
  periods: number = 3
): "improving" | "stable" | "declining" {
  if (values.length < periods) {
    return "stable";
  }
 
  const recent = values.slice(-periods);
  const older = values.slice(-periods * 2, -periods);
 
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
 
  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
 
  if (Math.abs(changePercent) < 5) return "stable";
  return changePercent > 0 ? "improving" : "declining";
}
