// src/components/strategic/SurveyWizard.tsx
"use client";


import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { surveySchema, SurveySchemaType } from "@/lib/survey-schema";
import { submitSurvey } from "@/lib/api";
// Import all 15 sections
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

export function SurveyWizard() {
  // ✅ The useForm hook belongs HERE, inside the React component
  const form = useForm<SurveySchemaType>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      q1_1: "", q1_2: "",
      q2_1: "", q2_2: "",
      q3_1: [], q3_2: "",
      q4_1: "", q4_2: "",
      q5_1: "", q5_2: [], q5_3: "",
      q6_1: "", q6_2: [], q6_3: "",
      q7_1: "", q7_2: [], q7_3: "",
      q8_1: "", q8_2: "",
      q9_1: "",
      q10_1: "",
      q10_matrix: {
        heds: { economic_impact: 0, feasibility: 0, identity_alignment: 0, systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0 },
        gems: { economic_impact: 0, feasibility: 0, identity_alignment: 0, systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0 },
        ifes: { economic_impact: 0, feasibility: 0, identity_alignment: 0, systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0 },
        ieds: { economic_impact: 0, feasibility: 0, identity_alignment: 0, systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0 },
      },
      q11_1: "", q11_2: [],
      q12_1: "", q12_2: [],
      q13_1: [], q13_2: "",
      demo_category: "", demo_province: "", demo_expertise: [],
      consent_final: false,
    },
    mode: "onTouched",
  });

}

const TOTAL_STEPS = 15;

export function SurveyWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SurveySchemaType>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      // Section 1: BEIE Framework
      q1_1: "", q1_2: "",
      // Section 2: Moral Governance
      q2_1: "", q2_2: "",
      // Section 3: Foundations
      q3_1: [], q3_2: "",
      // Section 4: Transformers
      q4_1: "", q4_2: "",
      // Section 5: Enablers
      q5_1: [], q5_2: "", q5_3: "",
      // Section 6: Connectors
      q6_1: [], q6_2: "",
      // Section 7: Financiers
      q7_1: "", q7_2: [],
      // Section 8: Strategic Options
      q8_1: "", q8_2: "",
      // Section 9: Budget & Targets
      q9_1: "", q10_1: "",
      // Section 10: IEDS Matrix (nested object)
      q10_matrix: {
        heds: {
          economic_impact: 0, feasibility: 0, identity_alignment: 0,
          systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0
        },
        gems: {
          economic_impact: 0, feasibility: 0, identity_alignment: 0,
          systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0
        },
        ifes: {
          economic_impact: 0, feasibility: 0, identity_alignment: 0,
          systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0
        },
        ieds: {
          economic_impact: 0, feasibility: 0, identity_alignment: 0,
          systems_leverage: 0, risk_return: 0, inclusivity: 0, sustainability: 0
        }
      },
      // Section 11: Equity
      q11_1: "", q11_2: [],
      // Section 12: Climate
      q12_1: "", q12_2: [],
      // Section 13: Policy
      q13_1: [], q13_2: "",
      // Section 14: Demographics
      demo_category: "", demo_province: "", demo_expertise: [],
      // Section 15: Submission
      consent_final: false,
    },
    mode: "onTouched",
  });

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    // Validate current step fields before proceeding
    const isValid = await form.trigger();
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isValid) {
      toast({
        title: "Validation Required",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  async function onSubmit(data: SurveySchemaType) {
    setIsSubmitting(true);
    try {
      await submitSurvey(data);
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your validation has been securely recorded in the BIRD repository.",
      });
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your validation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <CheckCircle2 className="w-20 h-20 text-[#C9A84C] mb-6 animate-pulse" />
        <h2 className="text-3xl font-serif text-[#C9A84C] mb-4">Validation Received</h2>
        <p className="text-[#ecfdf5]/80 text-lg max-w-md mb-6">
          Thank you for shaping the Emerging Bangsamoro. Your insights have been securely recorded in the BIRD repository.
        </p>
        <div className="bg-[#064e3b]/30 border border-[#C9A84C]/30 rounded-lg p-6 max-w-lg">
          <h3 className="text-[#C9A84C] font-serif text-xl mb-3">🚀 Continue Your Journey</h3>
          <p className="text-[#ecfdf5]/70 text-sm mb-4">
            Unlock unlimited access to the BIRD App for advanced strategic planning tools, interactive BEIE visualizations, and real-time monitoring dashboards.
          </p>
          <Button
            onClick={() => window.open("https://strategy-ai-planner-1.deploypad.app/", "_blank")}
            className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold"
          >
            Access BIRD App
          </Button>
        </div>
      </div>
    );
  }

  // Render the appropriate section based on current step
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
      case 15: return <Section15_Submission />;
      default: return <Section1_BEIE />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Header & Progress */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif text-[#C9A84C] text-center mb-2">
          BIRD 2026–2035 Validation
        </h1>
        <p className="text-[#ecfdf5]/60 text-center mb-6">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
        <Progress value={progressPercentage} className="h-2 bg-[#064e3b] [&>div]:bg-[#C9A84C]" />
      </div>

      {/* Form Container */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-[#022c22]/60 backdrop-blur-xl border-[#C9A84C]/30 shadow-2xl shadow-black/40 overflow-hidden">
            <CardContent className="p-6 md:p-10">
              {/* Step Content */}
              <div className="min-h-[500px]">
                {renderSection()}
              </div>
            </CardContent>

            {/* Navigation Footer */}
            <div className="bg-[#011a12]/50 border-t border-[#C9A84C]/20 p-4 md:p-6 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#C9A84C] hover:bg-[#E8C560] text-[#022c22] font-bold shadow-lg shadow-[#C9A84C]/20"
                >
                  {isSubmitting ? "Securing Data..." : "Submit Validation"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
