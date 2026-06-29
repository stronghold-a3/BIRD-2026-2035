import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Target,
  BarChart3,
  FolderKanban,
  Eye,
  Network,
  BrainCircuit,
  TrendingUp,
  Info,
  Clock,
  GitBranch,
  Sparkles,
  Loader2,
  Upload,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicPlan, CLDSnapshot } from '@/lib/strategicPlanStore';
import { supabase } from '@/lib/supabase';

// Edge Function URLs
const AI_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/ai-strategy-assistant';
const SYNC_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/strategic-planner-sync';

interface PlanExportProps {
  plan: StrategicPlan;
}

// Systems Archetypes Reference Data (Aligned with BIRD 2026-2035 Framework)
const ARCHETYPE_DATA: Record<string, any> = {
  limits_to_growth: {
    name: 'Limits to Growth',
    description: 'Rapid investment growth encounters balancing pressures from infrastructure bottlenecks, skills shortages, and environmental limits.',
    leverage_points: ['Front-load ZBIP and farm-to-market roads', 'Scale literacy/TVET alignment', 'Expand institutional capacity ahead of demand'],
    diagram_note: 'Reinforcing loop (R1) hits balancing loop (B2) capacity constraints.',
  },
  fixes_that_fail: {
    name: 'Fixes that Fail',
    description: 'Short-term relief incentives without institutional capacity lead to investor flight and systemic weakness.',
    leverage_points: ['Pair incentives with capacity milestones', 'Implement monitoring & transparency', 'System-wide governance reforms'],
    diagram_note: 'Balancing loop (B1) provides short-term relief, Reinforcing loop (R2) creates delayed negative consequences.',
  },
  tragedy_of_commons: {
    name: 'Tragedy of the Commons',
    description: 'Fragmented resource governance depletes watersheds, forests, and grid capacity.',
    leverage_points: ['Enact Forestry Code & JMC 2026-01', 'Institutionalize co-management frameworks', 'Deploy transparent monitoring systems'],
    diagram_note: 'Multiple reinforcing loops (R1, R2) competing for shared resource, outpacing balancing mechanisms (B5, B6).',
  },
  success_to_the_successful: {
    name: 'Success to the Successful',
    description: 'Mainland provinces outpace archipelagic areas, deepening regional inequality.',
    leverage_points: ['Affirmative investment policies', 'Provincial equity targets', 'Satellite BBOI offices in Sulu, Tawi-Tawi, Basilan'],
    diagram_note: 'Initial advantages compound, attracting more resources while lagging provinces fall further behind.',
  },
  growth_and_underinvestment: {
    name: 'Growth and Underinvestment',
    description: 'Facilitation capacity lags behind approval surges, creating bottlenecks and growth plateaus.',
    leverage_points: ['Expand BHB certifiers & digital desks', 'Fast-track procurement & ROW', 'Build 20% reserve capacity'],
    diagram_note: 'Demand grows, but perceived need to invest is delayed by perceived cost/time, reducing performance.',
  },
  shifting_the_burden: {
    name: 'Shifting the Burden',
    description: 'Dependency on symptomatic solutions (ad hoc incentives) prevents fundamental structural reforms.',
    leverage_points: ['Shift mindset to building systems', 'Pair incentives with structural reform', 'Measure success by institutional strengthening'],
    diagram_note: 'Symptomatic solution relieves pressure, eroding long-term capacity to address root causes.',
  },
  drifting_goals: {
    name: 'Drifting Goals',
    description: 'Ambitious development targets are gradually diluted when performance gaps persist.',
    leverage_points: ['Maintain non-negotiable targets', 'Deploy provincial KPI dashboards', 'Establish automatic corrective triggers'],
    diagram_note: 'Performance gap leads to lowering the goal, which reduces the pressure to act.',
  },
  escalation: {
    name: 'Escalation',
    description: 'Competitive spirals in socio-political (rido) and economic-administrative domains divert resources.',
    leverage_points: ['Shift to positive-sum governance', 'Transparent resource allocation', 'Conflict de-escalation mechanisms'],
    diagram_note: 'Threat to A leads to Activity by A, perceived as Threat to B, leading to Activity by B.',
  },
  big_man: {
    name: 'Big Man (Patronage)',
    description: 'Concentration of power perpetuates patronage politics, clan rivalries, and resource depletion.',
    leverage_points: ['Redefine governance to "power with"', 'Merit-based civil service', 'Transparent procurement & feedback'],
    diagram_note: 'Domination fosters patron-client psychology, diverting resources and eroding governance.',
  },
};

