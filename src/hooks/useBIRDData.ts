// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · useBIRDData Hook
// Centralized access to all official BIRD 2026–2035 data with computed metrics.
// Source: BOI-MTIT, BARMM (2026). Bangsamoro Investment Roadmap 2026–2035.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import {
  PARETO_KPIS,
  ALL_BSC_KPIS,
  BSC_LEVERAGE_POINTS,
  type KPI,
  type BSCLeveragePoint,
  type BSCPerspective,
} from '../data/bird/kpis';
import {
  ACTION_PLAN_2026,
  ACTION_SUMMARY,
  type ActionPlan,
  type ActionStatus,
} from '../data/bird/actions';
import {
  CAUSAL_LOOPS,
  SYSTEMS_ARCHETYPES,
  BEIE_CLUSTERS,
  LEVERAGE_POINTS,
  type CausalLoop,
  type SystemsArchetype,
} from '../data/bird/clds';
import {
  PHASES,
  TOTAL_BUDGET,
  type PhaseTracker,
} from '../data/bird/phases';

// ─── Public interface ─────────────────────────────────────────────────────────
export interface BIRDDataState {
  // ── KPIs & Scorecard ──────────────────────────────────────────────────────
  kpis: KPI[];
  allKpis: KPI[];
  bscLeveragePoints: BSCLeveragePoint[];
  kpisByPerspective: Record<BSCPerspective, KPI[]>;
  onTrackCount: number;
  watchCount: number;
  behindCount: number;
  criticalCount: number;
  avgProgress: number;

  // ── Actions ──────────────────────────────────────────────────────────────
  actions: ActionPlan[];
  actionSummary: typeof ACTION_SUMMARY;
  criticalActions: number;
  actionsByStatus: Record<ActionStatus, ActionPlan[]>;
  totalActionBudget: number;
  totalActionBudgetFormatted: string;

  // ── Systems ───────────────────────────────────────────────────────────────
  causalLoops: CausalLoop[];
  systemsArchetypes: SystemsArchetype[];
  beieClusters: typeof BEIE_CLUSTERS;
  leveragePoints: typeof LEVERAGE_POINTS;
  activeLoops: number;
  reinforcingLoops: number;
  balancingLoops: number;

  // ── Phases ────────────────────────────────────────────────────────────────
  phases: PhaseTracker[];
  totalBudget: typeof TOTAL_BUDGET;
  totalBudgetFormatted: string;
  completedMilestones: number;
  totalMilestones: number;
  milestoneProgress: number; // percentage

  // ── Regional Context ──────────────────────────────────────────────────────
  regionalContext: BARMMContext;
}

export interface BARMMContext {
  population: string;
  grdp: string;
  grdpGrowth: string;
  povertyIncidence: string;
  provinces: string[];
  investmentApprovals: string;
  topGrowthProvince: string;
  halalMarketSize: string;
  bimpEagaRole: string;
}

