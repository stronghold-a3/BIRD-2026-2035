// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Strategic Computation Library
// Resilience, risk, vulnerability & KPI progress formulas.
// Derived from BIRD 2026–2035 Chapter 3: SWOT Analysis and Systems Mapping.
// ─────────────────────────────────────────────────────────────────────────────

// ── Resilience Index (BIRD SWOT Methodology) ─────────────────────────────────
// For Strengths: RI = (Impact × Likelihood) / 5
// For Opportunities: RI = √(Impact × Likelihood)
// Reference: BIRD 2026–2035 Chapter 3-A, SWOT Scoring Framework.

export interface ResilienceScore {
  resilienceIndex: number;
  riskLevel: string;
  vulnerabilityIndex: number;
  interpretation: string;
  birdCategory: 'strength' | 'opportunity' | 'weakness' | 'threat';
}

/** RI for Strengths: (Impact × Likelihood) / 5 */
export function calculateStrengthRI(impact: number, likelihood: number): number {
  return Number(((impact * likelihood) / 5).toFixed(2));
}

/** RI for Opportunities: √(Impact × Likelihood) */
export function calculateOpportunityRI(impact: number, likelihood: number): number {
  return Number(Math.sqrt(impact * likelihood).toFixed(2));
}

/** General resilience index (opportunity formula, used across analysis) */
export function calculateResilienceIndex(impact: number, likelihood: number): number {
  return calculateOpportunityRI(impact, likelihood);
}

export function calculateRiskLevel(impact: number, likelihood: number): string {
  const riskScore = impact * likelihood;
  if (riskScore >= 20) return 'Critical';
  if (riskScore >= 15) return 'High';
  if (riskScore >= 10) return 'Medium';
  if (riskScore >= 5)  return 'Low';
  return 'Minimal';
}

export function calculateVulnerabilityIndex(
  impact: number,
  likelihood: number,
  control = 1,
): number {
  return Number(((impact * likelihood) / Math.max(control, 1)).toFixed(2));
}

export function calculateResilience(
  impact: number,
  likelihood: number,
  control = 1,
  birdCategory: ResilienceScore['birdCategory'] = 'opportunity',
): ResilienceScore {
  const resilienceIndex =
    birdCategory === 'strength'
      ? calculateStrengthRI(impact, likelihood)
      : calculateOpportunityRI(impact, likelihood);

  const riskLevel = calculateRiskLevel(impact, likelihood);
  const vulnerabilityIndex = calculateVulnerabilityIndex(impact, likelihood, control);

  let interpretation: string;
  if (resilienceIndex >= 4.0) {
    interpretation = 'Strong resilience capacity; maintain momentum';
  } else if (resilienceIndex >= 3.0) {
    interpretation = 'Moderate resilience; targeted interventions recommended';
  } else if (resilienceIndex >= 2.0) {
    interpretation = 'Vulnerable; requires priority resource allocation';
  } else {
    interpretation = 'High vulnerability; immediate corrective action required';
  }

  return { resilienceIndex, riskLevel, vulnerabilityIndex, interpretation, birdCategory };
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