// Helper to find archetype data regardless of key format (snake_case, camelCase, etc.)
const getArchetypeData = (id: string) => {
  if (ARCHETYPE_DATA[id]) return ARCHETYPE_DATA[id];
  const normalized = id.toLowerCase().replace(/[\s-]/g, '_');
  if (ARCHETYPE_DATA[normalized]) return ARCHETYPE_DATA[normalized];
  const camelToSnake = id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  if (ARCHETYPE_DATA[camelToSnake]) return ARCHETYPE_DATA[camelToSnake];
  return null;
};

// Calculate BIRD SWOT Mathematical Formulations
const calculateSwotScore = (category: string, impact: number, likelihood: number) => {
  if (category === 'strength') return `RI: ${((impact * likelihood) / 5).toFixed(2)}`;
  if (category === 'opportunity') return `RI: ${Math.sqrt(impact * likelihood).toFixed(2)}`;
  if (category === 'weakness') return `Risk: ${(impact * likelihood).toFixed(2)}`;
  if (category === 'threat') return `VI: ${((impact * impact * likelihood) / 25).toFixed(2)}`;
  return '';
};

const PlanExport: React.FC<PlanExportProps> = ({ plan }) => {
  const [editablePlan, setEditablePlan] = useState<StrategicPlan>(plan);
  const [selectedSections, setSelectedSections] = useState({
    coverPage: true,
    executiveSummary: true,
    swotAnalysis: true,
    strategyMatrix: true,
    balancedScorecard: true,
    papsOverview: true,
    systemsThinking: true,
    appendix: true,
  });
  const [isGenerating, setIsGenerating] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [appendixFiles, setAppendixFiles] = useState<File[]>([]);

  useEffect(() => {
    setEditablePlan(plan);
  }, [plan]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAppendixFiles(prev => [...prev, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setAppendixFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sections = [
    { id: 'coverPage', label: 'Cover Page', icon: FileText, description: 'Title, organization, and planning period' },
    { id: 'executiveSummary', label: 'Executive Summary', icon: Target, description: 'Vision, mission, and strategic intent' },
    { id: 'swotAnalysis', label: 'SWOT Analysis', icon: BarChart3, description: 'Environmental analysis with impact scores' },
    { id: 'systemsThinking', label: 'Systems Thinking', icon: Network, description: 'Causal Loops & Archetypes' },
    { id: 'strategyMatrix', label: 'Strategy Matrix', icon: CheckCircle2, description: 'SO/ST/WO/WT strategic options' },
    { id: 'balancedScorecard', label: 'Balanced Scorecard', icon: Target, description: 'Objectives and KPIs by perspective' },
    { id: 'papsOverview', label: 'PAPs Overview', icon: FolderKanban, description: 'Programs, activities, and projects' },
    { id: 'appendix', label: 'Appendix', icon: FileSpreadsheet, description: 'Upload detailed data tables and charts' },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev],
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setEditablePlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getActiveSnapshotInfo = (): { snapshot?: CLDSnapshot; isActiveFromCanvas: boolean } => {
    const snapshot = plan.activeCLDSnapshotId 
      ? plan.cldSnapshots?.find(s => s.id === plan.activeCLDSnapshotId)
      : undefined;
    
    return {
      snapshot,
      isActiveFromCanvas: plan.activeCLDSnapshotId === undefined,
    };
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'xlsx') => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const content = generateExportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editablePlan.name.replace(/\s+/g, '_')}_Strategic_Plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
  };

  const getCycleTypeName = (polarity: '+' | '-' | 'positive' | 'negative'): string => {
    if (polarity === '+' || polarity === 'positive') return 'Positive (Reinforcing)';
    if (polarity === '-' || polarity === 'negative') return 'Negative (Balancing)';
    return polarity.toString();
  };

  const generateExportContent = () => {
    let content = '';
    const p = editablePlan;
    const { snapshot, isActiveFromCanvas } = getActiveSnapshotInfo();

    if (selectedSections.coverPage) {
      content += `${'='.repeat(60)}\n`;
      content += `STRATEGIC PLAN\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += `${p.name}\n`;
      content += `${p.organization}\n\n`;
      content += `Planning Period: ${p.planningPeriodStart || '2026'} to ${p.planningPeriodEnd || '2035'}\n`;
      content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    }

    if (selectedSections.executiveSummary) {
      content += `${'='.repeat(60)}\n`;
      content += `EXECUTIVE SUMMARY\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += `VISION:\n${p.vision || 'Not defined'}\n\n`;
      content += `MISSION:\n${p.mission || 'Not defined'}\n\n`;
      content += `STRATEGIC INTENT:\n${p.strategicIntent || 'Not defined'}\n\n`;
    }

    if (selectedSections.swotAnalysis) {
      content += `${'='.repeat(60)}\n`;
      content += `SWOT ANALYSIS (Quantified)\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      ['strength', 'weakness', 'opportunity', 'threat'].forEach((category) => {
        const items = p.swotItems.filter((i) => i.category === category);
        content += `${category.toUpperCase()}S (${items.length}):\n`;
        items.forEach((item, idx) => {
          const score = calculateSwotScore(item.category, item.impactScore, item.likelihoodScore);
          content += `  ${idx + 1}. ${item.description}\n`;
          content += `     Impact: ${item.impactScore}/5, Likelihood: ${item.likelihoodScore}/5 | ${score}\n`;
        });
        content += '\n';
      });
    }

    if (selectedSections.systemsThinking) {
      content += `${'='.repeat(60)}\n`;
      content += `SYSTEMS THINKING ANALYSIS\n`;
      content += `${'='.repeat(60)}\n\n`;

      content += `CURRENT CLD STATE:\n`;
      if (snapshot) {
        content += `  ✓ Loaded from Snapshot: "${snapshot.label}"\n`;
        content += `  Timestamp: ${new Date(snapshot.createdAt).toLocaleString()}\n`;
        content += `  Nodes in Snapshot: ${snapshot.nodes.length}\n`;
        content += `  Links in Snapshot: ${snapshot.links.length}\n`;
      } else if (isActiveFromCanvas) {
        content += `  ⚠ Current Canvas State (Not Saved as Snapshot)\n`;
      } else {
        content += `  ℹ No CLD data available\n`;
      }
      content += `\n`;

      if (p.cldNodes && p.cldNodes.length > 0) {
        content += `CAUSAL LOOP DIAGRAM NODES (${p.cldNodes.length}):\n`;
        p.cldNodes.forEach((node, idx) => {
          content += `  ${idx + 1}. ${node.label} (Type: ${node.type || 'variable'})\n`;
        });
        content += '\n';
      }

      if (p.cldLinks && p.cldLinks.length > 0) {
        content += `CAUSAL LOOP LINKS (${p.cldLinks.length}):\n`;
        p.cldLinks.forEach((link, idx) => {
          content += `  ${idx + 1}. ${link.from} → ${link.to}\n`;
          content += `     Polarity: ${getCycleTypeName(link.direction || link.polarity)}\n`;
          if (link.delay && link.delay > 0) content += `     Delay: ${link.delay} time units\n`;
        });
        content += '\n';
      }

      if (p.appliedArchetypes && p.appliedArchetypes.length > 0) {
        content += `IDENTIFIED SYSTEMS ARCHETYPES (${p.appliedArchetypes.length}):\n`;
        p.appliedArchetypes.forEach((archetypeId, idx) => {
          const archetype = getArchetypeData(archetypeId);
          if (archetype) {
            content += `  ${idx + 1}. ${archetype.name}\n`;
            content += `     Description: ${archetype.description}\n`;
            content += `     Leverage Points: ${archetype.leverage_points.join(', ')}\n\n`;
          }
        });
      }
    }

    if (selectedSections.strategyMatrix) {
      content += `${'='.repeat(60)}\n`;
      content += `STRATEGY MATRIX (TOWS)\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      ['SO', 'ST', 'WO', 'WT'].forEach((type) => {
        const options = p.strategicOptions.filter((o) => o.optionType === type);
        content += `${type} STRATEGIES (${options.length}):\n`;
        options.forEach((opt, idx) => {
          content += `  ${idx + 1}. ${opt.title}${opt.selected ? ' [SELECTED]' : ''}\n`;
          content += `     ${opt.description}\n`;
          content += `     Priority: ${opt.priorityScore}/5, Feasibility: ${opt.feasibilityScore}/5\n`;
        });
        content += '\n';
      });
    }

    if (selectedSections.balancedScorecard) {
      content += `${'='.repeat(60)}\n`;
      content += `BALANCED SCORECARD\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      const perspectiveLabels: Record<string, string> = {
        financial: 'FINANCIAL PERSPECTIVE',
        customer: 'STAKEHOLDER PERSPECTIVE',
        internal_process: 'INTERNAL PROCESS PERSPECTIVE',
        learning_growth: 'LEARNING & GROWTH PERSPECTIVE'
      };

      const perspectives = ['financial', 'stakeholder', 'internal_process', 'learning_growth'];
      perspectives.forEach((perspective) => {
        const objectives = p.objectives.filter((o) => o.perspective === perspective);
        content += `${perspectiveLabels[perspective]}:\n`;
        objectives.forEach((obj) => {
          content += `  Objective: ${obj.objective}\n`;
          obj.kpis.forEach((kpi) => {
            content += `    - ${kpi.name}: ${kpi.currentValue} ${kpi.unit} (Target: ${kpi.targetValue} ${kpi.unit})\n`;
          });
        });
        content += '\n';
      });
    }

    if (selectedSections.papsOverview) {
      content += `${'='.repeat(60)}\n`;
      content += `PROGRAMS, ACTIVITIES & PROJECTS (PAPs)\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      const totalBudget = p.paps.reduce((sum, pap) => sum + pap.budget, 0);
      const totalSpent = p.paps.reduce((sum, pap) => sum + pap.spent, 0);
      content += `Total Budget: ₱${totalBudget.toLocaleString()}\n`;
      content += `Total Spent: ₱${totalSpent.toLocaleString()}\n\n`;
      
      p.paps.forEach((pap, idx) => {
        content += `${idx + 1}. ${pap.name} (${pap.papType})\n`;
        content += `   Owner: ${pap.owner}\n`;
        content += `   Status: ${pap.status}, Progress: ${pap.progress}%\n`;
        content += `   Budget: ₱${pap.budget.toLocaleString()}, Spent: ₱${pap.spent.toLocaleString()}\n`;
        content += `   Timeline: ${pap.startDate} to ${pap.endDate}\n\n`;
      });
    }

    if (selectedSections.appendix) {
      content += `${'='.repeat(60)}\n`;
      content += `APPENDIX\n`;
      content += `${'='.repeat(60)}\n\n`;
      if (appendixFiles.length > 0) {
        content += `UPLOADED DOCUMENTS (${appendixFiles.length}):\n`;
        appendixFiles.forEach((file, idx) => {
          content += `  ${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n`;
        });
      } else {
        content += `No appendix files uploaded.\n`;
      }
      content += '\n';
    }

    content += `\n${'='.repeat(60)}\n`;
    content += `Generated by Strategic Planner Pro\n`;
    content += `Aligned with BIRD 2026-2035 Framework\n`;
    content += `${'='.repeat(60)}\n`;

    return content;
  };

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Generator</h1>
          <p className="text-slate-500">Export professional strategic plans aligned with BIRD 2026-2035</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Select Sections</h3>
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isSelected = selectedSections[section.id as keyof typeof selectedSections];
                return (
                  <label
                    key={section.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-cyan-50 border border-cyan-200' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSection(section.id)}
                      className="mt-1 w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className={`font-medium ${isSelected ? 'text-cyan-800' : 'text-slate-700'}`}>
                          {section.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Export Format</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>Export as PDF</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>Export as Word</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export as Excel</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                Generating document...
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
              <h3 className="font-semibold text-slate-700">Document Preview</h3>
              <span className="text-xs text-slate-500">
                {Object.values(selectedSections).filter(Boolean).length} sections selected
              </span>
            </div>
            
            <div className="p-8 space-y-8 max-h-[800px] overflow-y-auto print:max-h-none print:overflow-visible">
              {/* Cover Page */}
              {selectedSections.coverPage && (
                <div className="text-center py-12 border-b border-slate-200 print:break-after-page">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 19h20L12 2z" />
                      <path d="M12 6L5 17h14L12 6z" />
                      <path d="M12 10L8 15h8L12 10z" />
                    </svg>
                  </div>
                  <h1 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange('name', e.currentTarget.innerText)}
                    className="text-3xl font-bold text-slate-800 mb-2 focus:outline-cyan-500 rounded px-1"
                  >
                    {editablePlan.name}
                  </h1>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange('organization', e.currentTarget.innerText)}
                    className="text-xl text-slate-600 mb-6 focus:outline-cyan-500 rounded px-1"
                  >
                    {editablePlan.organization}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange('planningPeriodStart', e.currentTarget.innerText)}
                    >
                      {editablePlan.planningPeriodStart || '2026'}
                    </span> 
                    <span>—</span>
                    <span 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange('planningPeriodEnd', e.currentTarget.innerText)}
                    >
                      {editablePlan.planningPeriodEnd || '2035'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-8">
                    Generated on {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Executive Summary */}
              {selectedSections.executiveSummary && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    Executive Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-700 mb-2">Vision</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('vision', e.currentTarget.innerText)}
                        className="text-slate-600 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.vision || 'Vision statement not defined'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-700 mb-2">Mission</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('mission', e.currentTarget.innerText)}
                        className="text-slate-600 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.mission || 'Mission statement not defined'}
                      </p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <h3 className="font-semibold text-cyan-800 mb-2">Strategic Intent</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('strategicIntent', e.currentTarget.innerText)}
                        className="text-cyan-700 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.strategicIntent || 'Strategic intent not defined'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SWOT Summary */}
              {selectedSections.swotAnalysis && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    SWOT Analysis Summary (Quantified)
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {['strength', 'weakness', 'opportunity', 'threat'].map((category) => {
                      const items = editablePlan.swotItems.filter((i) => i.category === category);
                      const colors = {
                        strength: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                        weakness: 'bg-red-50 border-red-200 text-red-800',
                        opportunity: 'bg-blue-50 border-blue-200 text-blue-800',
                        threat: 'bg-amber-50 border-amber-200 text-amber-800',
                      };
                      return (
                        <div key={category} className={`rounded-lg p-4 border ${colors[category as keyof typeof colors]}`}>
                          <h3 className="font-semibold capitalize mb-2">{category}s ({items.length})</h3>
                          <ul className="text-sm space-y-1">
                            {items.slice(0, 4).map((item, idx) => (
                              <li 
                                key={idx} 
                                className="focus:outline-cyan-500 rounded px-1 text-xs"
                              >
                                • <span 
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        const newSwot = [...editablePlan.swotItems];
                                        const index = newSwot.findIndex(i => i.id === item.id);
                                        newSwot[index].description = e.currentTarget.innerText;
                                        setEditablePlan({...editablePlan, swotItems: newSwot});
                                    }}
                                  >{item.description}</span>
                                <span className="text-slate-500 ml-1 block md:inline">
                                  ({calculateSwotScore(item.category, item.impactScore, item.likelihoodScore)})
                                </span>
                              </li>
                            ))}
                            {items.length > 4 && (
                              <li className="text-slate-500">...and {items.length - 4} more</li>
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Systems Thinking Section */}
              {selectedSections.systemsThinking && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5 text-purple-600" />
                    Systems Thinking Analysis
                  </h2>
                  
                  {/* ACTIVE CLD SNAPSHOT INFORMATION */}
                  <div className="mb-6">
                    <div className={cn(
                      "rounded-lg p-4 border",
                      getActiveSnapshotInfo().snapshot 
                        ? "bg-green-50 border-green-200" 
                        : getActiveSnapshotInfo().isActiveFromCanvas
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex items-start gap-3">
                        {getActiveSnapshotInfo().snapshot ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : getActiveSnapshotInfo().isActiveFromCanvas ? (
                          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">Current CLD State</h3>
                          {getActiveSnapshotInfo().snapshot ? (
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                ✓ Loaded from Snapshot: <strong>"{getActiveSnapshotInfo().snapshot.label}"</strong>
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(getActiveSnapshotInfo().snapshot!.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  <span>Nodes: {getActiveSnapshotInfo().snapshot!.nodes.length}, Links: {getActiveSnapshotInfo().snapshot!.links.length}</span>
                                </div>
                              </div>
                            </div>
                          ) : getActiveSnapshotInfo().isActiveFromCanvas ? (
                            <div>
                              <p className="text-sm text-amber-700 mb-1">
                                ⚠ Current Canvas State (Not Saved as Snapshot)
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600">ℹ No CLD data available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CLD Nodes Summary */}
                  {editablePlan.cldNodes && editablePlan.cldNodes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Causal Loop Diagram Elements
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600 mb-2">
                          <strong>{editablePlan.cldNodes.length}</strong> nodes and{' '}
                          <strong>{editablePlan.cldLinks?.length || 0}</strong> links mapping causal relationships
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Applied Archetypes */}
                  {editablePlan.appliedArchetypes && editablePlan.appliedArchetypes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Identified Systems Archetypes (BIRD Framework)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editablePlan.appliedArchetypes.map((archetypeId, idx) => {
                          const archetype = getArchetypeData(archetypeId);
                          if (!archetype) return null;
                          return (
                            <div key={archetypeId} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
                                  #{idx + 1}
                                </span>
                                <h4 className="font-bold text-slate-800">{archetype.name}</h4>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{archetype.description}</p>
                              <div className="space-y-1 text-xs">
                                <p><strong>Leverage Points:</strong></p>
                                <ul className="list-disc list-inside text-slate-500">
                                  {archetype.leverage_points.map((point: string, pIdx: number) => (
                                    <li key={pIdx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Strategy Summary */}
              {selectedSections.strategyMatrix && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    Strategy Matrix (TOWS)
                  </h2>
                  <div className="space-y-3">
                    {editablePlan.strategicOptions
                      .filter((opt) => opt.selected)
                      .map((opt, idx) => (
                        <div key={opt.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            opt.optionType === 'SO' ? 'bg-emerald-500' :
                            opt.optionType === 'ST' ? 'bg-blue-500' :
                            opt.optionType === 'WO' ? 'bg-purple-500' :
                            'bg-amber-500'
                          }`}>
                            {opt.optionType}
                          </span>
                          <div className="flex-1">
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newOpts = [...editablePlan.strategicOptions];
                                    const index = newOpts.findIndex(o => o.id === opt.id);
                                    newOpts[index].title = e.currentTarget.innerText;
                                    setEditablePlan({...editablePlan, strategicOptions: newOpts});
                                }}
                                className="font-medium text-slate-800 focus:outline-cyan-500 rounded px-1"
                            >
                                {opt.title}
                            </p>
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newOpts = [...editablePlan.strategicOptions];
                                    const index = newOpts.findIndex(o => o.id === opt.id);
                                    newOpts[index].description = e.currentTarget.innerText;
                                    setEditablePlan({...editablePlan, strategicOptions: newOpts});
                                }}
                                className="text-sm text-slate-600 focus:outline-cyan-500 rounded px-1"
                            >
                                {opt.description}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* BSC Summary */}
              {selectedSections.balancedScorecard && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    Balanced Scorecard Overview
                  </h2>
                  <p className="text-slate-600 mb-4">
                    {editablePlan.objectives.length} objectives with {editablePlan.objectives.reduce((sum, obj) => sum + obj.kpis.length, 0)} KPIs
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['financial', 'stakeholder', 'internal_process', 'learning_growth'].map((perspective) => {
                      const objectives = editablePlan.objectives.filter((o) => o.perspective === perspective);
                      const labels: Record<string, string> = {
                        financial: 'Financial',
                        customer: 'Stakeholder',
                        internal_process: 'Internal Process',
                        learning_growth: 'Learning & Growth'
                      };
                      return (
                        <div key={perspective} className="bg-slate-50 rounded-lg p-4">
                          <h3 className="font-semibold text-slate-700 mb-2">
                            {labels[perspective]}
                          </h3>
                          <p className="text-2xl font-bold text-cyan-600">{objectives.length}</p>
                          <p className="text-sm text-slate-500">objectives</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PAPs Summary */}
              {selectedSections.papsOverview && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-cyan-600" />
                    Programs, Activities & Projects (PAPs)
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {editablePlan.paps.filter((p) => p.papType === 'program').length}
                      </p>
                      <p className="text-sm text-purple-700">Programs</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cyan-600">
                        {editablePlan.paps.filter((p) => p.papType === 'project').length}
                      </p>
                      <p className="text-sm text-cyan-700">Projects</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {editablePlan.paps.filter((p) => p.papType === 'activity').length}
                      </p>
                      <p className="text-sm text-blue-700">Activities</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Budget:</span>
                      <span className="font-bold text-slate-800">
                        ₱{editablePlan.paps.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-600">Total Spent:</span>
                      <span className="font-bold text-emerald-600">
                        ₱{editablePlan.paps.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Appendix */}
              {selectedSections.appendix && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
                    Appendix
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300 hover:border-cyan-400 transition-colors">
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="text-sm text-slate-600 font-medium">Click to upload appendix files</span>
                      <span className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, Images, etc.</span>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
                  {appendixFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold text-slate-700 text-sm">Uploaded Files ({appendixFiles.length})</h3>
                      <ul className="space-y-2">
                        {appendixFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                            <span className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="truncate font-medium text-slate-700">{file.name}</span>
                              <span className="text-xs text-slate-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                            </span>
                            <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanExport;