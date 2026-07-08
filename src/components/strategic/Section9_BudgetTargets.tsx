// src/components/strategic/Section9_BudgetTargets.tsx
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function Section9_BudgetTargets() {
  const form = useFormContext();

  const phaseBudgets = [
    {
      phase: "Phase 1: Foundation Building",
      timeframe: "2026-2028",
      budget: "₱35-45B",
      budgetNum: 40,
      focus: "Moral Governance, Enablers, Foundations",
      deliverables: [
        "BHB operationalized with OIC/SMIIC-aligned processes",
        "ZBIP construction milestones (80% completion)",
        "Bangsamoro Forestry Code enacted",
        "1-day digital business registration launched",
        "Farm-to-market road priorities funded"
      ],
      color: "bg-emerald-500"
    },
    {
      phase: "Phase 2: Acceleration",
      timeframe: "2029-2032",
      budget: "₱50-65B",
      budgetNum: 57.5,
      focus: "Foundations-Transformers, Financiers, Enablers-Connectors",
      deliverables: [
        "Bangsamoro Halal Park operational (Matanog)",
        "REDD+ program registered; first carbon credit sales",
        "Islamic banking in all provincial capitals",
        "5,000+ MSMEs halal-certified",
        "Cold chain & warehousing hubs operational"
      ],
      color: "bg-blue-500"
    },
    {
      phase: "Phase 3: Consolidation & Global Integration",
      timeframe: "2033-2035",
      budget: "₱35-50B",
      budgetNum: 42.5,
      focus: "Financiers-Ecosystem, Connectors, Global Markets",
      deliverables: [
        "OIC endorsement secured; SMIIC MRA signed",
        "₱500M+ annual carbon/PES revenue",
        "GRDP ₱550B+; poverty <20%",
        "BARMM recognized as ASEAN halal hub",
        "Innovation hubs & halal R&D centers operational"
      ],
      color: "bg-purple-500"
    }
  ];

  const totalBudget = 140; // Midpoint of ₱120-160B

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">
          9. Budget Allocation and Strategic Targets
        </CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          Phased implementation budget totaling ₱120-160 billion (2026-2035) aligned with IEDS sequencing logic.
        </CardDescription>
      </CardHeader>

      {/* Total Budget Summary */}
      <div className="p-6 rounded-lg border border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#C9A84C]">Total Investment Requirement</h3>
            <p className="text-sm text-[#ecfdf5]/70">2026-2035 (10-year horizon)</p>
          </div>
          <Badge className="text-lg px-4 py-2 bg-[#C9A84C] text-black">₱120-160 Billion</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#ecfdf5]/60">BARMM Block Grant</p>
            <p className="text-lg font-bold text-[#ecfdf5]">35%</p>
          </div>
          <div>
            <p className="text-[#ecfdf5]/60">National Programs</p>
            <p className="text-lg font-bold text-[#ecfdf5]">25%</p>
          </div>
          <div>
            <p className="text-[#ecfdf5]/60">ODA & Climate Finance</p>
            <p className="text-lg font-bold text-[#ecfdf5]">30%</p>
          </div>
          <div>
            <p className="text-[#ecfdf5]/60">Private/PPP/Islamic Finance</p>
            <p className="text-lg font-bold text-[#ecfdf5]">10%</p>
          </div>
        </div>
      </div>

      {/* Phase Budgets */}
      <div className="space-y-6">
        {phaseBudgets.map((phase, idx) => (
          <div key={idx} className="p-6 rounded-lg border border-[#C9A84C]/20 bg-[#011a12]/40">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-[#ecfdf5]">{phase.phase}</h3>
                  <Badge variant="outline" className="text-xs">{phase.timeframe}</Badge>
                </div>
                <p className="text-sm text-[#ecfdf5]/70 mb-3">
                  <span className="font-semibold">Focus:</span> {phase.focus}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#C9A84C]">{phase.budget}</span>
                  <div className="flex-1">
                    <Progress value={(phase.budgetNum / totalBudget) * 100} className="h-2" />
                  </div>
                  <span className="text-sm text-[#ecfdf5]/60">
                    {Math.round((phase.budgetNum / totalBudget) * 100)}% of total
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-[#ecfdf5] mb-2">Key Deliverables:</p>
              <ul className="space-y-1">
                {phase.deliverables.map((deliverable, dIdx) => (
                  <li key={dIdx} className="text-sm text-[#ecfdf5]/70 flex items-start">
                    <span className="text-[#C9A84C] mr-2">▸</span>
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Question 9.1 - Budget Assessment */}
      <FormField
        control={form.control}
        name="q9_1_budget"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold text-[#ecfdf5]">
                9.1 Budget Realism Assessment
              </CardTitle>
              <CardDescription className="text-[#ecfdf5]/70 text-sm">
                Based on BARMM's fiscal capacity, ODA availability, and private investment potential, how realistic is the proposed ₱120-160B budget?
              </CardDescription>
            </CardHeader>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {[
                  { value: "realistic", label: "Realistic", desc: "Well-calibrated to fiscal capacity" },
                  { value: "underestimated", label: "Underestimated", desc: "May require additional resources" },
                  { value: "overestimated", label: "Overestimated", desc: "Exceeds realistic capacity" },
                  { value: "unable", label: "Unable to Assess", desc: "Insufficient information" }
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      field.value === option.value
                        ? "border-[#C9A84C] bg-[#C9A84C]/10"
                        : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`q9_1-${option.value}`}
                      className="text-[#C9A84C] border-[#C9A84C]/50 mb-2"
                    />
                    <FormLabel htmlFor={`q9_1-${option.value}`} className="cursor-pointer">
                      <div className="font-semibold text-[#ecfdf5]">{option.label}</div>
                      <div className="text-sm text-[#ecfdf5]/60">{option.desc}</div>
                    </FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Key Targets Summary */}
      <div className="p-6 rounded-lg border border-[#C9A84C]/20 bg-[#011a12]/40">
        <h3 className="text-lg font-bold text-[#ecfdf5] mb-4">Terminal Targets (2035)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">GRDP Target</p>
            <p className="text-2xl font-bold text-[#C9A84C]">₱550B+</p>
          </div>
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">Annual Investment</p>
            <p className="text-2xl font-bold text-[#C9A84C]">₱15B+</p>
          </div>
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">Export Revenue</p>
            <p className="text-2xl font-bold text-[#C9A84C]">₱40B+</p>
          </div>
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">Poverty Incidence</p>
            <p className="text-2xl font-bold text-[#C9A84C]">&lt;20%</p>
          </div>
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">Halal MSMEs</p>
            <p className="text-2xl font-bold text-[#C9A84C]">5,000+</p>
          </div>
          <div className="p-4 rounded bg-[#C9A84C]/5 border border-[#C9A84C]/20">
            <p className="text-sm text-[#ecfdf5]/60">Green Revenue</p>
            <p className="text-2xl font-bold text-[#C9A84C]">₱500M/yr</p>
          </div>
        </div>
      </div>
    </div>
  );
}
