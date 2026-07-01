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

import { surveySchema, SurveySchemaType } from "@/lib/survey-schema";
import { submitSurvey } from "@/lib/api";

import { Section1_BEIE } from "./Section1_BEIE";
import { Section2_MoralGov } from "./Section2_MoralGov";
import { Section3_Foundations } from "./Section3_Foundations";
import { Section4_Transformers } from "./Section4_Transformers";
// Future imports for Batch 3 & 4
// import { Section5_Enablers } from "./Section5_Enablers";
// ...

const TOTAL_STEPS = 4; // Update this as we add more sections

export function SurveyWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SurveySchemaType>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      q1_1: "", q1_2: "",
      q2_1: "", q2_2: "",
      q3_1: [], q3_2: "",
      q4_1: "", q4_2: "",
      // Add defaults for future sections here
    },
    mode: "onTouched",
  });

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = async () => {
    // Validate current step fields before proceeding
    // Note: For simplicity, we validate all fields here. 
    // For strict step-by-step validation, you'd use form.trigger(['q1_1', 'q1_2'])
    const isValid = await form.trigger();
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } catch (error) {
      console.error("Submission failed:", error);
      // Handle error UI (e.g., toast notification)
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <CheckCircle2 className="w-20 h-20 text-[#C9A84C] mb-6 animate-pulse" />
        <h2 className="text-3xl font-serif text-[#C9A84C] mb-4">Validation Received</h2>
        <p className="text-[#ecfdf5]/80 text-lg max-w-md">
          Thank you for shaping the Emerging Bangsamoro. Your insights have been securely recorded in the BIRD repository.
        </p>
      </div>
    );
  }

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
              <div className="min-h-[400px]">
                {currentStep === 1 && <Section1_BEIE />}
                {currentStep === 2 && <Section2_MoralGov />}
                {currentStep === 3 && <Section3_Foundations />}
                {currentStep === 4 && <Section4_Transformers />}
                {/* Add future steps here */}
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
