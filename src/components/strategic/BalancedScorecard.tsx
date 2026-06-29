import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-shim';
import {
  DollarSign,
  Users,
  Cog,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  Sparkles,
  Loader2,
  Check,
  X,
  Info,
  ArrowRight,
  Link2,
  AlertCircle,
  Cloud,
  Send,
  MessageSquare,
} from 'lucide-react';
import { BSCObjective, KPI, StrategicPlan, StrategicOption } from '@/lib/strategicPlanStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

// Edge Function URLs
const AI_ASSISTANT_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/ai-strategy-assistant';
const SYNC_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/strategic-planner-sync';
const EMAIL_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/email-notifications';

// ─── NEW: CHAPTER 5 & 6 CONTEXT FOR AI EXPERTISE ─────────────────────────────
const CHAPTER_5_6_CONTEXT = `
=== BIRD 2026-2035 CHAPTER 5 & 6: METRICS & BSC FRAMEWORK ===
[CHAPTER 5: KPI BENCHMARKING & CALIBRATION]
- Calibration Tiers: Baseline (2024-25), Interim 1 (2028), Interim 2 (2030), Terminal (2035), Long-Horizon (2040).
- External Benchmarks: OIC/SMIIC Halal Standards, ESG criteria, PDP 2023-2028, UN SDGs.
- BEIE Clusters: Foundations (AFF, Energy), Transformers (Halal, MSMEs), Enablers (Infra, Digital, Human Capital), Connectors (Trade, BIMP-EAGA), Financiers (Islamic Finance).
- Cross-Cutting OS Metrics: Moral Governance, Resilience, Inclusivity, Peace.

[CHAPTER 6: BALANCED SCORECARD (IEDS ALIGNMENT)]
- FINANCIAL PERSPECTIVE: Investment approvals (₱15B p.a.), GRDP (₱550B+), Exports (₱40B+), Green Economy Revenue (₱500M), Islamic Finance Assets (₱20B+).
- STAKEHOLDER PERSPECTIVE: Investor satisfaction (8.0+/10), MSME halal cert (5,000+), Poverty incidence (<20%), Financial inclusion (70%+), Jobs created (20,000+), Provincial equity (<1.5pp disparity).
- INTERNAL PROCESS PERSPECTIVE: Business registration (1 day digital), BHB OIC/SMIIC accreditation (Full MRA), Infra budget execution (>90%), Inter-agency coordination (8/10), Climate-risk screening (100%).
- LEARNING & GROWTH PERSPECTIVE: Halal expertise (100+ officers), Islamic finance pros (50+), IPA capacity (80% certified), Digital platforms (20+ BEGMP), Functional literacy (75%+), Green economy LGU staff (200+), TESDA alignment (15 TRs).
- CAUSAL PATHWAYS: 1. Halal Economy Value Chain, 2. Infrastructure-Enabled Growth, 3. Green Economy Monetization, 4. Inclusive Development, 5. Islamic Finance Ecosystem.
`;

interface BalancedScorecardProps {
  plan: StrategicPlan;
  onAddObjective: (objective: Omit<BSCObjective, 'id' | 'kpis'>) => void;
  onUpdateObjective: (id: string, updates: Partial<BSCObjective>) => void;
  onRemoveObjective: (id: string) => void;
  onAddKPI: (objectiveId: string, kpi: Omit<KPI, 'id' | 'objectiveId'>) => void;
  onUpdateKPI: (objectiveId: string, kpiId: string, updates: Partial<KPI>) => void;
  onRemoveKPI: (objectiveId: string, kpiId: string) => void;
}

const perspectiveConfig = {
  financial: {
    label: 'Financial',
    icon: DollarSign,
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'How should we appear to funders, investors, and financial stakeholders to achieve our vision?',
    placeholder: 'e.g., Increase investment approvals to ₱15B p.a.',
  },
  stakeholder: {
    label: 'Stakeholder',
    icon: Users,
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'How should we appear to investors, MSMEs, communities, and beneficiaries?',
    placeholder: 'e.g., Reduce poverty incidence to <20%',
  },
  internal_process: {
    label: 'Internal Process',
    icon: Cog,
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'What internal processes must we excel at to satisfy stakeholders and achieve financial objectives?',
    placeholder: 'e.g., Achieve 1-day digital business registration',
  },
  learning_growth: {
    label: 'Learning & Growth',
    icon: GraduationCap,
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'How will we sustain our ability to change, improve, and achieve our vision?',
    placeholder: 'e.g., Improve functional literacy rate to 75%+',
  },
};

