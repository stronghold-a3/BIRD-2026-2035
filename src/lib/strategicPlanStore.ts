// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Strategic Plan Store
// Central schema, factory functions, and storage utilities.
// All types are BIRD 2026–2035 domain-aligned.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enumerations & Union Types ────────────────────────────────────────────────
export type UserRole        = 'owner' | 'admin' | 'editor' | 'viewer';
export type PlanStatus      = 'draft' | 'active' | 'archived';
export type PAPType         = 'program' | 'activity' | 'project';
export type PAPStatus       = 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
export type KPIStatus       = 'on-track' | 'at-risk' | 'delayed' | 'completed';
export type SWOTCategory    = 'strength' | 'weakness' | 'opportunity' | 'threat';
export type TOWSQuadrant    = 'SO' | 'ST' | 'WO' | 'WT';
export type BSCPerspective  = 'financial' | 'stakeholder' | 'internal_process' | 'learning_growth';
export type BEIECluster     = 'foundations' | 'transformers' | 'enablers' | 'connectors' | 'financiers' | 'cross-cutting';
export type BIRDPhase       = '1' | '2' | '3';
export type LeveragePoint   = 'LP1' | 'LP2' | 'LP3' | 'LP4' | 'LP5';
export type ActionFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type PublicAccess    = 'none' | 'view' | 'comment';
export type LoopType        = 'R' | 'B'; // Reinforcing | Balancing
export type CLDNodeCategory = 'strength' | 'weakness' | 'opportunity' | 'threat' | 'custom';

// ── User Entity ───────────────────────────────────────────────────────────────
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
  organization?: string;
}

