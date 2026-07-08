// src/components/strategic/Section10_IEDSMatrix.tsx
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, Target, Award } from "lucide-react";

export function Section10_IEDSMatrix() {
  const form = useFormContext();

  const criteriaWeights = [
    { name: "economic_impact", label: "Economic Impact", weight: "25%", description: "GRDP growth, job creation, export revenue" },
    { name: "feasibility", label: "Feasibility", weight: "20%", description: "Technical capacity, fiscal realism, timeline" },
    { name: "identity_alignment", label: "Alignment with BARMM Identity", weight: "15%", description: "Islamic values, cultural authenticity, halal identity" },
    { name: "systems_leverage", label: "Systems Leverage", weight: "15%", description: "High-leverage intervention points, systems archetypes" },
    { name: "risk_return", label: "Risk-Return Profile", weight: "10%", description: "Climate, standards, political, market volatility" },
    { name: "inclusivity", label: "Inclusivity & Equity", weight: "10%", description: "Provincial distribution, MSME/IDP/women/youth focus" },
    { name: "sustainability", label: "Sustainability", weight: "5%", description: "Environmental, fiscal, institutional longevity" },
  ];

  const strategicOptions = [
    { 
      id: "heds", 
      name: "HEDS", 
      fullName: "Halal Economy Dominance Strategy",
      description: "Leverage halal legitimacy to capture USD 2.3T global market",
      color: "border-blue-500"
    },
    { 
      id: "gems", 
      name: "GEMS", 
      fullName: "Green Economy Monetization Strategy",
      description: "Transform environmental endowments into revenue (carbon, PES, eco-tourism)",
      color: "border-green-500"
    },
    { 
      id: "ifes", 
      name: "IFES", 
      fullName: "Infrastructure-First Enabling Strategy",
      description: "Remove binding constraints (energy, roads, digital, human capital)",
      color: "border-amber-500"
    },
    { 
      id: "ieds", 
      name: "IEDS", 
      fullName: "Integrated Ecosystem Development Strategy",
      description: "Synchronized activation of all clusters with coherent sequencing",
      color: "border-purple-500"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Context */}
      <Card className="border-[#C9A84C]/30 bg-gradient-to-r from-[#011a12] to-[#013324]">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-[#C9A84C] flex items-center gap-2">
            <Target className="w-6 h-6" />
            10. Strategic Options Evaluation: IEDS Matrix
          </CardTitle>
          <CardDescription className="text-[#ecfdf5]/80 text-base">
            Evaluate the four strategic pathways using the 7-criteria weighted matrix that determined 
            IEDS as the optimal strategy (Score: 8.93/10)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Visual 1: Strategic Options Ranking */}
      <Card className="border-[#C9A84C]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#ecfdf5]">
            Figure 1: Strategic Options Ranking Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-[#C9A84C]/30 bg-black/20">
            <img
              src="https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/images-strategic-options-roadmap/public/3.%20Strategic%20Options%20Ranking.png"
              alt="Strategic Options Ranking showing IEDS ranked 1st (8.93), HEDS 2nd (7.61), IFES 3rd (7.48), GEMS 4th (7.16)"
              className="w-full h-auto"
            />
          </div>
          <p className="mt-3 text-sm text-[#ecfdf5]/70">
            <strong>Key Finding:</strong> IEDS achieves the highest composite score (8.93