const BARMM_REGIONAL_CONTEXT: BARMMContext = {
  population: '5.69M (PSA 2025)',
  grdp: '₱299.5B (2024)',
  grdpGrowth: '2.7% (2024)',
  povertyIncidence: '34.8% (1H 2023)',
  provinces: [
    'Lanao del Sur',
    'Maguindanao del Norte',
    'Maguindanao del Sur',
    'Basilan',
    'Sulu',
    'Tawi-Tawi',
    'Special Geographic Area (SGA)',
  ],
  investmentApprovals: '₱5.1B (Q1 2026)',
  topGrowthProvince: 'Maguindanao del Norte (4.1%, 2024)',
  halalMarketSize: 'USD 2.3 trillion (global halal market)',
  bimpEagaRole: 'Philippines\' gateway to BIMP-EAGA growth corridor',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBIRDData(): BIRDDataState {
  // Raw data (stable references)
  const kpis     = useMemo(() => PARETO_KPIS, []);
  const allKpis  = useMemo(() => ALL_BSC_KPIS, []);
  const bscLeveragePoints = useMemo(() => BSC_LEVERAGE_POINTS, []);
  const actions  = useMemo(() => ACTION_PLAN_2026, []);
  const causalLoops = useMemo(() => CAUSAL_LOOPS, []);
  const systemsArchetypes = useMemo(() => SYSTEMS_ARCHETYPES, []);
  const phases   = useMemo(() => PHASES, []);

  // KPI computations
  const kpiMetrics = useMemo(() => {
    const kpisByPerspective = allKpis.reduce<Record<BSCPerspective, KPI[]>>(
      (acc, k) => {
        acc[k.perspective] = [...(acc[k.perspective] || []), k];
        return acc;
      },
      {} as Record<BSCPerspective, KPI[]>,
    );

    const onTrackCount  = allKpis.filter((k) => k.status === 'on-track').length;
    const watchCount    = allKpis.filter((k) => k.status === 'watch').length;
    const behindCount   = allKpis.filter((k) => k.status === 'behind').length;
    const criticalCount = allKpis.filter((k) => k.status === 'critical').length;
    const avgProgress   = Math.round(allKpis.reduce((s, k) => s + k.progress, 0) / allKpis.length);

    return { kpisByPerspective, onTrackCount, watchCount, behindCount, criticalCount, avgProgress };
  }, [allKpis]);

  // Action computations
  const actionMetrics = useMemo(() => {
    const criticalActions = actions.filter((a) => a.priority === 'critical').length;
    const totalActionBudget = actions.reduce((s, a) => s + a.budgetValue, 0);

    const actionsByStatus = actions.reduce<Record<ActionStatus, ActionPlan[]>>(
      (acc, a) => {
        const s = a.status;
        acc[s] = [...(acc[s] || []), a];
        return acc;
      },
      {} as Record<ActionStatus, ActionPlan[]>,
    );

    const fmt = (v: number) => {
      if (v >= 1e9) return `₱${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `₱${(v / 1e6).toFixed(0)}M`;
      return `₱${v.toLocaleString()}`;
    };

    return {
      criticalActions,
      totalActionBudget,
      totalActionBudgetFormatted: fmt(totalActionBudget),
      actionsByStatus,
    };
  }, [actions]);

  // Systems loop computations
  const loopMetrics = useMemo(() => ({
    activeLoops:     causalLoops.filter((l) => l.status === 'active').length,
    reinforcingLoops: causalLoops.filter((l) => l.type === 'reinforcing').length,
    balancingLoops:   causalLoops.filter((l) => l.type === 'balancing').length,
  }), [causalLoops]);

  // Phase computations
  const phaseMetrics = useMemo(() => {
    const completedMilestones = phases.reduce(
      (s, p) => s + p.milestones.filter((m) => m.status === 'done').length,
      0,
    );
    const totalMilestones = phases.reduce((s, p) => s + p.milestones.length, 0);
    const milestoneProgress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;
    const fmt = (v: number) => `₱${(v / 1e9).toFixed(0)}B`;

    return {
      completedMilestones,
      totalMilestones,
      milestoneProgress,
      totalBudgetFormatted: TOTAL_BUDGET.label,
    };
  }, [phases]);

  return {
    // KPIs
    kpis,
    allKpis,
    bscLeveragePoints,
    ...kpiMetrics,

    // Actions
    actions,
    actionSummary: ACTION_SUMMARY,
    ...actionMetrics,

    // Systems
    causalLoops,
    systemsArchetypes,
    beieClusters: BEIE_CLUSTERS,
    leveragePoints: LEVERAGE_POINTS,
    ...loopMetrics,

    // Phases
    phases,
    totalBudget: TOTAL_BUDGET,
    ...phaseMetrics,

    // Regional
    regionalContext: BARMM_REGIONAL_CONTEXT,
  };
}
