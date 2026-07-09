// src/components/strategic/SurveyWizard.tsx
// BIRD 2026–2035 · Validation Survey Wizard with Context Panel Integration
// 16-step progressive assessment with kill-switch validation & rich media context

import React, { useState, useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// ── Schema & API ─────────────────────────────────────────────────────────────
import { surveySchema, type SurveySchemaType, conditionalRules } from "@/lib/survey-schema";
import { submitSurvey } from "@/lib/api";

// ── UI Components ──────────────────────────────────────────────────────────────
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ── Icons ────────────────────────────────────────────────────────────────────
import {
  ArrowRight, ArrowLeft, Send, CheckCircle2, AlertTriangle, AlertCircle,
} from "lucide-react";

// ── Context Panel (NEW: Videos, Images, Sites integration) ───────────────────
import { ContextPanel, ContextStrip } from "./ContextPanel";

// ── Section Components ───────────────────────────────────────────────────────
import { Section1_BEIE } from "./Section1_BEIE";
import { Section2_MoralGov } from "./Section2_MoralGov";
import { Section3_Foundations } from "./Section3_Foundations";
import { Section4_Transformers } from "./Section4_Transformers";
import { Section5_Enablers } from "./Section5_Enablers";
import { Section6_Connectors } from "./Section6_Connectors";
import { Section7_Financiers } from "./Section7_Financiers";
import { Section8_StrategicOptions } from "./Section8_StrategicOptions";
import { Section9_BudgetTargets } from "./Section9_BudgetTargets";
import { Section10_IEDSMatrix } from "./Section10_IEDSMatrix";
import { Section11_Equity } from "./Section11_Equity";
import { Section12_Climate } from "./Section12_Climate";
import { Section13_Policy } from "./Section13_Policy";
import { Section14_Demographics } from "./Section14_Demographics";
import { Section15_Submission } from "./Section15_Submission";
import { Section16_CARE } from "./Section16_CARE";

// ── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 16;

const STEP_TITLES: Record<number, string> = {
  1: "BEIE Framework Context",
  2: "Moral Governance Operating System",
  3: "Cluster 1: Foundations",
  4: "Cluster 2: Transformers",
  5: "Cluster 3: Enablers",
  6: "Cluster 4: Connectors",
  7: "Cluster 5: Financiers",
  8: "Strategic Options",
  9: "Budget & Targets",
  10: "IEDS Matrix Evaluation",
  11: "Provincial Equity",
  12: "Climate Resilience",
  13: "Policy & Governance",
  14: "Demographics",
  15: "C.A.R.E. Validation",
  16: "Final Submission",
};

/** Map step numbers to section IDs for ContextPanel lookup */
const STEP_TO_SECTION: Record<number, string> = {
  1: "section1",
  2: "section2",
  3: "section3",
  4: "section4",
  5: "section5",
  6: "section6",
  7: "section7",
  8: "section8",
  9: "section9",
  10: "section10",
  11: "section11",
  12: "section12",
  13: "section13",
  14: "section14",
  15: "section16",
  16: "section15",
};

/** Fields that MUST be completed before advancing from specific sections */
const KILL_SWITCH_PREREQUISITES: Record<number, (keyof SurveySchemaType)[]> = {
  1: ["q1_1", "q1_2"],
  2: ["q2_1", "q2_2", "q2_3_archetype"],
  10: ["q10_matrix", "q10_1_ambition"],
  15: ["care_context", "care_action", "care_realtime", "care_evidence", "care_overall"],
  16: ["consent_final"],
};

function buildDefaultValues(): SurveySchemaType {
  return {
    q1_1: undefined as unknown as string, q1_2: undefined as unknown as string,
    q2_1: undefined as unknown as number, q2_2: undefined as unknown as number,
    q2_3_archetype: undefined as unknown as string, q2_4_peace: [],
    q3_1_priorities: [], q3_2_feasibility: undefined as unknown as number,
    q3_el_nino_impact: undefined, q3_el_nino_like: undefined,
    q3_pestalotiopsis_impact: undefined, q3_pestalotiopsis_like: undefined,
    q3_postharvest_impact: undefined, q3_postharvest_like: undefined,
    q3_limits_growth: undefined,
    q4_1_barrier: undefined as unknown as string,
    q4_2_halal_park: undefined as unknown as string,
    q4_3_fixes_fail: undefined as unknown as string,
    q4_4_commodity_impact: undefined, q4_5_heds_ranking: [],
    q5_1_infra: undefined as unknown as number, q5_2_sectors: [],
    q5_3_broadband: undefined as unknown as number,
    q5_4_literacy: undefined as unknown as number,
    q5_5_stunting: undefined as unknown as number,
    q5_6_digital_divide: undefined as unknown as string,
    q6_1_bimpeaga: undefined as unknown as number, q6_2_markets: [],
    q6_3_export_target: undefined as unknown as number,
    q6_4_uae_feasibility: undefined as unknown as number,
    q6_5_perception: undefined as unknown as string,
    q7_1_criticality: undefined as unknown as number, q7_2_instruments: [],
    q7_3_inclusion_target: undefined as unknown as number,
    q7_4_asset_paradox: undefined as unknown as string,
    q7_5_block_grant: undefined as unknown as string,
    q8_1_strategy: undefined as unknown as string,
    q8_2_sequencing: undefined as unknown as string, q8_3_comments: "",
    q9_1_budget: undefined as unknown as number,
    q10_1_ambition: undefined as unknown as number,
    q10_matrix: {
      heds: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
      gems: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
      ifes: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
      ieds: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
    },
    q11_1_affirmative: undefined as unknown as string, q11_2_mechanisms: [],
    q12_1_green_priority: undefined as unknown as number, q12_2_adaptation: [],
    q13_1_legislation: [], q13_2_bicc: undefined as unknown as number,
    demo_category: "", demo_province: "", demo_expertise: [],
    demo_name: "", demo_email: "", demo_organization: "",
    basilan_peace_questions: undefined,
    maguindanao_halal_questions: undefined,
    tawitawi_seaweed_questions: undefined,
    lanao_lake_questions: undefined,
    consent_final: false as unknown as true,
    care_context: undefined as unknown as number,
    care_action: undefined as unknown as number,
    care_realtime: undefined as unknown as number,
    care_evidence: undefined as unknown as number,
    care_overall: undefined as unknown as number,
  };
}
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
// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function SurveyWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [killSwitchErrors, setKillSwitchErrors] = useState<string[]>([]);

  const form = useForm<SurveySchemaType>({
    resolver: zodResolver(surveySchema),
    defaultValues: buildDefaultValues(),
    mode: "onTouched",
  });

  const watchedProvince = useWatch({ control: form.control, name: "demo_province" });
  const progressPercentage = useMemo(() => (currentStep / TOTAL_STEPS) * 100, [currentStep]);

  // ── Kill Switch Validation ─────────────────────────────────────────────────
  const checkKillSwitches = useCallback((): boolean => {
    const prerequisites = KILL_SWITCH_PREREQUISITES[currentStep];
    if (!prerequisites || prerequisites.length === 0) return true;
    const values = form.getValues();
    const missing: string[] = [];
    for (const field of prerequisites) {
      const value = values[field];
      if (Array.isArray(value)) { if (value.length === 0) missing.push(field); }
      else if (value === undefined || value === "" || value === false) missing.push(field);
    }
    setKillSwitchErrors(missing);
    return missing.length === 0;
  }, [currentStep, form]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) { toast.error("Please review and correct the errors before proceeding."); return; }
    if (!checkKillSwitches()) { toast.error("Please complete all required critical fields before proceeding."); return; }
    setCompletedSections((prev) => new Set(prev).add(currentStep));
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, form, checkKillSwitches]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) { setCurrentStep((prev) => prev - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }, [currentStep]);

  // ── Submission ───────────────────────────────────────────────────────────────
  const onSubmit = useCallback(async (data: SurveySchemaType) => {
    const finalChecks = KILL_SWITCH_PREREQUISITES[16] ?? [];
    const values = form.getValues();
    const missingFinal = finalChecks.filter((f) => {
      const v = values[f];
      return v === undefined || v === "" || v === false;
    });
    if (missingFinal.length > 0) { setKillSwitchErrors(missingFinal); toast.error("Please complete all final consent requirements."); return; }

    setIsSubmitting(true); setKillSwitchErrors([]);
    try {
      await submitSurvey(data);
      setIsSuccess(true);
      toast.success("Your strategic input has been securely recorded in the BIRD repository.");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error instanceof Error ? error.message : "Submission failed. Please check your connection and try again.");
    } finally { setIsSubmitting(false); }
  }, [form]);

  // ── Section Renderer ─────────────────────────────────────────────────────────
  const renderSection = useCallback((): React.ReactNode => {
    const commonProps = { form, watchedProvince };
    switch (currentStep) {
      case 1: return <Section1_BEIE {...commonProps} />;
      case 2: return <Section2_MoralGov {...commonProps} />;
      case 3: return <Section3_Foundations {...commonProps} />;
      case 4: return <Section4_Transformers {...commonProps} />;
      case 5: return <Section5_Enablers {...commonProps} />;
      case 6: return <Section6_Connectors {...commonProps} />;
      case 7: return <Section7_Financiers {...commonProps} />;
      case 8: return <Section8_StrategicOptions {...commonProps} />;
      case 9: return <Section9_BudgetTargets {...commonProps} />;
      case 10: return <Section10_IEDSMatrix {...commonProps} />;
      case 11: return <Section11_Equity {...commonProps} />;
      case 12: return <Section12_Climate {...commonProps} />;
      case 13: return <Section13_Policy {...commonProps} />;
      case 14: return <Section14_Demographics {...commonProps} />;
      case 15: return <Section16_CARE {...commonProps} />;
      case 16: return <Section15_Submission isSubmitting={isSubmitting} isSuccess={false} />;
      default: return <Section1_BEIE {...commonProps} />;
    }
  }, [currentStep, form, watchedProvince, isSubmitting]);

  // Get current section ID for context panel
  const currentSectionId = STEP_TO_SECTION[currentStep];

  // ═══════════════════════════════════════════════════════════════════════════
  // SUCCESS STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Card className="w-full max-w-2xl border-[#C9A84C]/30 bg-[#022c22]/70 shadow-2xl backdrop-blur-xl">
          <CardHeader className="items-center">
            <CheckCircle2 className="w-20 h-20 text-[#C9A84C] mb-4 animate-pulse" />
            <CardTitle className="text-3xl font-serif text-[#C9A84C]">Validation Received</CardTitle>
            <CardDescription className="text-[#ecfdf5]/80 text-lg max-w-md">
              Thank you for shaping the Emerging Bangsamoro through the C.A.R.E. principles of Khalifa stewardship.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Badge className="border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#E8C560] px-4 py-1.5">Secure submission completed</Badge>
            <Button onClick={() => window.open("https://strategy-ai-planner-1.deploypad.app/", "_blank")}
              className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20">
              Access BIRD App →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header & Progress */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="border-[#C9A84C]/50 text-[#C9A84C] px-4 py-1.5 text-sm font-serif tracking-wide">
            BIRD 2026–2035 Validation Survey
          </Badge>
          {completedSections.size > 0 && (
            <Badge className="border-green-500/40 bg-green-500/10 text-green-400">
              {completedSections.size} of {TOTAL_STEPS} sections completed
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-[#C9A84C]">The Emerging Bangsamoro</h1>
        <p className="text-[#ecfdf5]/60">Step {currentStep} of {TOTAL_STEPS} • {STEP_TITLES[currentStep]}</p>
        <Progress value={progressPercentage} className="h-2 bg-[#064e3b] [&>div]:bg-[#C9A84C]" />
      </div>

      {/* Context Strip — Inline reference badges */}
      <ContextStrip sectionId={currentSectionId} />

      {/* Provincial Context Alert */}
      {currentStep === 3 && watchedProvince === "basilan" && (
        <Alert className="bg-amber-950/40 border-amber-500/50 text-amber-100 backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <AlertTitle className="text-amber-400 font-serif">Provincial Context: Basilan</AlertTitle>
          <AlertDescription>
            As a Basilan stakeholder, please pay special attention to the <strong>Pestalotiopsis fungal disease</strong> impact on rubber plantations and the <strong>ZBIP</strong> energy interconnection in your assessment.
          </AlertDescription>
        </Alert>
      )}

      {/* Kill Switch Alert */}
      {killSwitchErrors.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10 text-red-200 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Required Critical Fields Missing</AlertTitle>
          <AlertDescription>
            This section contains critical prerequisites that must be completed before proceeding. Missing: {killSwitchErrors.join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid: Form + Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="bg-[#022c22]/60 backdrop-blur-xl border-[#C9A84C]/30 shadow-2xl shadow-black/40 overflow-hidden">
                <CardHeader className="border-b border-[#C9A84C]/10">
                  <CardTitle className="text-2xl font-serif text-[#C9A84C]">{STEP_TITLES[currentStep]}</CardTitle>
                  <CardDescription className="text-[#ecfdf5]/70">
                    {currentStep <= 10 ? "Core BEIE Framework Assessment" : currentStep <= 14 ? "Strategic Evaluation & Planning" : "Final Validation & Submission"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-10">
                  <div className="min-h-[500px]">{renderSection()}</div>
                </CardContent>
                <Separator className="bg-[#C9A84C]/20" />
                {/* Navigation Footer */}
                <div className="bg-[#011a12]/80 backdrop-blur-md p-4 md:p-6 flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}
                    className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 disabled:opacity-30">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  {currentStep < TOTAL_STEPS ? (
                    <Button type="button" onClick={handleNext}
                      className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20">
                      Next Section <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}
                      className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20">
                      {isSubmitting ? <>Securing Data... <span className="ml-2 animate-spin">⟳</span></> : <>Submit Validation <Send className="w-4 h-4 ml-2" /></>}
                    </Button>
                  )}
                </div>
              </Card>
            </form>
          </Form>
        </div>

        {/* Context Panel Column — Videos, Images, Sites */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <ContextPanel sectionId={currentSectionId} compact />

            {/* Quick Links Card */}
            <Card className="bg-[#022c22]/40 backdrop-blur-xl border-[#C9A84C]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#C9A84C] uppercase tracking-wider">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <a href="https://bird-survey-orientation.asilvainnovations.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#E8C560] hover:text-[#C9A84C] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Survey Orientation
                </a>
                <a href="https://bird-resources.asilvainnovations.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#E8C560] hover:text-[#C9A84C] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Resources Library
                </a>
                <a href="https://bird-roadmap.asilvainnovations.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#E8C560] hover:text-[#C9A84C] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Investment Roadmap
                </a>
                <a href="https://bird-dashboard.asilvainnovations.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#E8C560] hover:text-[#C9A84C] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Strategic Dashboard
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SurveyWizard);
