// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Causal Loop Diagrams & Systems Archetypes
// Single source of truth for the Systems Thinking layer.
// Source: BIRD 2026–2035 Chapter 3 — SWOT Analysis and Systems Mapping
// ─────────────────────────────────────────────────────────────────────────────

export type LoopType = 'reinforcing' | 'balancing';
export type LoopStatus = 'active' | 'building' | 'monitored' | 'planned';
export type ArchetypeImpact = 'high' | 'medium' | 'low';

export interface CausalLoop {
  id: string;
  type: LoopType;
  name: string;
  desc: string;
  activation: string;
  health: string;
  progress: number;
  status: LoopStatus;
  color: 'green' | 'gold' | 'blue' | 'teal';
  leveragePoint: string;
  cluster?: string; // BEIE cluster reference
}

export interface LeveragePointIntervention {
  level: string;   // e.g. 'L1', 'L5', 'L10'
  area: string;
  expectedImpact: string;
}

export interface SystemsArchetype {
  id: string;
  name: string;
  pattern: string;
  birdContext: string;
  intervention: string;
  leveragePoint: string;
  impact: ArchetypeImpact;
  cluster: string; // Which BEIE cluster this primarily affects
  leverageInterventions: LeveragePointIntervention[];
}

// ─── Panel D · Feedback Loop Health Monitor ──────────────────────────────────
export const CAUSAL_LOOPS: CausalLoop[] = [
  {
    id: 'R1',
    type: 'reinforcing',
    name: 'Investment–Development Virtuous Cycle',
    desc: 'Investment inflows → employment → income → domestic market → improved business climate → further investment.',
    activation: '35% activation',
    health: 'Building',
    progress: 35,
    status: 'building',
    color: 'green',
    leveragePoint: 'LP1',
    cluster: 'Foundations + Transformers',
  },
  {
    id: 'R2',
    type: 'reinforcing',
    name: 'Governance–Investor Confidence',
    desc: 'Governance capacity → policy clarity → investor confidence → tax revenues → stronger governance infrastructure.',
    activation: '25% activation',
    health: 'Initialising',
    progress: 25,
    status: 'building',
    color: 'gold',
    leveragePoint: 'LP3',
    cluster: 'Cross-Cutting: Moral Governance',
  },
  {
    id: 'R3',
    type: 'reinforcing',
    name: 'Halal Brand Equity Loop',
    desc: 'OIC/SMIIC accreditation → global halal market access → halal export revenue → reinvestment in BHB capacity → stronger accreditation.',
    activation: '15% activation',
    health: 'Initiating',
    progress: 15,
    status: 'planned',
    color: 'gold',
    leveragePoint: 'LP1',
    cluster: 'Transformers: Halal Processing',
  },
  {
    id: 'R4',
    type: 'reinforcing',
    name: 'Green Economy Revenue Cycle',
    desc: 'Forest conservation → carbon credit validation → PES revenues → community incentives → conservation behavior → larger carbon stock.',
    activation: '5% activation',
    health: 'Policy Pipeline',
    progress: 5,
    status: 'planned',
    color: 'green',
    leveragePoint: 'LP5',
    cluster: 'Foundations: Environment',
  },
  {
    id: 'B1',
    type: 'balancing',
    name: 'Growth–Resource Constraints',
    desc: 'Infrastructure deficits (energy, logistics, skills) constrain investment ceiling. LP2 interventions target this loop via ZBIP, BSEMP, and TVET.',
    activation: 'Constraint: 60%',
    health: 'Actively Managed',
    progress: 60,
    status: 'active',
    color: 'gold',
    leveragePoint: 'LP2',
    cluster: 'Enablers: Infrastructure',
  },
  {
    id: 'B2',
    type: 'balancing',
    name: 'Security–Investment Tensions',
    desc: 'Security incidents → investor caution → reduced investment → social tensions. Peace dividend consolidation and BICC monitoring underway.',
    activation: 'Tension: 40%',
    health: 'Monitored',
    progress: 40,
    status: 'monitored',
    color: 'blue',
    leveragePoint: 'LP3',
    cluster: 'Cross-Cutting: Peace & Security',
  },
  {
    id: 'B3',
    type: 'balancing',
    name: 'Provincial Development Equilibrium',
    desc: 'Mainland success attracts resources away from island provinces; success-to-successful archetype. Equity KPIs and affirmative investment policies counterbalance.',
    activation: 'Imbalance: 50%',
    health: 'Needs Intervention',
    progress: 50,
    status: 'monitored',
    color: 'blue',
    leveragePoint: 'LP3',
    cluster: 'All Clusters: Archipelagic Equity',
  },
  {
    id: 'B4',
    type: 'balancing',
    name: 'Islamic Finance Access vs. Demand',
    desc: 'Low Islamic banking penetration (< ₱2B assets) fails to meet Shariah-compliant financing demand; limits halal MSME scaling. Al-Amanah expansion and Islamic fintech targeted.',
    activation: 'Gap: 30%',
    health: 'Structural Gap',
    progress: 30,
    status: 'building',
    color: 'teal',
    leveragePoint: 'LP4',
    cluster: 'Financiers: Islamic Banking',
  },
];

// ─── Panel E · Systems Archetypes Analysis (Chapter 3, BIRD 2026–2035) ────────
export const SYSTEMS_ARCHETYPES: SystemsArchetype[] = [
  {
    id: 'A1',
    name: 'Fixes That Fail',
    pattern: 'Short-term fix relieves a symptom but produces unintended consequences that worsen the original problem over time.',
    birdContext: 'Subsidy-driven agricultural interventions provide immediate relief but suppress market price signals, delay structural reforms, and create subsidy dependency among smallholders — while post-harvest losses remain at 20–40%.',
    intervention: 'Performance-linked subsidies tied to climate adaptation compliance. ARB farm profiling. Transition subsidies that progressively require conservation co-benefits.',
    leveragePoint: 'LP1 + LP5',
    impact: 'high',
    cluster: 'Foundations: Agriculture, Fisheries, Forestry',
    leverageInterventions: [
      { level: 'L5', area: 'Rules', expectedImpact: 'Redesign subsidy eligibility to require climate adaptation compliance and conservation co-benefits' },
      { level: 'L3', area: 'Goals', expectedImpact: 'Shift from yield maximization to regenerative productivity metrics aligned with halal and ESG standards' },
    ],
  },
  {
    id: 'A2',
    name: 'Shifting the Burden',
    pattern: 'Over-reliance on symptomatic solution erodes the capacity to develop fundamental solutions, creating escalating dependency.',
    birdContext: 'BARMM relies on national transfers and donor funding for infrastructure and social services rather than building own revenue bases through green economy, halal exports, and Islamic finance — undermining fiscal autonomy.',
    intervention: 'JMC 2026-01 activation for carbon credit and PES revenues. Islamic banking expansion. Halal export certification to generate autonomous revenue streams for LGUs.',
    leveragePoint: 'LP4 + LP5',
    impact: 'high',
    cluster: 'Financiers + Foundations',
    leverageInterventions: [
      { level: 'L4', area: 'Self-Organization', expectedImpact: 'Empower LGUs to generate own revenues through PES, eco-tourism fees, and carbon credits' },
      { level: 'L5', area: 'Rules', expectedImpact: 'Formalize revenue-sharing protocols for carbon/PES between BARMM government, LGUs, and communities' },
    ],
  },
  {
    id: 'A3',
    name: 'Success to the Successful',
    pattern: 'Two competing activities; the one that succeeds first receives more resources, increasing its advantage and starving the other of opportunities.',
    birdContext: 'Mainland provinces (Maguindanao del Norte: ₱81.91B GDP, 4.1% growth) attract bulk of investment while island provinces (Tawi-Tawi: 1.1%, Sulu: 1.13%, Basilan: 1.6%) suffer capital starvation despite comparative advantages in seaweed, fisheries, and BIMP-EAGA proximity.',
    intervention: 'Affirmative investment policies. Provincial equity KPIs tracked by BBOI. Mandatory archipelagic connectivity thresholds in the BARMM Infrastructure Investment Sequencing Plan.',
    leveragePoint: 'LP3',
    impact: 'high',
    cluster: 'All Clusters: Archipelagic Equity',
    leverageInterventions: [
      { level: 'L10', area: 'Stock-Flow Structure', expectedImpact: 'Build critical infrastructure in underserved areas — Bongao Bridge (96% complete), Basilan-Zamboanga Bridge 2030, Tawi-Tawi port upgrades' },
      { level: 'L5', area: 'Rules', expectedImpact: 'Implement affirmative investment policies with minimum equity thresholds for archipelagic provinces' },
      { level: 'L3', area: 'Goals', expectedImpact: 'Set provincial equity KPIs alongside aggregate targets; require BBOI to publish provincial investment disparity metrics quarterly' },
    ],
  },
  {
    id: 'A4',
    name: 'Growth & Underinvestment',
    pattern: 'Growth approaches a limit that could be alleviated if capacity investments keep pace, but delayed capacity investment allows performance to degrade.',
    birdContext: 'Investment approvals surge to ₱5.1B (Q1 2026) while infrastructure bottlenecks intensify: 25–30% energy gap, <30% broadband, 59.3% literacy, 45–60 day halal certification. Without phased capacity building, growth plateaus as investor ROI erodes.',
    intervention: 'Fast-track ZBIP, BSEMP, and BEGMP deployments. Link 50% of BARMM block grants to infrastructure/human capital KPI achievement. Build 20% reserve capacity in energy and digital systems.',
    leveragePoint: 'LP2',
    impact: 'high',
    cluster: 'Enablers: Infrastructure, Social Services',
    leverageInterventions: [
      { level: 'L9', area: 'Delay Lengths', expectedImpact: 'Reduce infrastructure planning-to-completion time from 18 months to 12 months through PPP frameworks' },
      { level: 'L10', area: 'Stock-Flow Structure', expectedImpact: 'Expand institutional capacity ahead of demand: hire/train BHB certifiers, BBOI investment officers, TESDA instructors' },
      { level: 'L7', area: 'Positive Feedback Gain', expectedImpact: 'Link 50% of BARMM block grant disbursements to infrastructure/human capital KPI achievement' },
    ],
  },
  {
    id: 'A5',
    name: 'Escalation (Competitive Spirals)',
    pattern: 'Two actors compete; each responds to the other\'s threat with escalating countermeasures, draining resources from productive activity.',
    birdContext: 'Rido/clan dynamics, inter-provincial competition for block grants, and market competition from Malaysian/Indonesian halal hubs create a reinforcing cycle of contestation that diverts resources from development and degrades BARMM\'s investment ecosystem.',
    intervention: 'Inter-provincial development compacts. Transparent formula-based resource allocation. Real-time security-investment dashboards. Conflict de-escalation and mediation mechanisms.',
    leveragePoint: 'LP3',
    impact: 'medium',
    cluster: 'Cross-Cutting: Peace & Security',
    leverageInterventions: [
      { level: 'L2', area: 'Mindset / Paradigm', expectedImpact: 'Shift from zero-sum to positive-sum governance through inter-provincial development compacts and shared superordinate goals (halal hub, BIMP-EAGA)' },
      { level: 'L5', area: 'Rules', expectedImpact: 'Establish transparent, formula-based resource allocation for block grants, infrastructure sequencing, and investment facilitation offices' },
      { level: 'L8', area: 'Negative Feedback', expectedImpact: 'Strengthen conflict de-escalation mechanisms; deploy real-time security-investment dashboards' },
    ],
  },
  {
    id: 'A6',
    name: 'The "Big Man" Archetype',
    pattern: 'Power concentration in a single actor creates patronage cycles (R1), social exclusion and conflict (R2), and resource depletion (R3) that collectively trap the system in low-development equilibrium.',
    birdContext: 'Concentration of power in clan-based political leaders drives patronage politics (biased resource distribution), exclusion/resentment cycles (rido, radicalism), and governance failure — perpetuating a vicious cycle that traps BARMM in underperformance despite peace dividend gains.',
    intervention: 'Shift from "power over" to "power with" governance. Merit-based civil service. Transparent procurement. Barangay-level participatory governance. Civil society oversight mechanisms.',
    leveragePoint: 'LP3',
    impact: 'high',
    cluster: 'Cross-Cutting: Moral Governance',
    leverageInterventions: [
      { level: 'L1', area: 'Transcend Paradigms', expectedImpact: 'Redefine governance from "power over" to "power with"; shift from clan-based to issue-based governance' },
      { level: 'L2', area: 'Mindset / Paradigm', expectedImpact: 'Promote inter-clan dialogue; establish multi-clan development councils' },
      { level: 'L5', area: 'Rules', expectedImpact: 'Implement merit-based civil service; enforce anti-patronage laws; establish transparent procurement' },
      { level: 'L6', area: 'Information Flows', expectedImpact: 'Publish real-time budget execution data; establish citizen feedback mechanisms' },
    ],
  },
  {
    id: 'A7',
    name: 'Tragedy of the Commons',
    pattern: 'Individual actors rationally maximize short-term gains from shared resources, collectively depleting the commons until system collapse.',
    birdContext: 'Fragmented governance of shared resources (watersheds, fishing grounds, forest reserves, grid capacity) enables short-term over-exploitation despite collective long-term costs — particularly in the Foundations cluster where delayed feedback masks irreversible depletion thresholds.',
    intervention: 'Bangsamoro Forestry Code enactment. Inter-agency MOAs for watershed management. Community co-management of marine protected areas. Benefit-sharing protocols for carbon/PES.',
    leveragePoint: 'LP5',
    impact: 'high',
    cluster: 'Foundations: Agriculture, Fisheries, Forestry, Environment',
    leverageInterventions: [
      { level: 'L4', area: 'Self-Organization', expectedImpact: 'Empower LGUs, farmer/fisher cooperatives, and indigenous communities to co-manage watersheds, marine protected areas, and forest concessions' },
      { level: 'L5', area: 'Rules', expectedImpact: 'Fast-track Bangsamoro Forestry Code; institutionalize inter-agency MOAs; formalize carbon/PES benefit-sharing protocols' },
      { level: 'L6', area: 'Information Flows', expectedImpact: 'Deploy real-time environmental monitoring systems; publish resource depletion indicators for public accountability' },
    ],
  },
];

// ─── BEIE Cluster Reference ──────────────────────────────────────────────────
export const BEIE_CLUSTERS = [
  {
    id: 'C0',
    name: 'Cross-Cutting Operating Systems',
    shortName: 'Cross-Cutting',
    desc: 'Moral Governance, Resilience, Peace & Security, Human Capital, Environmental Stewardship',
    color: 'gold',
    icon: 'shield',
  },
  {
    id: 'C1',
    name: 'Cluster 1: Foundations',
    shortName: 'Foundations',
    desc: 'Agriculture, Fisheries, Forestry, Energy, and Environment',
    color: 'green',
    icon: 'leaf',
  },
  {
    id: 'C2',
    name: 'Cluster 2: Transformers',
    shortName: 'Transformers',
    desc: 'Industry, Manufacturing, Logistics, Halal Processing',
    color: 'blue',
    icon: 'factory',
  },
  {
    id: 'C3',
    name: 'Cluster 3: Enablers',
    shortName: 'Enablers',
    desc: 'Infrastructure, Social Services & Protection, Health',
    color: 'teal',
    icon: 'building',
  },
  {
    id: 'C4',
    name: 'Cluster 4: Connectors',
    shortName: 'Connectors',
    desc: 'Tourism, Digital Connectivity, Trade, Exports, BIMP-EAGA Integration',
    color: 'purple',
    icon: 'network',
  },
  {
    id: 'C5',
    name: 'Cluster 5: Financiers',
    shortName: 'Financiers',
    desc: 'Islamic Banking, Waqf, Takaful, Microfinance',
    color: 'amber',
    icon: 'coins',
  },
] as const;

/** Leverage Point Reference (Meadows, 1999 — applied to BIRD 2026-2035 context) */
export const LEVERAGE_POINTS = [
  { id: 'LP1', meadows: 'L1', name: 'Halal Certification Integrity',    desc: 'OIC/SMIIC accreditation as market-access gateway; BHB as primary LP1 driver', priority: 'Critical' },
  { id: 'LP2', meadows: 'L2', name: 'Infrastructure & Human Capital',   desc: 'Raise B1 growth ceiling: ZBIP, BSEMP, BEGMP, TVET-industry alignment', priority: 'Critical' },
  { id: 'LP3', meadows: 'L3', name: 'Governance & Investor Confidence', desc: 'Activate R2 feedback loop: BICC, BBOI aftercare, moral governance institutionalization', priority: 'High' },
  { id: 'LP4', meadows: 'L4', name: 'Islamic Finance Mobilization',     desc: 'Al-Amanah expansion; Takaful; Waqf; Islamic fintech for MSME financing', priority: 'High' },
  { id: 'LP5', meadows: 'L5', name: 'Green Economy Activation',         desc: 'JMC 2026-01; Forestry Code; REDD+; PES frameworks for LGU revenue', priority: 'High' },
] as const;
