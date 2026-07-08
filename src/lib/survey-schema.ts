// src/components/strategic/SurveyWizard.tsx
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { surveySchema, SurveySchemaType } from "@/lib/survey-schema";
import { submitSurvey } from "@/lib/api";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, ArrowLeft, Send, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

// Import all sections
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

const TOTAL_STEPS = 16;

// Kill switch prerequisites by section
const killSwitchPrerequisites: Record<number, string[]> = {
  1: ["q1_1", "q1_2"], // BEIE Framework
  2: ["q2_1", "q2_2", "q2_3_archetype"], // Moral Governance
  10: ["q10_matrix"], // IEDS Matrix - must be completed
  15: ["consent_final"], // Final consent
};

export function SurveyWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [sectionValidationErrors, setSectionValidationErrors] = useState<Record<number, string[]>>({});

  const form = useForm<SurveySchemaType>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      // Section 1
      q1_1: undefined,
      q1_2: undefined,
      // Section 2
      q2_1: undefined,
      q2_2: undefined,
      q2_3_archetype: undefined,
      q2_4_peace: [],
      // Section 3
      q3_1_priorities: [],
      q3_2_feasibility: undefined,
      q3_el_nino_impact: undefined,
      q3_el_nino_like: undefined,
      q3_pestalotiopsis_impact: undefined,
      q3_pestalotiopsis_like: undefined,
      q3_postharvest_impact: undefined,
      q3_postharvest_like: undefined,
      q3_limits_growth: undefined,
      // Section 4
      q4_1_barrier: undefined,
      q4_2_halal_park: undefined,
      q4_3_fixes_fail: undefined,
      q4_4_commodity_impact: undefined,
      q4_5_heds_ranking: [],
      // Section 5
      q5_1_infra: undefined,
      q5_2_sectors: [],
      q5_3_broadband: undefined,
      q5_4_literacy: undefined,
      q5_5_stunting: undefined,
      q5_6_digital_divide: undefined,
      // Section 6
      q6_1_bimpeaga: undefined,
      q6_2_markets: [],
      q6_3_export_target: undefined,
      q6_4_uae_feasibility: undefined,
      q6_5_perception: undefined,
      // Section 7
      q7_1_criticality: undefined,
      q7_2_instruments: [],
      q7_3_inclusion_target: undefined,
      q7_4_asset_paradox: undefined,
      q7_5_block_grant: undefined,
      // Section 8
      q8_1_strategy: undefined,
      q8_2_sequencing: undefined,
      q8_3_comments: "",
      // Section 9-10
      q9_1_budget: undefined,
      q10_1_ambition: undefined,
      q10_matrix: {
        heds: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
        gems: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
        ifes: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
        ieds: { economic_impact: 5, feasibility: 5, identity_alignment: 5, systems_leverage: 5, risk_return: 5, inclusivity: 5, sustainability: 5 },
      },
      // Section 11
      q11_1_affirmative: undefined,
      q11_2_mechanisms: [],
      // Section 12
      q12_1_green_priority: undefined,
      q12_2_adaptation: [],
      // Section 13
      q13_1_legislation: [],
      q13_2_bicc: undefined,
      // Section 14
      demo_category: "",
      demo_province: "",
      demo_expertise: [],
      demo_name: "",
      demo_email: "",
      demo_organization: "",
      // Province-specific (conditional)
      basilan_peace_questions: undefined,
      maguindanao_halal_questions: undefined,
      tawitawi_seaweed_questions: undefined,
      lanao_lake_questions: undefined,
      // Section 15
      consent_final: false as never,
      // Section 16
      care_context: undefined,
      care_action: undefined,
      care_realtime: undefined,
      care_evidence: undefined,
      care_overall: undefined,
    },
    mode: "onTouched",
  });

  // Watch form values for conditional logic
  const formValues = useWatch({ control: form.control });

  // Calculate progress
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Check if current section has kill switch prerequisites
  const checkKillSwitchPrerequisites = async (): Promise<boolean> => {
    const prerequisites = killSwitchPrerequisites[currentStep];
    if (!prerequisites) return true;

    const values = form.getValues();
    const missingFields = prerequisites.filter((field) => {
      const value = values[field as keyof SurveySchemaType];
      if (Array.isArray(value)) return value.length === 0;
      return value === undefined || value === "" || value === false;
    });

    if (missingFields.length > 0) {
      setSectionValidationErrors({
        ...sectionValidationErrors,
        [currentStep]: missingFields,
      });
      return false;
    }
    
    // Clear errors if prerequisites are met
    if (sectionValidationErrors[currentStep]) {
      const newErrors = { ...sectionValidationErrors };
      delete newErrors[currentStep];
      setSectionValidationErrors(newErrors);
    }

    return true;
  };

  // Determine if section should be shown based on conditional logic
  const shouldShowSection = (step: number): boolean => {
    // Always show main sections 1-14 and 16
    if (step <= 14 || step === 16) return true;
    
    // Conditional sections based on province (Step 15 maps to CARE, but we can inject province logic here if needed)
    // For now, we show all steps sequentially as the province-specific questions are handled inside the sections or via alerts.
    return true;
  };

  const handleNext = async () => {
    // Validate current section
    const isValid = await form.trigger();
    
    // Check kill switch prerequisites
    const prerequisitesMet = await checkKillSwitchPrerequisites();
    
    if (isValid && prerequisitesMet) {
      // Mark section as completed
      setCompletedSections((prev) => new Set(prev).add(currentStep));
      
      // Find next visible section
      let nextStep = currentStep + 1;
      while (nextStep <= TOTAL_STEPS && !shouldShowSection(nextStep)) {
        nextStep++;
      }
      
      if (nextStep <= TOTAL_STEPS) {
        setCurrentStep(nextStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      const errorMsg = !prerequisitesMet 
        ? "Please complete all required critical fields in this section before proceeding."
        : "Please review and correct the errors before proceeding.";
      
      toast({
        title: "Validation Required",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Find previous visible section
      let prevStep = currentStep - 1;
      while (prevStep >= 1 && !shouldShowSection(prevStep)) {
        prevStep--;
      }
      
      if (prevStep >= 1) {
        setCurrentStep(prevStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  async function onSubmit(data: SurveySchemaType) {
    setIsSubmitting(true);
    try {
      await submitSurvey(data);
      setIsSuccess(true);
      toast({
        title: "Validation Submitted Successfully",
        description: "Your strategic input has been securely recorded in the BIRD repository.",
      });
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success State UI
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
            <Badge className="border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#E8C560] px-4 py-1.5">
              Secure submission completed
            </Badge>
            <Button 
              onClick={() => window.open("https://strategy-ai-planner-1.deploypad.app/", "_blank")}
              className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20"
            >
              Access BIRD App →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Section Renderer
  const renderSection = () => {
    switch (currentStep) {
      case 1: return <Section1_BEIE />;
      case 2: return <Section2_MoralGov />;
      case 3: return <Section3_Foundations />;
      case 4: return <Section4_Transformers />;
      case 5: return <Section5_Enablers />;
      case 6: return <Section6_Connectors />;
      case 7: return <Section7_Financiers />;
      case 8: return <Section8_StrategicOptions />;
      case 9: return <Section9_BudgetTargets />;
      case 10: return <Section10_IEDSMatrix />;
      case 11: return <Section11_Equity />;
      case 12: return <Section12_Climate />;
      case 13: return <Section13_Policy />;
      case 14: return <Section14_Demographics />;
      case 15: return <Section16_CARE />;  // CARE before final consent
      case 16: return <Section15_Submission isSubmitting={isSubmitting} isSuccess={false} />;
      default: return <Section1_BEIE />;
    }
  };

  // Get current section title
  const getSectionTitle = (step: number) => {
    const titles: Record<number, string> = {
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
    return titles[step] || `Section ${step}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header & Progress */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="border-[#C9A84C]/50 text-[#C9A84C] px-4 py-1.5 text-sm font-serif tracking-wide">
            BIRD 2026–2035 Validation Survey
          </Badge>
          {completedSections.size > 0 && (
            <Badge className="border-green-500/40 bg-green-500/10 text-green-400">
              {completedSections.size} sections completed
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-[#C9A84C]">
          The Emerging Bangsamoro
        </h1>
        <p className="text-[#ecfdf5]/60">
          Step {currentStep} of {TOTAL_STEPS} • {getSectionTitle(currentStep)}
        </p>
        
        <Progress value={progressPercentage} className="h-2 bg-[#064e3b] [&>div]:bg-[#C9A84C]" />
      </div>

      {/* 🐘 DYNAMIC CONTEXT ALERT (Conditional Logic) */}
      {currentStep === 3 && formValues.demo_province === "basilan" && (
        <Alert className="bg-amber-950/40 border-amber-500/50 text-amber-100 backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <AlertTitle className="text-amber-400 font-serif">Provincial Context: Basilan</AlertTitle>
          <AlertDescription>
            As a Basilan stakeholder, please pay special attention to the <strong>Pestalotiopsis fungal disease</strong> impact on rubber plantations and the <strong>ZBIP</strong> energy interconnection in your assessment.
          </AlertDescription>
        </Alert>
      )}

      {/* Kill Switch Alert */}
      {sectionValidationErrors[currentStep] && (
        <Alert className="border-red-500/30 bg-red-500/10 text-red-200 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Required Critical Fields Missing</AlertTitle>
          <AlertDescription>
            This section contains critical prerequisites (Kill Switches) that must be completed before proceeding to the next phase.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form Card (Glassmorphism) */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-[#022c22]/60 backdrop-blur-xl border-[#C9A84C]/30 shadow-2xl shadow-black/40 overflow-hidden">
            <CardHeader className="border-b border-[#C9A84C]/10">
              <CardTitle className="text-2xl font-serif text-[#C9A84C]">
                {getSectionTitle(currentStep)}
              </CardTitle>
              <CardDescription className="text-[#ecfdf5]/70">
                {currentStep <= 10 
                  ? "Core BEIE Framework Assessment" 
                  : currentStep <= 14 
                  ? "Strategic Evaluation & Planning" 
                  : "Final Validation & Submission"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 md:p-10">
              <div className="min-h-[500px]">{renderSection()}</div>
            </CardContent>
            
            <Separator className="bg-[#C9A84C]/20" />
            
            {/* Navigation Footer */}
            <div className="bg-[#011a12]/80 backdrop-blur-md p-4 md:p-6 flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 1}
                className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              
              {currentStep < TOTAL_STEPS ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20"
                >
                  Next Section <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20"
                >
                  {isSubmitting ? "Securing Data..." : "Submit Validation"} <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
