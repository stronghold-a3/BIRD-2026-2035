// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Implementation Roadmap Phases
// Single source of truth for Panel E (Phase Progress Tracker).
// Source: BIRD 2026–2035 Chapter 7 — Implementation Architecture
// Total budget: ₱120–160B across three phased implementation windows.
// ─────────────────────────────────────────────────────────────────────────────

export type MilestoneStatus = 'done' | 'active' | 'pending';

export interface Milestone {
  text: string;
  status: MilestoneStatus;
}

export interface PhaseTracker {
  num: string;
  title: string;
  years: string;
  budget: string;
  budgetMin: number;
  budgetMax: number;
  budgetValue: number; // midpoint for aggregation
  focus: string;
  status: string;
  statusClass: 'in-progress' | 'upcoming' | 'not-started';
  progress: number;
  milestones: Milestone[];
}

export const PHASES: PhaseTracker[] = [
  {
    num: '01',
    title: 'Foundation Building',
    years: '2026 – 2028',
    budget: '₱35–45B',
    budgetMin:  35_000_000_000,
    budgetMax:  45_000_000_000,
    budgetValue: 40_000_000_000, // midpoint
    focus: 'Activate governance and enablers',
    status: 'Current Phase',
    statusClass: 'in-progress',
    progress: 26,
    milestones: [
      { text: 'BHB operationalisation with OIC/SMIIC alignment — Q2 2026',     status: 'active'  },
      { text: 'Bangsamoro Forestry Code enacted & JMC 2026-01 signed — Q2 2026', status: 'active' },
      { text: '1-day digital business registration via BBOI (BEGMP) — Q3 2026',  status: 'pending' },
      { text: 'Bangsamoro Halal Park groundbreaking, Matanog — Q4 2026',         status: 'pending' },
      { text: 'ZBIP construction commenced; 80% electrification — 2028',          status: 'pending' },
      { text: 'Bangsamoro Investment Command Center (BICC) established — Q3 2026', status: 'pending' },
    ],
  },
  {
    num: '02',
    title: 'Acceleration',
    years: '2029 – 2032',
    budget: '₱50–65B',
    budgetMin:  50_000_000_000,
    budgetMax:  65_000_000_000,
    budgetValue: 57_500_000_000,
    focus: 'Scale Transformers & Green Economy',
    status: 'Upcoming',
    statusClass: 'upcoming',
    progress: 0,
    milestones: [
      { text: 'Bangsamoro Halal Park Phase 1 operationalised with anchor tenants', status: 'pending' },
      { text: 'REDD+ registered; PES payments activated to LGUs/communities',       status: 'pending' },
      { text: 'Islamic banking expanded to all 7 provincial capitals',               status: 'pending' },
      { text: 'Cold chain & logistics hubs deployed; OIC full recognition achieved', status: 'pending' },
      { text: 'TVET-industry alignment scaled; 70% literacy achieved',               status: 'pending' },
    ],
  },
  {
    num: '03',
    title: 'Consolidation & Global Integration',
    years: '2033 – 2035',
    budget: '₱35–50B',
    budgetMin:  35_000_000_000,
    budgetMax:  50_000_000_000,
    budgetValue: 42_500_000_000,
    focus: 'Consolidate Connectors & Global Maturity',
    status: 'Future Phase',
    statusClass: 'not-started',
    progress: 0,
    milestones: [
      { text: 'OIC endorsement & SMIIC Mutual Recognition Arrangement (MRA) secured', status: 'pending' },
      { text: '₱500M+ annual green revenue (carbon credits + PES)',                    status: 'pending' },
      { text: 'Full BIMP-EAGA integration; ZBIP fully operational',                    status: 'pending' },
      { text: 'GRDP reaches ₱550B+; poverty incidence <20%',                          status: 'pending' },
      { text: '100% electrification & 85% broadband across BARMM',                    status: 'pending' },
    ],
  },
];

/** Total budget range for the full BIRD 2026–2035 programme */
export const TOTAL_BUDGET = {
  min: PHASES.reduce((s, p) => s + p.budgetMin, 0), // ₱120B
  max: PHASES.reduce((s, p) => s + p.budgetMax, 0), // ₱160B
  midpoint: PHASES.reduce((s, p) => s + p.budgetValue, 0),
  label: '₱120–160B',
};