// ── Collaboration Primitives ──────────────────────────────────────────────────
export interface Comment {
  id: string;
  planId: string;
  itemType: 'general' | 'swot' | 'strategy' | 'objective' | 'kpi' | 'pap' | 'cld-node' | 'archetype';
  itemId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

export interface ActivityLogEntry {
  id: string;
  planId: string;
  organizationId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  actionType: 'create' | 'update' | 'delete' | 'share' | 'invite' | 'comment' | 'resolve' |
              'apply_archetype' | 'modify_cld' | 'score_swot' | 'unshare' | 'remove' | 'export';
  itemType: 'plan' | 'organization' | 'member' | 'swot' | 'strategy' | 'objective' |
            'kpi' | 'pap' | 'cld' | 'archetype' | 'comment';
  itemId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PresenceUser {
  userId: string;
  userName: string;
  userEmail: string;
  currentSection: string;
  currentSubSection?: string;
  editingItemId?: string;
  editingItemType?: string;
  isEditing: boolean;
  cursorX?: number;
  cursorY?: number;
  lastSeen: string;
}

// ── Systems Thinking (CLD) ────────────────────────────────────────────────────
export interface CLDNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  category?: CLDNodeCategory;
  /** References a BEIE cluster for color-coding */
  beieCluster?: BEIECluster;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  comments?: Comment[];
}

export interface CLDLinkData {
  from: string;
  to: string;
  /** + reinforcing / − counteracting */
  polarity: '+' | '-';
  strength?: 'strong' | 'moderate' | 'weak';
  delay?: boolean; // double-hash delay marker
  createdBy?: string;
  createdAt?: string;
}

export interface DetectedLoop {
  nodeIds: string[];
  type: LoopType;
  name: string;
  description?: string;
  archetype?: string;
  strength?: number; // 1–5
}

export interface CLDSnapshot {
  id: string;
  name?: string;  // legacy
  label?: string; // active canvas
  planId?: string;
  nodes: CLDNodeData[];
  links: CLDLinkData[];
  detectedLoops?: DetectedLoop[];
  appliedArchetypeId?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  notes?: string;
}

// Convenience aliases used across hooks/components
export type CLDNode = CLDNodeData & { strength?: number };
export type CLDLink = CLDLinkData;

// ── SWOT ──────────────────────────────────────────────────────────────────────
export interface SWOTItem {
  id: string;
  category: SWOTCategory;
  description: string;
  impactScore: number;      // 1–5
  likelihoodScore: number;  // 1–5
  aiGenerated: boolean;
  /** Connects this item to a BIRD leverage point (LP1–LP5) */
  leveragePoint?: LeveragePoint;
  /** BEIE cluster this item primarily affects */
  beieCluster?: BEIECluster;
  // User tracking
  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedByEmail?: string;
  modifiedByName?: string;
  modifiedAt?: string;
  // Collaboration
  comments?: Comment[];
  assignedTo?: string;
}

// ── Strategic Options (TOWS) ──────────────────────────────────────────────────
export interface StrategicOption {
  id: string;
  optionType: TOWSQuadrant;
  title: string;
  description: string;
  priorityScore: number;    // 1–5
  feasibilityScore: number; // 1–5
  selected: boolean;
  /** Meadows leverage level (1–12) */
  leverageLevel?: number;
  leveragePoint?: LeveragePoint;
  beieCluster?: BEIECluster;
  birdPhase?: BIRDPhase;
  swotPairs?: string;
  resourceRequirement?: 'low' | 'medium' | 'high';
  // User tracking
  createdBy?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedByEmail?: string;
  modifiedByName?: string;
  modifiedAt?: string;
  proposedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ── Balanced Scorecard ────────────────────────────────────────────────────────

/**
 * Plan-level KPI — stored inside a BSCObjective.
 * NOTE: This is the *plan's* KPI entity (user-defined). It is distinct from
 * the read-only BIRD 2026–2035 reference KPIs in `src/data/bird/kpis.ts`.
 * The two types share similar field names but serve different purposes.
 */
export interface PlanKPI {
  id: string;
  objectiveId: string;
  name: string;
  description: string;
  unit: string;
  baselineValue: number;
  targetValue: number;    // 2035 target
  target2030?: number;    // 2030 interim target (BIRD convention)
  currentValue: number;
  frequency: ActionFrequency;
  /** User ID of the KPI owner/champion */
  owner: string;
  ownerName?: string;
  ownerEmail?: string;
  status: KPIStatus;
  leveragePoint?: LeveragePoint;
  benchmarkSource?: string; // e.g. "PSA", "BHIDP 2025-2030"
  // User tracking
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
  updates?: {
    value: number;
    updatedBy: string;
    updatedByName: string;
    updatedAt: string;
    note?: string;
  }[];
}

export interface BSCObjective {
  id: string;
  perspective: BSCPerspective;
  objective: string;
  description: string;
  weight: number;  // 1.0–2.0
  kpis: PlanKPI[];
  leveragePoint?: LeveragePoint;
  beieCluster?: BEIECluster;
  birdPhase?: BIRDPhase;
  /** BSC code from BIRD reference (e.g. "F1", "IP2", "LG3") */
  bscCode?: string;
  // User tracking
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedAt?: string;
  champion?: string;
  championName?: string;
}

// ── PAPs (Programs, Activities, Projects) ─────────────────────────────────────
export interface PAP {
  id: string;
  objectiveId?: string;
  papType: PAPType;
  name: string;
  description: string;
  owner: string;
  ownerName?: string;
  ownerEmail?: string;
  budget: number;         // PHP
  spent: number;          // PHP
  startDate: string;      // ISO date
  endDate: string;        // ISO date
  progress: number;       // 0–100
  status: PAPStatus;
  /** BEIE cluster alignment */
  beieCluster?: BEIECluster;
  /** BIRD implementation phase */
  birdPhase?: BIRDPhase;
  leveragePoint?: LeveragePoint;
  leadAgency?: string;
  supportAgencies?: string[];
  sdgAlignment?: string;
  // User tracking
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedAt?: string;
  progressUpdates?: {
    progress: number;
    spent: number;
    updatedBy: string;
    updatedByName: string;
    updatedAt: string;
    note?: string;
  }[];
  teamMembers?: string[];
}

// ── Plan Versioning & Sharing ──────────────────────────────────────────────────
export interface PlanVersion {
  version: number;
  savedBy: string;
  savedByName: string;
  savedAt: string;
  changes: string[];
  snapshot: Partial<StrategicPlan>;
}

export interface PlanShare {
  id: string;
  planId: string;
  sharedWithEmail: string;
  sharedWithName?: string;
  sharedWithUserId?: string;
  permission: 'viewer' | 'editor' | 'admin';
  sharedBy: string;
  sharedByName: string;
  createdAt: string;
  expiresAt?: string;
  permissions?: {
    canEditCLD: boolean;
    canApplyArchetypes: boolean;
    canModifySWOT: boolean;
    canViewComments: boolean;
    canAddComments: boolean;
  };
}

// ── Strategic Plan (Root) ─────────────────────────────────────────────────────
export interface StrategicPlan {
  id: string;
  name: string;
  organization: string;
  vision: string;
  mission: string;
  strategicIntent: string;
  planningPeriodStart: string;
  planningPeriodEnd: string;
  status: PlanStatus;
  // Core planning data
  swotItems: SWOTItem[];
  strategicOptions: StrategicOption[];
  objectives: BSCObjective[];
  paps: PAP[];
  // Systems Thinking
  cldNodes?: CLDNode[];
  cldLinks?: CLDLink[];
  activeCLDSnapshotId?: string;
  cldSnapshots?: CLDSnapshot[];
  appliedArchetypes?: {
    archetypeId: string;
    appliedBy: string;
    appliedByName: string;
    appliedAt: string;
    notes?: string;
  }[];
  // User tracking
  createdBy: string;
  createdByEmail: string;
  createdByName: string;
  createdAt: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByName?: string;
  updatedAt: string;
  // Collaboration
  contributors: string[];
  version?: number;
  versionHistory?: PlanVersion[];
  // Public sharing
  custom_share_url?: string;
  public_access?: PublicAccess;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const getStorageKey = (userId?: string) =>
  userId ? `bird-2026-2035-data-${userId}` : 'bird-2026-2035-data';

export const generateId = () => crypto.randomUUID();

export const generateSlug = (): string => {
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}`;
};

export const loadFromStorage = (
  userId?: string,
): { plans: StrategicPlan[]; currentPlanId: string | null; userPreferences?: Record<string, unknown> } => {
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('[strategicPlanStore] Failed to load from storage:', e);
  }
  return { plans: [], currentPlanId: null };
};

export const saveToStorage = (
  plans: StrategicPlan[],
  currentPlanId: string | null,
  userId?: string,
  userPreferences?: Record<string, unknown>,
) => {
  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify({ plans, currentPlanId, userPreferences, savedAt: new Date().toISOString() }),
    );
  } catch (e) {
    console.error('[strategicPlanStore] Failed to save to storage:', e);
  }
};

export const exportPlanForSharing = (plan: StrategicPlan, userInfo: UserInfo): string => {
  const exportData = { ...plan, _exportedBy: userInfo, _exportedAt: new Date().toISOString(), _exportVersion: '2.1' };
  return btoa(JSON.stringify(exportData));
};

export const importPlanFromShare = (base64Data: string, userInfo: UserInfo): StrategicPlan | null => {
  try {
    const data = JSON.parse(atob(base64Data));
    return {
      ...createEmptyPlan({ name: `${data.name} (Imported)` }),
      ...data,
      id: generateId(),
      createdBy: userInfo.id,
      createdByEmail: userInfo.email,
      createdByName: userInfo.name,
      createdAt: new Date().toISOString(),
      updatedBy: userInfo.id,
      updatedByEmail: userInfo.email,
      updatedByName: userInfo.name,
      updatedAt: new Date().toISOString(),
      contributors: [userInfo.id],
      status: 'draft' as PlanStatus,
    };
  } catch (e) {
    console.error('[strategicPlanStore] Failed to import plan:', e);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const createEmptyPlan = (
  data: Partial<StrategicPlan> = {},
  userInfo?: UserInfo,
): StrategicPlan => {
  const now = new Date().toISOString();
  const userId    = userInfo?.id    || 'anonymous';
  const userEmail = userInfo?.email || 'anonymous@example.com';
  const userName  = userInfo?.name  || 'Anonymous User';
  return {
    id:                  generateId(),
    name:                data.name                || 'New Strategic Plan',
    organization:        data.organization        || '',
    vision:              data.vision              || '',
    mission:             data.mission             || '',
    strategicIntent:     data.strategicIntent     || '',
    planningPeriodStart: data.planningPeriodStart || '2026-01-01',
    planningPeriodEnd:   data.planningPeriodEnd   || '2035-12-31',
    status:              'draft',
    swotItems:           [],
    strategicOptions:    [],
    objectives:          [],
    paps:                [],
    createdBy:           userId,
    createdByEmail:      userEmail,
    createdByName:       userName,
    createdAt:           now,
    updatedBy:           userId,
    updatedByEmail:      userEmail,
    updatedByName:       userName,
    updatedAt:           now,
    contributors:        [userId],
    version:             1,
    public_access:       'none',
    ...data,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE PLAN — Official BIRD 2026–2035 Baseline
// Data sourced strictly from BIRD 2026–2035 document (BOI-MTIT, BARMM, 2026)
// ─────────────────────────────────────────────────────────────────────────────
export const createSamplePlan = (userInfo?: UserInfo): StrategicPlan => {
  const userId    = userInfo?.id    || 'demo-user';
  const userEmail = userInfo?.email || 'demo@barmm.gov.ph';
  const userName  = userInfo?.name  || 'BOI-MTIT Demo User';

  const plan = createEmptyPlan({
    name:            'Bangsamoro Investment Roadmap 2026–2035 (BIRD)',
    organization:    'Bureau of Investments – Ministry of Trade, Investments and Tourism (BOI-MTIT), BARMM',
    vision:          'Everyone enjoys the benefits of inclusive and resilient economic development propelled by sustainable trade, investments, and tourism in the Bangsamoro.',
    mission:         'To develop and promote industrialization effectively controlled by the region\'s inhabitants and to act as catalyst for intensified private sector activity in order to accelerate and sustain economic growth in BARMM.',
    strategicIntent: 'To position BARMM as the Philippines\' premier hub for halal industry, Islamic finance, and green economy investment — delivering ₱550B+ GRDP, <20% poverty incidence, and 5,000+ halal-certified MSMEs by 2035 — through the Integrated Ecosystem Development Strategy (IEDS) anchored by five BEIE clusters and five strategic leverage points (LP1–LP5).',
    planningPeriodStart: '2026-01-01',
    planningPeriodEnd:   '2035-12-31',
  }, userInfo);

  const now = new Date().toISOString();
  const createItem = <T,>(item: T): T & { createdBy: string; createdByEmail: string; createdByName: string; createdAt: string } => ({
    ...item, createdBy: userId, createdByEmail: userEmail, createdByName: userName, createdAt: now,
  });

  // ── SWOT Items (from BIRD 2026-2035 Chapter 3) ─────────────────────────────
  plan.swotItems = [
    // STRENGTHS
    createItem({ id: generateId(), category: 'strength' as const, description: 'Halal legitimacy and cultural credibility derived from the region\'s Islamic heritage and Moral Governance framework — an irreproducible authenticity advantage.', impactScore: 5, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster }),
    createItem({ id: generateId(), category: 'strength' as const, description: 'Strategic location within BIMP-EAGA, serving as the Philippines\' gateway to a market of 70M+ ASEAN consumers across Brunei, Indonesia, Malaysia, and Philippines.', impactScore: 5, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'connectors' as BEIECluster }),
    createItem({ id: generateId(), category: 'strength' as const, description: 'Strong agriculture, fisheries, and forestry base — AFF contributes 32.4% of GRDP — with vast natural resource endowments including rubber, coconut, seaweed, and fish stocks.', impactScore: 4, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'foundations' as BEIECluster }),
    createItem({ id: generateId(), category: 'strength' as const, description: 'Growing legislative authority and policy momentum from the Bangsamoro Organic Law (RA 11054), BOL, and CREATE MORE Act enabling investment-friendly regulatory environment.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster }),
    createItem({ id: generateId(), category: 'strength' as const, description: 'Expanding domestic halal consumer base — 5.69M Muslim population (PSA 2025) with specific Shariah-compliant consumption requirements creates a built-in market foundation.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster }),
    // WEAKNESSES
    createItem({ id: generateId(), category: 'weakness' as const, description: 'Weak halal certification system — Bangsamoro Halal Board lacks OIC/SMIIC international accreditation, limiting global market access. Processing time: 45–60 days (target: ≤21 days by 2035).', impactScore: 5, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster }),
    createItem({ id: generateId(), category: 'weakness' as const, description: 'Infrastructure deficit: ~75% electrification (target 100% by 2035); <30% broadband coverage (target 85% by 2035); inadequate farm-to-market roads constraining agri-processing.', impactScore: 5, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP2' as LeveragePoint, beieCluster: 'enablers' as BEIECluster }),
    createItem({ id: generateId(), category: 'weakness' as const, description: 'Low functional literacy: 59.3% (PSA FLEMMS 2024) — significantly below national average — limiting skilled workforce supply for modern agri-industrial investment.', impactScore: 4, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP2' as LeveragePoint, beieCluster: 'enablers' as BEIECluster }),
    createItem({ id: generateId(), category: 'weakness' as const, description: 'Fragmented inter-agency coordination — 15 ministries operating in silos slow investment facilitation; absence of a single investment command center compounds BICC gap.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster }),
    createItem({ id: generateId(), category: 'weakness' as const, description: 'Post-harvest losses of 20–40% across AFF sector — cold chain gaps, limited storage, and inadequate processing facilities suppress value creation in the Foundations cluster.', impactScore: 4, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP2' as LeveragePoint, beieCluster: 'foundations' as BEIECluster }),
    // OPPORTUNITIES
    createItem({ id: generateId(), category: 'opportunity' as const, description: 'Global halal market worth USD 2.3 trillion (2023) — with projected growth to USD 3.9T by 2030 — creating massive export demand for BARMM\'s OIC/SMIIC-certified halal products.', impactScore: 5, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'connectors' as BEIECluster }),
    createItem({ id: generateId(), category: 'opportunity' as const, description: 'Carbon credit and Payment for Ecosystem Services (PES) revenue via JMC No. 2026-01 — BARMM\'s 1.4M ha forest cover and high renewable energy share (75.86% BSEMP) position the region as a green economy frontier.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP5' as LeveragePoint, beieCluster: 'foundations' as BEIECluster }),
    createItem({ id: generateId(), category: 'opportunity' as const, description: 'Islamic finance ecosystem: RA 11439 (Islamic Banking Law) and IsDB partnership open access to Shariah-compliant capital at scale — takaful, waqf, sukuk for MSMEs and infrastructure.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP4' as LeveragePoint, beieCluster: 'financiers' as BEIECluster }),
    createItem({ id: generateId(), category: 'opportunity' as const, description: 'BIMP-EAGA subregional integration — EGL Sub-Committee Strategic Plan 2025-2028 and Bongao–Tawi-Tawi–Malaysia maritime corridor create concrete cross-border trade channels.', impactScore: 4, likelihoodScore: 5, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'connectors' as BEIECluster }),
    createItem({ id: generateId(), category: 'opportunity' as const, description: 'Basilan post-conflict normalization (ASG-free since June 2024, PIA 2025) — first major archipelagic province stabilization opens rubber, coconut, and eco-tourism investments.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'foundations' as BEIECluster }),
    // THREATS
    createItem({ id: generateId(), category: 'threat' as const, description: 'Competition from established halal hubs (Malaysia\'s HDC, Indonesia\'s BPJPH) with deeper certifier pools, stronger logistics, and earlier OIC recognition — first-mover advantage at risk.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'connectors' as BEIECluster }),
    createItem({ id: generateId(), category: 'threat' as const, description: 'OIC/SMIIC standards non-recognition risk — if BHB fails to achieve international accreditation, BARMM\'s halal certification remains non-portable and export corridors collapse.', impactScore: 5, likelihoodScore: 3, aiGenerated: false, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster }),
    createItem({ id: generateId(), category: 'threat' as const, description: 'Residual investor perception risk from historical conflict — despite ASG defeat and peace dividend, investor due diligence still flags BARMM as high-risk, deterring first-movers.', impactScore: 5, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster }),
    createItem({ id: generateId(), category: 'threat' as const, description: 'Climate vulnerability — BARMM is among the Philippines\' most disaster-prone areas; typhoons, flooding, and drought threaten agricultural assets and infrastructure investments.', impactScore: 4, likelihoodScore: 4, aiGenerated: false, leveragePoint: 'LP5' as LeveragePoint, beieCluster: 'foundations' as BEIECluster }),
    createItem({ id: generateId(), category: 'threat' as const, description: 'Political transition uncertainty — shift to a regular elected parliament introduces governance continuity risk and may delay or reverse investment-enabling regulatory reforms.', impactScore: 4, likelihoodScore: 3, aiGenerated: false, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster }),
  ];

  // ── Strategic Options (BIRD TOWS — IEDS Recommended Strategy) ─────────────
  plan.strategicOptions = [
    // SO
    createItem({ id: generateId(), optionType: 'SO' as TOWSQuadrant, title: 'Integrated Ecosystem Development Strategy (IEDS) — Recommended', description: 'Integrate halal industry development, infrastructure enablement, and governance strengthening into a coherent BEIE-cluster framework. Halal serves as primary value proposition; infrastructure sequenced for halal value chains; governance reforms focused on certification and trade facilitation. Triggers R1 Investment–Development virtuous cycle.', priorityScore: 5, feasibilityScore: 5, selected: true, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'S1+S3 × O1+O3', leverageLevel: 3, resourceRequirement: 'high', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'SO' as TOWSQuadrant, title: 'Halal Hub Rapid Development via OIC/SMIIC Accreditation', description: 'Leverage cultural authenticity and Islamic legitimacy to develop the halal ecosystem at pace. Fast-track BHB → OIC/SMIIC accreditation; operationalize Bangsamoro Halal Park (Matanog); integrate AFF-to-halal value chains targeting USD 2.3T global market.', priorityScore: 5, feasibilityScore: 4, selected: true, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'S1+S5 × O1', leverageLevel: 5, resourceRequirement: 'medium', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'SO' as TOWSQuadrant, title: 'BIMP-EAGA Trade Corridor Expansion', description: 'Leverage BARMM\'s BIMP-EAGA gateway position to expand subregional trade — Polloc Freeport, Bongao maritime corridor, and Basilan-Zamboanga Bridge 2030 as concrete connectors to 70M+ consumer market.', priorityScore: 4, feasibilityScore: 4, selected: true, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'connectors' as BEIECluster, birdPhase: '2' as BIRDPhase, swotPairs: 'S2+S3 × O4', leverageLevel: 10, resourceRequirement: 'high', approvedBy: userId, approvedAt: now }),
    // ST
    createItem({ id: generateId(), optionType: 'ST' as TOWSQuadrant, title: 'Governance-Centered Investor Confidence Building (R2 Loop Activation)', description: 'Counter negative perception through BICC dashboard, BBOI aftercare protocol, 1-day digital registration (BEGMP), and transparent procurement. Activates R2 Governance–Investor Confidence reinforcing loop.', priorityScore: 4, feasibilityScore: 4, selected: true, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'S4 × T3', leverageLevel: 6, resourceRequirement: 'medium', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'ST' as TOWSQuadrant, title: 'OIC/SMIIC Standards Alignment to Neutralize Competition', description: 'Secure Mutual Recognition Arrangement (MRA) with OIC/SMIIC by 2035 to neutralize Malaysia/Indonesia competitive advantage. Differentiate via Islamic moral governance — authentic halal narrative vs. purely commercial positioning.', priorityScore: 5, feasibilityScore: 3, selected: true, leveragePoint: 'LP1' as LeveragePoint, beieCluster: 'transformers' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'S1 × T1+T2', leverageLevel: 5, resourceRequirement: 'medium', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'ST' as TOWSQuadrant, title: 'Climate-Smart Agribusiness & Green Economy Integration', description: 'Deploy climate-resilient agri-practices and REDD+-financed conservation corridors to protect the AFF base from climate threats — while simultaneously generating PES/carbon revenue via JMC 2026-01.', priorityScore: 3, feasibilityScore: 4, selected: false, leveragePoint: 'LP5' as LeveragePoint, beieCluster: 'foundations' as BEIECluster, birdPhase: '2' as BIRDPhase, swotPairs: 'S3 × T4', leverageLevel: 7, resourceRequirement: 'high' }),
    // WO
    createItem({ id: generateId(), optionType: 'WO' as TOWSQuadrant, title: 'Infrastructure-First Foundation Building (B1 Ceiling Raise)', description: 'Address B1 Growth-Resource Constraints by front-loading ZBIP (₱6.67B), BSEMP, and BEGMP in Phase 1. Achieve 80% electrification by 2028, 100% by 2035; 60% broadband by 2030. Raises investment ceiling to enable Phase 2 acceleration.', priorityScore: 5, feasibilityScore: 3, selected: true, leveragePoint: 'LP2' as LeveragePoint, beieCluster: 'enablers' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'W2 × O1+O2', leverageLevel: 10, resourceRequirement: 'high', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'WO' as TOWSQuadrant, title: 'Halal Human Capital Development & TVET-Industry Alignment', description: 'Close halal expertise gap via BHB Training Academy (OIC partnership), TESDA-industry alignment, and community learning centers. Train 50 BHB officers in 2026 (100+ by 2035) — addressing LG2 BSC gap.', priorityScore: 4, feasibilityScore: 4, selected: true, leveragePoint: 'LP2' as LeveragePoint, beieCluster: 'enablers' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'W4 × O1', leverageLevel: 4, resourceRequirement: 'medium', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'WO' as TOWSQuadrant, title: 'Islamic Finance MSME Financing Platform', description: 'Bridge the B4 Islamic finance gap by scaling Al-Amanah Islamic Bank to all 7 provincial capitals, launching Islamic fintech for MSME financing, and piloting takaful/waqf products targeting ₱20B+ in Islamic banking assets by 2035.', priorityScore: 4, feasibilityScore: 3, selected: true, leveragePoint: 'LP4' as LeveragePoint, beieCluster: 'financiers' as BEIECluster, birdPhase: '2' as BIRDPhase, swotPairs: 'W5 × O3', leverageLevel: 4, resourceRequirement: 'medium', approvedBy: userId, approvedAt: now }),
    // WT
    createItem({ id: generateId(), optionType: 'WT' as TOWSQuadrant, title: 'Institutional Coordination Reform & Adaptive Governance (Big Man Corrective)', description: 'Break the "Big Man" archetype through merit-based civil service reform, transparent procurement, inter-provincial development compacts, and BICC-based adaptive management. Institutionalize formula-based resource allocation to counter patronage cycles.', priorityScore: 4, feasibilityScore: 3, selected: true, leveragePoint: 'LP3' as LeveragePoint, beieCluster: 'cross-cutting' as BEIECluster, birdPhase: '1' as BIRDPhase, swotPairs: 'W3 × T3+T5', leverageLevel: 2, resourceRequirement: 'low', approvedBy: userId, approvedAt: now }),
    createItem({ id: generateId(), optionType: 'WT' as TOWSQuadrant, title: 'Green Economy Revenue Diversification (Shifting the Burden Corrective)', description: 'Reduce dependency on national transfers by activating autonomous revenue streams: carbon credits, PES, eco-tourism fees (JMC 2026-01 + Forestry Code). Converts shared environmental assets from threat vectors to income generators.', priorityScore: 3, feasibilityScore: 3, selected: false, leveragePoint: 'LP5' as LeveragePoint, beieCluster: 'foundations' as BEIECluster, birdPhase: '2' as BIRDPhase, swotPairs: 'W3 × T4', leverageLevel: 4, resourceRequirement: 'medium' }),
  ];

  // ── BSC Objectives (sample — Chapter 6 BIRD 2026-2035) ────────────────────
  const obj1Id = generateId();
  const obj2Id = generateId();
  const obj3Id = generateId();
  const obj4Id = generateId();

  plan.objectives = [
    {
      id: obj1Id, perspective: 'financial', weight: 1.5,
      objective: 'Grow BARMM GRDP to ₱400B by 2030 and ₱550B+ by 2035',
      description: 'Accelerate GRDP growth from 2.7% (2024) toward PDP 5–6% target through investment-led expansion across all BEIE clusters.',
      bscCode: 'F2', leveragePoint: 'LP1', beieCluster: 'transformers', birdPhase: '1',
      createdBy: userId, createdByName: userName, createdAt: now, champion: userId, championName: userName,
      kpis: [{
        id: generateId(), objectiveId: obj1Id, name: 'BARMM GRDP', description: 'Annual Gross Regional Domestic Product at current prices',
        unit: '₱B', baselineValue: 299.5, targetValue: 550, target2030: 400, currentValue: 299.5,
        frequency: 'annually', owner: userId, ownerName: userName, status: 'on-track', leveragePoint: 'LP1',
        benchmarkSource: 'PSA-RSSO BARMM / NEDA PDP 2023-2028',
      }],
    },
    {
      id: obj2Id, perspective: 'financial', weight: 1.5,
      objective: 'Increase investment approvals to ₱8B p.a. (2030) and ₱15B p.a. (2035)',
      description: 'Grow both FDI and domestic investment approvals from ₱5.1B (Q1 2026) through BBOI facilitation, halal park development, and BIMP-EAGA corridors.',
      bscCode: 'F1', leveragePoint: 'LP1', beieCluster: 'connectors', birdPhase: '1',
      createdBy: userId, createdByName: userName, createdAt: now, champion: userId, championName: userName,
      kpis: [{
        id: generateId(), objectiveId: obj2Id, name: 'Annual Investment Approvals', description: 'Total BBOI-approved investment value',
        unit: '₱B', baselineValue: 5.1, targetValue: 15, target2030: 8, currentValue: 5.1,
        frequency: 'quarterly', owner: userId, ownerName: userName, status: 'on-track', leveragePoint: 'LP1',
        benchmarkSource: 'BBOI / BEZA Investment Reports (Q1 2026)',
      }],
    },
    {
      id: obj3Id, perspective: 'internal_process', weight: 1.5,
      objective: 'Achieve OIC/SMIIC halal accreditation and certify 5,000+ MSMEs by 2035',
      description: 'Operationalise BHB with full OIC/SMIIC international recognition by 2030; scale halal-certified MSMEs from ~500 (2024) to 5,000+ by 2035.',
      bscCode: 'IP1', leveragePoint: 'LP1', beieCluster: 'transformers', birdPhase: '1',
      createdBy: userId, createdByName: userName, createdAt: now, champion: userId, championName: userName,
      kpis: [{
        id: generateId(), objectiveId: obj3Id, name: 'Halal-Certified MSMEs', description: 'Cumulative BHB-certified MSMEs with valid certification',
        unit: 'firms', baselineValue: 500, targetValue: 5000, target2030: 2000, currentValue: 500,
        frequency: 'quarterly', owner: userId, ownerName: userName, status: 'watch', leveragePoint: 'LP1',
        benchmarkSource: 'BHB Registry / BHIDP 2025-2030',
      }],
    },
    {
      id: obj4Id, perspective: 'stakeholder', weight: 1.5,
      objective: 'Reduce poverty incidence below 25% by 2030 and 20% by 2035',
      description: 'Continue downward trajectory from 55.9% (2018) → 34.8% (2023) → <25% (2030) through investment-led job creation, MSME support, and inclusive PAPs.',
      bscCode: 'S1', leveragePoint: 'LP1', beieCluster: 'cross-cutting', birdPhase: '1',
      createdBy: userId, createdByName: userName, createdAt: now, champion: userId, championName: userName,
      kpis: [{
        id: generateId(), objectiveId: obj4Id, name: 'Poverty Incidence Rate', description: 'BARMM poverty incidence (PSA Family Income and Expenditure Survey)',
        unit: '%', baselineValue: 34.8, targetValue: 20, target2030: 25, currentValue: 34.8,
        frequency: 'annually', owner: userId, ownerName: userName, status: 'watch', leveragePoint: 'LP1',
        benchmarkSource: 'PSA 1H 2023 / BDP 2023-2028',
      }],
    },
  ];

  // ── PAPs (Priority Action Plan, 2026 Foundation Phase) ────────────────────
  plan.paps = [
    createItem({ id: generateId(), objectiveId: obj3Id, papType: 'program' as PAPType, name: 'BHB Operationalisation & OIC/SMIIC Alignment Program', description: 'Establish and operationalise Bangsamoro Halal Board with OIC/SMIIC-aligned certification processes. Certify 50 enterprises in 2026. Commence MRA roadmap.', owner: userId, ownerName: userName, ownerEmail: userEmail, budget: 200_000_000, spent: 0, startDate: '2026-01-01', endDate: '2028-12-31', progress: 15, status: 'in-progress' as PAPStatus, beieCluster: 'transformers' as BEIECluster, birdPhase: '1' as BIRDPhase, leveragePoint: 'LP1' as LeveragePoint, leadAgency: 'BHB / MTIT-BARMM', sdgAlignment: 'SDG 8, 17', teamMembers: [userId] }),
    createItem({ id: generateId(), objectiveId: obj2Id, papType: 'project' as PAPType, name: 'Bangsamoro Halal Park Development — Matanog Site', description: 'Groundbreaking and master-plan construction of Bangsamoro Halal Park at Matanog, Maguindanao del Norte. Anchor tenant pre-qualification; 20+ tenants by 2028.', owner: userId, ownerName: userName, ownerEmail: userEmail, budget: 500_000_000, spent: 0, startDate: '2026-07-01', endDate: '2028-12-31', progress: 5, status: 'planned' as PAPStatus, beieCluster: 'transformers' as BEIECluster, birdPhase: '1' as BIRDPhase, leveragePoint: 'LP2' as LeveragePoint, leadAgency: 'MTIT-BARMM / BBOI', sdgAlignment: 'SDG 8, 9', teamMembers: [userId] }),
    createItem({ id: generateId(), objectiveId: obj2Id, papType: 'project' as PAPType, name: 'Zamboanga-Basilan Interconnection Project (ZBIP)', description: 'Commence ₱6.67B ZBIP to expand Mindanao grid to Basilan. Critical enabler for industrial investment in archipelagic provinces. Target: 80% electrification by 2028.', owner: userId, ownerName: userName, ownerEmail: userEmail, budget: 6_670_000_000, spent: 0, startDate: '2026-04-01', endDate: '2030-12-31', progress: 10, status: 'in-progress' as PAPStatus, beieCluster: 'enablers' as BEIECluster, birdPhase: '1' as BIRDPhase, leveragePoint: 'LP2' as LeveragePoint, leadAgency: 'DOE / MPW', sdgAlignment: 'SDG 7, 9', teamMembers: [userId] }),
    createItem({ id: generateId(), objectiveId: obj2Id, papType: 'activity' as PAPType, name: 'BEGMP Digital Rollout & 1-Day Business Registration', description: 'Complete BEGMP deployment. Achieve 1-day digital business registration via BBOI. Deploy BICC dashboard for real-time investment tracking.', owner: userId, ownerName: userName, ownerEmail: userEmail, budget: 150_000_000, spent: 0, startDate: '2026-01-01', endDate: '2026-12-31', progress: 20, status: 'in-progress' as PAPStatus, beieCluster: 'enablers' as BEIECluster, birdPhase: '1' as BIRDPhase, leveragePoint: 'LP3' as LeveragePoint, leadAgency: 'BDTA / MICT', sdgAlignment: 'SDG 8, 9, 17', teamMembers: [userId] }),
    createItem({ id: generateId(), objectiveId: obj4Id, papType: 'activity' as PAPType, name: 'Bangsamoro Forestry Code Enactment & JMC 2026-01 Signing', description: 'Fast-track Forestry Code through Parliament (ENRE Committee) and sign MENRE-MILG JMC No. 2026-01 activating carbon credit and PES revenue streams for LGUs.', owner: userId, ownerName: userName, ownerEmail: userEmail, budget: 50_000_000, spent: 0, startDate: '2026-01-01', endDate: '2026-06-30', progress: 35, status: 'in-progress' as PAPStatus, beieCluster: 'foundations' as BEIECluster, birdPhase: '1' as BIRDPhase, leveragePoint: 'LP5' as LeveragePoint, leadAgency: 'MENRE-BARMM / Parliament', sdgAlignment: 'SDG 13, 15, 17', teamMembers: [userId] }),
  ];

  return plan;
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const getUserInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getUserColor = (userId: string): string => {
  const palette = [
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const canEdit = (plan: StrategicPlan, userId: string, userRole?: string): boolean =>
  plan.createdBy === userId || userRole === 'admin' || userRole === 'owner';

export const canDelete = (plan: StrategicPlan, userId: string, userRole?: string): boolean =>
  plan.createdBy === userId || userRole === 'owner';

/** Compute plan completion percentage across all 4 BSC perspectives */
export const computePlanCompletion = (plan: StrategicPlan): number => {
  const hasSwot      = plan.swotItems.length >= 4 ? 25 : Math.floor((plan.swotItems.length / 4) * 25);
  const hasStrategies = plan.strategicOptions.filter((o) => o.selected).length >= 2 ? 25 : 0;
  const hasObjectives = plan.objectives.length >= 2 ? 25 : 0;
  const hasPAPs       = plan.paps.length >= 2 ? 25 : 0;
  return hasSwot + hasStrategies + hasObjectives + hasPAPs;
};