// ─── BIRD 2035 ROADMAP BSC TEMPLATE DATA (CHAPTER 6) ─────────────────────────
const BIRD_BSC_TEMPLATE_OBJECTS: BSCObjective[] = [
  // FINANCIAL PERSPECTIVE
  { id: 'bird-f1', perspective: 'financial', weight: 1, objective: 'F1: Increase Investment Approvals', description: 'Investment promotion roadshows; BIMP-EAGA missions; investor aftercare services', kpis: [{ id: 'bird-f1-k1', objectiveId: 'bird-f1', name: 'Annual investment approvals', description: '', baselineValue: 5.1, targetValue: 15, currentValue: 5.1, unit: '₱B', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },
  { id: 'bird-f2', perspective: 'financial', weight: 1, objective: 'F2: Grow Regional Economy', description: 'BEIE ecosystem synchronization; PPP frameworks; value chain development', kpis: [{ id: 'bird-f2-k1', objectiveId: 'bird-f2', name: 'BARMM GRDP', description: '', baselineValue: 299.5, targetValue: 550, currentValue: 299.5, unit: '₱B', frequency: 'annually', owner: 'BPDA', status: 'on-track' }] },
  { id: 'bird-f3', perspective: 'financial', weight: 1, objective: 'F3: Expand Export Revenue', description: 'UAE halal corridor; BIMP-EAGA trade facilitation; export readiness programs', kpis: [{ id: 'bird-f3-k1', objectiveId: 'bird-f3', name: 'Annual exports from BARMM', description: '', baselineValue: 10, targetValue: 40, currentValue: 10, unit: '₱B', frequency: 'annually', owner: 'MTIT', status: 'on-track' }] },
  { id: 'bird-f4', perspective: 'financial', weight: 1, objective: 'F4: Activate Green Economy Revenue', description: 'REDD+ program registration; JMC No. 2026-01 implementation; carbon market access', kpis: [{ id: 'bird-f4-k1', objectiveId: 'bird-f4', name: 'Carbon credit + PES revenue', description: '', baselineValue: 0, targetValue: 500, currentValue: 0, unit: '₱M', frequency: 'annually', owner: 'MENRE', status: 'on-track' }] },
  { id: 'bird-f5', perspective: 'financial', weight: 1, objective: 'F5: Mobilize Islamic Finance', description: 'Al-Amanah expansion; Islamic finance literacy; fintech integration', kpis: [{ id: 'bird-f5-k1', objectiveId: 'bird-f5', name: 'Islamic banking assets in BARMM', description: '', baselineValue: 2, targetValue: 20, currentValue: 2, unit: '₱B', frequency: 'annually', owner: 'BSP', status: 'on-track' }] },
  { id: 'bird-f6', perspective: 'financial', weight: 1, objective: 'F6: Attract Foreign Direct Investment', description: 'International investor missions; PFEZ promotion; investment incentives optimization', kpis: [{ id: 'bird-f6-k1', objectiveId: 'bird-f6', name: 'Foreign investment approvals', description: '', baselineValue: 0, targetValue: 3, currentValue: 0, unit: '₱B', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },

  // STAKEHOLDER PERSPECTIVE
  { id: 'bird-s1', perspective: 'stakeholder', weight: 1, objective: 'S1: Enhance Investor Satisfaction', description: 'Aftercare service improvement; investor ombudsman; regulatory stability', kpis: [{ id: 'bird-s1-k1', objectiveId: 'bird-s1', name: 'Investor satisfaction score', description: '', baselineValue: 0, targetValue: 8, currentValue: 0, unit: '/10', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },
  { id: 'bird-s2', perspective: 'stakeholder', weight: 1, objective: 'S2: Retain Investment Projects', description: 'Problem resolution mechanisms; one-stop shop; regulatory predictability', kpis: [{ id: 'bird-s2-k1', objectiveId: 'bird-s2', name: 'Investment project retention rate', description: '', baselineValue: 0, targetValue: 85, currentValue: 0, unit: '%', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },
  { id: 'bird-s3', perspective: 'stakeholder', weight: 1, objective: 'S3: Empower MSMEs through Certification', description: 'BHB MSME certification program; BHIDP implementation; capacity building', kpis: [{ id: 'bird-s3-k1', objectiveId: 'bird-s3', name: 'MSMEs with halal certification', description: '', baselineValue: 500, targetValue: 5000, currentValue: 500, unit: 'count', frequency: 'annually', owner: 'BHB', status: 'on-track' }] },
  { id: 'bird-s4', perspective: 'stakeholder', weight: 1, objective: 'S4: Reduce Poverty through Investment', description: 'Jobs-focused investment facilitation; MSME development; inclusive value chains', kpis: [{ id: 'bird-s4-k1', objectiveId: 'bird-s4', name: 'Poverty incidence (BARMM)', description: '', baselineValue: 34.8, targetValue: 20, currentValue: 34.8, unit: '%', frequency: 'annually', owner: 'PSA', status: 'on-track' }] },
  { id: 'bird-s5', perspective: 'stakeholder', weight: 1, objective: 'S5: Improve Community Access to Finance', description: 'Islamic microfinance; fintech deployment; CARD expansion; waqf activation', kpis: [{ id: 'bird-s5-k1', objectiveId: 'bird-s5', name: 'Financial inclusion rate (adults)', description: '', baselineValue: 38, targetValue: 70, currentValue: 38, unit: '%', frequency: 'annually', owner: 'BSP', status: 'on-track' }] },
  { id: 'bird-s6', perspective: 'stakeholder', weight: 1, objective: 'S6: Create Quality Employment', description: 'Labor-intensive sector prioritization; skills matching; TESDA alignment', kpis: [{ id: 'bird-s6-k1', objectiveId: 'bird-s6', name: 'BOI-registered firm jobs created', description: '', baselineValue: 2029, targetValue: 20000, currentValue: 2029, unit: 'count', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },
  { id: 'bird-s7', perspective: 'stakeholder', weight: 1, objective: 'S7: Ensure Provincial Equity', description: 'Affirmative infrastructure investment; provincial facilitation offices', kpis: [{ id: 'bird-s7-k1', objectiveId: 'bird-s7', name: 'Inter-provincial growth disparity', description: '', baselineValue: 3.9, targetValue: 1.5, currentValue: 3.9, unit: 'pp', frequency: 'annually', owner: 'BPDA', status: 'on-track' }] },

  // INTERNAL PROCESS PERSPECTIVE
  { id: 'bird-p1', perspective: 'internal_process', weight: 1, objective: 'P1: Streamline Investment Facilitation', description: 'Digital BNR system; BEGMP e-governance; one-stop shop expansion', kpis: [{ id: 'bird-p1-k1', objectiveId: 'bird-p1', name: 'Business registration time', description: '', baselineValue: 5, targetValue: 1, currentValue: 5, unit: 'days', frequency: 'monthly', owner: 'MTIT', status: 'on-track' }] },
  { id: 'bird-p2', perspective: 'internal_process', weight: 1, objective: 'P2: Accelerate Permit Processing', description: 'One-stop shop expansion to all provinces; BPLS digitalization', kpis: [{ id: 'bird-p2-k1', objectiveId: 'bird-p2', name: 'Permit processing time', description: '', baselineValue: 15, targetValue: 7, currentValue: 15, unit: 'days', frequency: 'monthly', owner: 'MTIT', status: 'on-track' }] },
  { id: 'bird-p3', perspective: 'internal_process', weight: 1, objective: 'P3: Strengthen Halal Certification', description: 'BHB capacity building; international MRA signing; QA labs', kpis: [{ id: 'bird-p3-k1', objectiveId: 'bird-p3', name: 'BHB OIC/SMIIC accreditation progress', description: '', baselineValue: 0, targetValue: 100, currentValue: 0, unit: '%', frequency: 'quarterly', owner: 'BHB', status: 'on-track' }] },
  { id: 'bird-p4', perspective: 'internal_process', weight: 1, objective: 'P4: Accelerate Infrastructure Delivery', description: 'MPW-BBOI-LGU coordination; ROW resolution; PPP frameworks', kpis: [{ id: 'bird-p4-k1', objectiveId: 'bird-p4', name: 'Infrastructure budget execution rate', description: '', baselineValue: 80, targetValue: 90, currentValue: 80, unit: '%', frequency: 'quarterly', owner: 'MPW', status: 'on-track' }] },
  { id: 'bird-p5', perspective: 'internal_process', weight: 1, objective: 'P5: Synchronize BMOA Programs', description: 'Bangsamoro Corp institutionalization; joint M&E; MOAs', kpis: [{ id: 'bird-p5-k1', objectiveId: 'bird-p5', name: 'Inter-agency coordination score', description: '', baselineValue: 5.5, targetValue: 8, currentValue: 5.5, unit: '/10', frequency: 'quarterly', owner: 'BICC', status: 'on-track' }] },
  { id: 'bird-p6', perspective: 'internal_process', weight: 1, objective: 'P6: Activate Green Economy Programs', description: 'MENRE-MILG coordination; LGU capacity building; MRV systems', kpis: [{ id: 'bird-p6-k1', objectiveId: 'bird-p6', name: 'JMC No. 2026-01 implementation rate', description: '', baselineValue: 0, targetValue: 100, currentValue: 0, unit: '%', frequency: 'quarterly', owner: 'MENRE', status: 'on-track' }] },
  { id: 'bird-p7', perspective: 'internal_process', weight: 1, objective: 'P7: Ensure Climate Resilience', description: 'Climate-resilient design standards; early warning systems', kpis: [{ id: 'bird-p7-k1', objectiveId: 'bird-p7', name: 'Climate-risk screening coverage', description: '', baselineValue: 0, targetValue: 100, currentValue: 0, unit: '%', frequency: 'quarterly', owner: 'MENRE', status: 'on-track' }] },

  // LEARNING & GROWTH PERSPECTIVE
  { id: 'bird-l1', perspective: 'learning_growth', weight: 1, objective: 'L1: Build Halal Expertise', description: 'Halal Training Academy; BHB-SMIIC partnership; international secondments', kpis: [{ id: 'bird-l1-k1', objectiveId: 'bird-l1', name: 'Halal certification officers trained', description: '', baselineValue: 50, targetValue: 100, currentValue: 50, unit: 'count', frequency: 'annually', owner: 'BHB', status: 'on-track' }] },
  { id: 'bird-l2', perspective: 'learning_growth', weight: 1, objective: 'L2: Develop Islamic Finance Professionals', description: 'BSP-aligned scholarship program; professional certification; IsDB training', kpis: [{ id: 'bird-l2-k1', objectiveId: 'bird-l2', name: 'Islamic finance professionals in BARMM', description: '', baselineValue: 20, targetValue: 50, currentValue: 20, unit: 'count', frequency: 'annually', owner: 'BSP', status: 'on-track' }] },
  { id: 'bird-l3', perspective: 'learning_growth', weight: 1, objective: 'L3: Strengthen IPA Capacity', description: 'Capacity building programs; BBOI-MTIT HRD plan; performance incentives', kpis: [{ id: 'bird-l3-k1', objectiveId: 'bird-l3', name: 'IPA staff with certification/training', description: '', baselineValue: 50, targetValue: 80, currentValue: 50, unit: '%', frequency: 'annually', owner: 'BBOI', status: 'on-track' }] },
  { id: 'bird-l4', perspective: 'learning_growth', weight: 1, objective: 'L4: Foster Digital Innovation', description: 'BEGMP implementation; DICT partnership; innovation labs', kpis: [{ id: 'bird-l4-k1', objectiveId: 'bird-l4', name: 'Digital services launched (BEGMP)', description: '', baselineValue: 5, targetValue: 20, currentValue: 5, unit: 'count', frequency: 'quarterly', owner: 'MICT', status: 'on-track' }] },
  { id: 'bird-l5', perspective: 'learning_growth', weight: 1, objective: 'L5: Improve Functional Literacy', description: 'TESDA programs; DepEd alternative learning; adult literacy campaigns', kpis: [{ id: 'bird-l5-k1', objectiveId: 'bird-l5', name: 'BARMM functional literacy rate', description: '', baselineValue: 59.3, targetValue: 75, currentValue: 59.3, unit: '%', frequency: 'annually', owner: 'DepEd', status: 'on-track' }] },
  { id: 'bird-l6', perspective: 'learning_growth', weight: 1, objective: 'L6: Develop Green Economy Expertise', description: 'MENRE-DILG training program; JMC implementation; carbon accounting', kpis: [{ id: 'bird-l6-k1', objectiveId: 'bird-l6', name: 'LGU staff trained on carbon/PES', description: '', baselineValue: 0, targetValue: 200, currentValue: 0, unit: 'count', frequency: 'annually', owner: 'MENRE', status: 'on-track' }] },
  { id: 'bird-l7', perspective: 'learning_growth', weight: 1, objective: 'L7: Align TESDA with Industry', description: 'TESDA-industry councils; skills forecasting; curriculum development', kpis: [{ id: 'bird-l7-k1', objectiveId: 'bird-l7', name: 'Training regulations developed', description: '', baselineValue: 0, targetValue: 15, currentValue: 0, unit: 'TRs', frequency: 'annually', owner: 'TESDA', status: 'on-track' }] },
];

const calculateProgress = (kpi: KPI): number => {
  if (kpi.targetValue === kpi.baselineValue) return 0;
  const progress = ((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const STATUS_COLORS = {
  'on-track': 'bg-emerald-100 text-emerald-700',
  'at-risk': 'bg-amber-100 text-amber-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const StatusBadge: React.FC<{ status: KPI['status']; children: React.ReactNode }> = ({ status, children }) => (
  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", STATUS_COLORS[status])}>
    {children}
  </span>
);

const ProgressMeter: React.FC<{ value: number }> = ({ value }) => {
  const getColor = () => {
    if (value >= 100) return 'bg-emerald-500';
    if (value >= 70) return 'bg-cyan-500';
    if (value >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{Math.round(value)}%</span>
            <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", getColor())}
                style={{ width: `${Math.max(value, 0)}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] z-50">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Progress Tracking</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Track achievement against targets</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const KPIRow: React.FC<{
  kpi: KPI;
  onUpdate: (updates: Partial<KPI>) => void;
  onRemove: () => void;
  isTemplate?: boolean;
}> = ({ kpi, onUpdate, onRemove, isTemplate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(kpi);
  const progress = calculateProgress(kpi);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(kpi);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-cyan-50 animate-in fade-in slide-in-from-top-2">
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="KPI name"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.baselineValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, baselineValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.targetValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.currentValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.unit}
            onChange={(e) => setEditData((prev) => ({ ...prev, unit: e.target.value }))}
            className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={editData.status}
            onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value as KPI['status'] }))}
            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.owner}
            onChange={(e) => setEditData((prev) => ({ ...prev, owner: e.target.value }))}
            className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Owner"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={handleCancel} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50 dark:bg-slate-900 group transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{kpi.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{kpi.baselineValue}</td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{kpi.targetValue}</td>
      <td className="px-4 py-3">
        <ProgressMeter value={progress} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{kpi.unit}</td>
      <td className="px-4 py-3">
        <StatusBadge status={kpi.status}>{kpi.status.replace('-', ' ')}</StatusBadge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{kpi.owner || 'Unassigned'}</td>
      <td className="px-4 py-3">
        {!isTemplate && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

const ObjectiveCard: React.FC<{
  objective: BSCObjective;
  config: typeof perspectiveConfig.financial;
  linkedStrategies: StrategicOption[];
  onUpdate: (updates: Partial<BSCObjective>) => void;
  onRemove: () => void;
  onAddKPI: (kpi: Omit<KPI, 'id' | 'objectiveId'>) => void;
  onUpdateKPI: (kpiId: string, updates: Partial<KPI>) => void;
  onRemoveKPI: (kpiId: string) => void;
  plan: StrategicPlan;
  isTemplate?: boolean;
}> = ({ objective, config, linkedStrategies, onUpdate, onRemove, onAddKPI, onUpdateKPI, onRemoveKPI, plan, isTemplate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [editObjectiveData, setEditObjectiveData] = useState(objective);
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    baselineValue: 0,
    targetValue: 0,
    currentValue: 0,
    unit: '',
    frequency: 'monthly' as const,
    owner: '',
    status: 'on-track' as KPI['status'],
  });
  const [isGeneratingKPIs, setIsGeneratingKPIs] = useState(false);

  const averageProgress = objective.kpis.length > 0
    ? objective.kpis.reduce((sum, kpi) => sum + calculateProgress(kpi), 0) / objective.kpis.length
    : 0;

  const handleSaveObjective = () => {
    onUpdate({ objective: editObjectiveData.objective, description: editObjectiveData.description });
    setIsEditingObjective(false);
  };

  const handleAddKPI = () => {
    if (!newKPI.name.trim()) return;
    onAddKPI(newKPI);
    setNewKPI({
      name: '', description: '', baselineValue: 0, targetValue: 0, currentValue: 0,
      unit: '', frequency: 'monthly', owner: '', status: 'on-track',
    });
    setIsAddingKPI(false);
  };

  const handleGenerateKPIs = async () => {
    setIsGeneratingKPIs(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(AI_ASSISTANT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          action: 'generate_kpis',
          data: {
            perspective: config.label,
            objective: objective.objective,
            context: objective.description,
          },
          plan: plan,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.kpis && Array.isArray(result.data.kpis)) {
        result.data.kpis.forEach((kpi: any) => {
          onAddKPI({
            name: kpi.name,
            description: kpi.description || '',
            baselineValue: kpi.baseline_value || kpi.baselineValue || 0,
            targetValue: kpi.target_value || kpi.targetValue || 0,
            currentValue: kpi.baseline_value || kpi.baselineValue || 0,
            unit: kpi.unit || '',
            frequency: kpi.frequency || 'monthly',
            owner: '',
            status: 'on-track',
          });
        });
      }
    } catch (error) {
      console.error('Failed to generate KPIs:', error);
    } finally {
      setIsGeneratingKPIs(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-white dark:bg-slate-800/60 rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        config.border
      )}>
        <div
          className={cn(`${config.lightBg} px-4 py-3 flex items-center gap-3 cursor-pointer`)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
          <Target className={`w-5 h-5 ${config.textColor}`} />
          <div className="flex-1 min-w-0">
            {isEditingObjective && !isTemplate ? (
              <input
                type="text"
                value={editObjectiveData.objective}
                onChange={(e) => setEditObjectiveData((prev) => ({ ...prev, objective: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm font-medium border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{objective.objective}</h4>
                {!isTemplate && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditingObjective(true); }}
                    className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            {isEditingObjective && !isTemplate ? (
              <textarea
                value={editObjectiveData.description}
                onChange={(e) => setEditObjectiveData((prev) => ({ ...prev, description: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mt-1"
                rows={1}
              />
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{objective.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {linkedStrategies.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                <Link2 className="w-3 h-3" />
                <span className="font-medium">{linkedStrategies.length}</span>
              </div>
            )}
            {averageProgress > 0 && (
              <div className="hidden md:flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-cyan-600" />
                <span className="font-medium">{Math.round(averageProgress)}% avg</span>
              </div>
            )}
            <span className="text-sm text-slate-500">{objective.kpis.length} KPIs</span>
            {!isTemplate && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {linkedStrategies.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <h5 className="text-sm font-semibold text-purple-800">Supporting Strategies</h5>
                </div>
                <div className="space-y-1">
                  {linkedStrategies.map((strategy) => (
                    <div key={strategy.id} className="text-xs text-purple-700 flex items-start gap-2">
                      <span className="px-1.5 py-0.5 bg-purple-200 rounded text-[10px] font-bold mt-0.5">
                        {strategy.optionType}
                      </span>
                      <span className="flex-1">{strategy.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {objective.kpis.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">KPI</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Baseline</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Current</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objective.kpis.map((kpi) => (
                      <KPIRow
                        key={kpi.id}
                        kpi={kpi}
                        onUpdate={(updates) => onUpdateKPI(kpi.id, updates)}
                        onRemove={() => onRemoveKPI(kpi.id)}
                        isTemplate={isTemplate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isTemplate && (
              <div className="flex flex-col sm:flex-row gap-2 pb-4">
                {!isAddingKPI && (
                  <>
                    <button
                      onClick={() => setIsAddingKPI(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add KPI
                    </button>
                    <button
                      onClick={handleGenerateKPIs}
                      disabled={isGeneratingKPIs}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingKPIs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI Suggest KPIs
                    </button>
                  </>
                )}
              </div>
            )}

            {isAddingKPI && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">KPI Name *</label>
                    <input
                      type="text"
                      value={newKPI.name}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., Stakeholder Satisfaction Rate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Baseline</label>
                    <input
                      type="number"
                      value={newKPI.baselineValue}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, baselineValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Target</label>
                    <input
                      type="number"
                      value={newKPI.targetValue}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                    <input
                      type="text"
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="% or $"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                    <select
                      value={newKPI.frequency}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Owner</label>
                    <input
                      type="text"
                      value={newKPI.owner}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, owner: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., CFO"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setIsAddingKPI(false)} className="px-4 py-2 text-sm text-slate-600 rounded-lg">Cancel</button>
                  <button
                    onClick={handleAddKPI}
                    disabled={!newKPI.name.trim()}
                    className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                  >
                    Add KPI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

const BalancedScorecard: React.FC<BalancedScorecardProps> = ({
  plan,
  onAddObjective,
  onUpdateObjective,
  onRemoveObjective,
  onAddKPI,
  onUpdateKPI,
  onRemoveKPI,
}) => {
  const [newObjective, setNewObjective] = useState<{
    perspective: BSCObjective['perspective'] | null;
    objective: string;
    description: string;
  }>({ perspective: null, objective: '', description: '' });
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);

  // ─── NEW: AI WIDGET STATE & LOGIC ────────────────────────────────────────────
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: string, content: string}[]>([
    {
      role: 'assistant',
      content: `Hello! I'm the **BIRD AI Strategist**, specialized in **KPI Benchmarking (Chapter 5)** and **Balanced Scorecard Management (Chapter 6)** for the Bangsamoro Investment Roadmap 2026-2035.\n\nI can help you:\n• Design SMART KPIs aligned with OIC/SMIIC, ESG, and PDP benchmarks.\n• Map causal pathways across the 4 BSC perspectives (Financial, Stakeholder, Internal Process, Learning & Growth).\n• Calibrate targets across the 5 BEIE clusters (Foundations, Transformers, Enablers, Connectors, Financiers).\n\nHow can I assist your BSC strategy today?`
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const userMsg = { role: 'user', content: aiInput };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiLoading(true);

    try {
      // Inject Chapter 5 & 6 context into the first user message to guide the AI
      const historyWithCtx = newMessages.map((m, idx) => {
        if (idx === 1 && m.role === 'user') { 
           return { role: 'user', content: `[CONTEXT: BIRD 2026-2035 CHAPTER 5 & 6]\n${CHAPTER_5_6_CONTEXT}\n\n[USER QUESTION]: ${m.content}` };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch(AI_ASSISTANT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          data: {
            messages: historyWithCtx.slice(0, -1),
            message: historyWithCtx[historyWithCtx.length - 1].content,
            activeView: 'BalancedScorecard'
          },
          plan: plan
        }),
      });

      const result = await response.json();
      const reply = result?.data?.reply || result?.data?.markdown || 'I could not process that request.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a connection error. Please try again.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };
  // ─── END NEW AI WIDGET LOGIC ─────────────────────────────────────────────────

  const isPlanEmpty = !plan.objectives || plan.objectives.length === 0;
  const displayObjectives = isPlanEmpty ? BIRD_BSC_TEMPLATE_OBJECTS : (plan.objectives || []);

  // ─── EDGE FUNCTION INTEGRATIONS ─────────────────────────────────────────────
  
  // 1. Auto-Sync to Cloud (Debounced)
  useEffect(() => {
    const syncPlan = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch(SYNC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        });
      } catch (error) {
        console.error('Failed to sync plan to cloud:', error);
      }
    };

    const timer = setTimeout(syncPlan, 2000); // Debounce by 2 seconds
    return () => clearTimeout(timer);
  }, [plan]);

  // 2. Email Notification for KPI Alerts
  const sendKpiAlertEmail = async (kpi: KPI, objectiveName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      await fetch(EMAIL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'kpi_alert',
          user_id: session.user.id,
          data: {
            kpi_name: kpi.name,
            current_value: kpi.currentValue,
            target: kpi.targetValue,
            plan_name: plan.name,
            plan_id: plan.id,
            objective_name: objectiveName,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send KPI alert email:', error);
    }
  };

  // Wrap mutation handlers to trigger emails and syncs
  const handleUpdateKPI = (objectiveId: string, kpiId: string, updates: Partial<KPI>) => {
    const objective = plan.objectives?.find(o => o.id === objectiveId);
    const kpi = objective?.kpis?.find(k => k.id === kpiId);
    
    onUpdateKPI(objectiveId, kpiId, updates);
    
    // Trigger email if status degrades to at-risk or delayed
    if (
      updates.status && 
      (updates.status === 'at-risk' || updates.status === 'delayed') && 
      kpi && 
      kpi.status !== updates.status
    ) {
      sendKpiAlertEmail({ ...kpi, ...updates } as KPI, objective?.objective || '');
    }
  };

  // ─── AI GENERATION & TEMPLATE LOADING ───────────────────────────────────────

  const handleLoadBIRDTemplate = () => {
    BIRD_BSC_TEMPLATE_OBJECTS.forEach(obj => {
      const kpiDetails = obj.kpis.map(k => `- ${k.name}: Baseline ${k.baselineValue} ${k.unit}, Target ${k.targetValue} ${k.unit}`).join('\n');
      onAddObjective({
        perspective: obj.perspective,
        objective: obj.objective,
        description: `${obj.description}\n\nKPIs:\n${kpiDetails}`,
        weight: obj.weight,
      });
    });
  };

  const selectedStrategies = useMemo(() => 
    (plan.strategicOptions || []).filter(opt => opt.selected),
    [plan.strategicOptions]
  );

  const getLinkedStrategies = (objective: BSCObjective): StrategicOption[] => {
    return selectedStrategies.filter(strategy => {
      const objText = `${objective.objective} ${objective.description}`.toLowerCase();
      const stratText = `${strategy.title} ${strategy.description}`.toLowerCase();
      const objWords = objText.split(/\s+/);
      const stratWords = stratText.split(/\s+/);
      const commonWords = objWords.filter(w => w.length > 3 && stratWords.includes(w));
      return commonWords.length > 0;
    });
  };

  const handleAddObjective = () => {
    if (!newObjective.perspective || !newObjective.objective.trim()) return;
    onAddObjective({
      perspective: newObjective.perspective,
      objective: newObjective.objective.trim(),
      description: newObjective.description.trim(),
      weight: 1,
    });
    setNewObjective({ perspective: null, objective: '', description: '' });
  };

  const handleGenerateObjectives = async () => {
    setIsGeneratingObjectives(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(AI_ASSISTANT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          action: 'generate_objectives',
          data: {
            planStrategicIntent: plan.strategicIntent,
            swotSummary: plan.swotItems || [],
            selectedStrategies: selectedStrategies.map(s => ({ title: s.title, description: s.description })),
          },
          plan: plan,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.objectives && Array.isArray(result.data.objectives)) {
        result.data.objectives.forEach((obj: any) => {
          onAddObjective({
            perspective: obj.perspective as BSCObjective['perspective'],
            objective: obj.objective,
            description: obj.description || '',
            weight: obj.weight || 1,
          });
        });
      }
    } catch (error) {
      console.error('Failed to generate objectives:', error);
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  const getObjectivesByPerspective = (perspective: BSCObjective['perspective']) =>
    displayObjectives.filter((obj) => obj.perspective === perspective);

  const totalKPICount = displayObjectives.reduce((sum, obj) => sum + (obj.kpis?.length || 0), 0);
  const avgProgress = displayObjectives.reduce((sum, obj) => 
    sum + ((obj.kpis?.length || 0) > 0 
      ? obj.kpis.reduce((kSum, kpi) => kSum + calculateProgress(kpi), 0) / obj.kpis.length 
      : 0), 0) / Math.max(displayObjectives.length, 1);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Balanced Scorecard</h1>
            <p className="text-slate-500 dark:text-slate-400">Define strategic objectives and measurable KPIs across four perspectives</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-cyan-600" />
                <span className="text-slate-600">
                  <span className="font-medium text-cyan-600">{displayObjectives.length}</span> objectives
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                <span className="text-slate-600">
                  <span className="font-medium text-cyan-600">{totalKPICount}</span> KPIs
                </span>
              </div>
              {avgProgress > 0 && (
                <>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Avg:</span>
                    <span className="font-medium text-cyan-600">{Math.round(avgProgress)}%</span>
                  </div>
                </>
              )}
            </div>
            {!isPlanEmpty && (
              <button
                onClick={handleGenerateObjectives}
                disabled={isGeneratingObjectives}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGeneratingObjectives ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI Generate Objectives</>
                )}
              </button>
            )}
          </div>
        </div>

        {isPlanEmpty && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cloud className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-800 mb-1">BIRD 2035 Roadmap Template Loaded</h4>
                <p className="text-sm text-emerald-700">
                  Pre-populated with 27 strategic objectives and KPIs across all 4 perspectives from Chapter 6 of the Bangsamoro Investment Roadmap. 
                  Click below to apply this template to your plan.
                </p>
              </div>
            </div>
            <button
              onClick={handleLoadBIRDTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Apply Template to Plan
            </button>
          </div>
        )}

        {selectedStrategies.length > 0 && !isPlanEmpty && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Link2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-800 mb-1">
                {selectedStrategies.length} Selected Strateg{selectedStrategies.length === 1 ? 'y' : 'ies'} Available
              </h4>
              <p className="text-sm text-purple-700">
                Your objectives will be automatically linked to relevant strategies from the Strategy Matrix.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {(Object.entries(perspectiveConfig) as [BSCObjective['perspective'], typeof perspectiveConfig.financial][]).map(
            ([perspective, config]) => {
              const Icon = config.icon;
              const objectives = getObjectivesByPerspective(perspective);

              return (
                <div key={perspective} className="space-y-4">
                  <div className={cn(`bg-gradient-to-r ${config.bgGradient} rounded-xl px-6 py-4 shadow-sm`)}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-white" />
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-white">{config.label}</h2>
                        <p className="text-sm text-white/70">{config.description}</p>
                      </div>
                      <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm text-white backdrop-blur-sm">
                        {objectives.length} objective{objectives.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-4">
                    {objectives.map((objective) => (
                      <ObjectiveCard
                        key={objective.id}
                        objective={objective}
                        config={config}
                        linkedStrategies={getLinkedStrategies(objective)}
                        onUpdate={(updates) => onUpdateObjective(objective.id, updates)}
                        onRemove={() => onRemoveObjective(objective.id)}
                        onAddKPI={(kpi) => onAddKPI(objective.id, kpi)}
                        onUpdateKPI={(kpiId, updates) => handleUpdateKPI(objective.id, kpiId, updates)}
                        onRemoveKPI={(kpiId) => onRemoveKPI(objective.id, kpiId)}
                        plan={plan}
                        isTemplate={isPlanEmpty}
                      />
                    ))}

                    {!isPlanEmpty && (
                      newObjective.perspective === perspective ? (
                        <div className={cn("bg-white dark:bg-slate-800/60 rounded-xl border p-4 space-y-3 animate-in fade-in slide-in-from-top-2", config.border)}>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Strategic Objective *</label>
                            <input
                              type="text"
                              value={newObjective.objective}
                              onChange={(e) => setNewObjective((prev) => ({ ...prev, objective: e.target.value }))}
                              className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              placeholder={config.placeholder}
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Description / Context</label>
                            <textarea
                              value={newObjective.description}
                              onChange={(e) => setNewObjective((prev) => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                              rows={2}
                              placeholder="Provide context about why this objective is important..."
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setNewObjective({ perspective: null, objective: '', description: '' })}
                              className="px-4 py-2 text-sm text-slate-600 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddObjective}
                              disabled={!newObjective.objective.trim()}
                              className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                            >
                              Add Objective
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewObjective({ perspective, objective: '', description: '' })}
                          className={cn(
                            "w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors flex items-center justify-center gap-2",
                            config.lightBg
                          )}
                        >
                          <Plus className="w-4 h-4" />
                          Add {config.label} Objective
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ─── NEW: FLOATING AI STRATEGIST WIDGET ────────────────────────────────── */}
      <AnimatePresence>
        {!showAIChat && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center border border-emerald-400/50"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowAIChat(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 320 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[#0B1426] border-l border-emerald-500/30 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-[#0B1426]/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-wide">BIRD AI Strategist</h3>
                    <p className="text-emerald-400 text-xs font-medium">KPI & BSC Expert (Ch. 5 & 6)</p>
                  </div>
                </div>
                <button onClick={() => setShowAIChat(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-emerald-800">
                {aiMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-600 to-cyan-700 text-white rounded-br-sm shadow-lg'
                        : 'bg-[#131F38] text-slate-200 border border-emerald-500/20 rounded-bl-sm'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-300">{part}</strong> : part)}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isAiLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-[#131F38] border border-emerald-500/20 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-400">Analyzing BSC framework...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-emerald-500/20 bg-[#0B1426]/90 backdrop-blur-md">
                <div className="flex gap-2 items-end bg-[#131F38] border border-emerald-500/30 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAiMessage();
                      }
                    }}
                    placeholder="Ask about BSC perspectives, KPI benchmarks..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
                    style={{ maxHeight: '100px' }}
                  />
                  <button
                    onClick={handleSendAiMessage}
                    disabled={!aiInput.trim() || isAiLoading}
                    className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/30 transition flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">Powered by BIRD AI • Aligned with MTIT-BARMM Strategic Plan</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ─── END FLOATING AI WIDGET ────────────────────────────────────────────── */}
    </TooltipProvider>
  );
};

export default BalancedScorecard;