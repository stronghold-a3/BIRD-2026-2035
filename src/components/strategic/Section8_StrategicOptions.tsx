// src/components/strategic/Section8_StrategicOptions.tsx
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

export function Section8_StrategicOptions() {
  const form = useFormContext();
  
  const strategicOptions = [
    {
      value: "heds",
      label: "HEDS - Halal Economy Dominance Strategy",
      budget: "₱45-60B",
      grdp: "₱150-200B",
      description: "Leverage halal legitimacy to capture share of USD 2.3T global halal market",
      pros: ["Highest identity alignment (9.5/10)", "Strong economic impact", "First-mover advantage"],
      cons: ["Moderate feasibility (7.0/10)", "High competitive vulnerability", "Limited systems leverage"],
      rank: "2nd",
      score: "7.61"
    },
    {
      value: "gems",
      label: "GEMS - Green Economy Monetization Strategy",
      budget: "₱35-50B",
      grdp: "₱80-120B",
      description: "Transform environmental endowments into revenue via carbon markets, PES, eco-tourism",
      pros: ["Highest sustainability (9.0/10)", "Strong systems leverage (8.5/10)", "Recurring revenue streams"],
      cons: ["Lowest feasibility (6.0/10)", "Moderate economic impact", "Market volatility risk"],
      rank: "4th",
      score: "7.16"
    },
    {
      value: "ifes",
      label: "IFES - Infrastructure-First Enabling Strategy",
      budget: "₱80-110B",
      grdp: "₱200-280B",
      description: "Prioritize removal of binding infrastructure and human capital constraints",
      pros: ["Highest feasibility (6.5/10)", "Strongest systems leverage (9.0/10)", "High inclusivity"],
      cons: ["Moderate identity alignment", "High fiscal burden", "Extended payback horizon"],
      rank: "3rd",
      score: "7.48"
    },
    {
      value: "ieds",
      label: "IEDS - Integrated Ecosystem Development Strategy (RECOMMENDED)",
      budget: "₱120-160B",
      grdp: "₱550B+",
      description: "Synchronized activation of all BEIE clusters with coherent sequencing logic",
      pros: ["Perfect systems leverage (10.0/10)", "Highest economic impact (9.5/10)", "Addresses all 5 archetypes"],
      cons: ["Lowest feasibility (5.5/10)", "Highest execution risk", "Demands unprecedented coordination"],
      rank: "1st",
      score: "8.93",
      recommended: true
    }
  ];

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">
          8. Strategic Options and the Roadmap Strategy
        </CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          Four distinct strategic pathways evaluated through multi-criteria analysis aligned with BARMM's development mandate.
        </CardDescription>
      </CardHeader>

      {/* Strategic Options Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategicOptions.map((option) => (
          <FormField
            key={option.value}
            control={form.control}
            name="q8_1_strategy"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    onClick={() => field.onChange(option.value)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      field.value === option.value
                        ? option.recommended
                          ? "border-[#C9A84C] bg-[#C9A84C]/10"
                          : "border-[#C9A84C]/50 bg-[#C9A84C]/5"
                        : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <FormLabel className={`text-lg font-bold ${
                          option.recommended ? "text-[#C9A84C]" : "text-[#ecfdf5]"
                        }`}>
                          {option.label}
                          {option.recommended && (
                            <Badge className="ml-2 bg-[#C9A84C] text-black">RECOMMENDED</Badge>
                          )}
                        </FormLabel>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Budget: {option.budget}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            GRDP: {option.grdp}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Rank: {option.rank} (Score: {option.score})
                          </Badge>
                        </div>
                      </div>
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="text-[#C9A84C] border-[#C9A84C]/50"
                      />
                    </div>
                    
                    <p className="text-sm text-[#ecfdf5]/70 mb-3">{option.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-emerald-400 font-semibold mb-1">Strengths:</p>
                        <ul className="space-y-1">
                          {option.pros.map((pro, idx) => (
                            <li key={idx} className="text-[#ecfdf5]/60">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-amber-400 font-semibold mb-1">Challenges:</p>
                        <ul className="space-y-1">
                          {option.cons.map((con, idx) => (
                            <li key={idx} className="text-[#ecfdf5]/60">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>

      {/* Question 8.2 - Sequencing Logic */}
      <FormField
        control={form.control}
        name="q8_2_sequencing"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold text-[#ecfdf5]">
                8.2 IEDS Sequencing Logic Assessment
              </CardTitle>
              <CardDescription className="text-[#ecfdf5]/70 text-sm">
                The IEDS employs a three-phase sequencing: Phase 1 (Enablers & Governance) → Phase 2 (Transformers & Green Economy) → Phase 3 (Connectors & Global Integration)
              </CardDescription>
            </CardHeader>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {[
                  { value: "highly_logical", label: "Highly Logical", desc: "Perfect alignment with BEIE framework" },
                  { value: "mostly_logical", label: "Mostly Logical", desc: "Minor adjustments needed" },
                  { value: "needs_adjustment", label: "Needs Adjustment", desc: "Significant revisions required" },
                  { value: "flawed", label: "Flawed", desc: "Fundamental redesign needed" }
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
                      id={`q8_2-${option.value}`}
                      className="text-[#C9A84C] border-[#C9A84C]/50 mb-2"
                    />
                    <FormLabel htmlFor={`q8_2-${option.value}`} className="cursor-pointer">
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

      {/* Question 8.3 - Comments */}
      <FormField
        control={form.control}
        name="q8_3_comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              8.3 Strategic Comments
            </FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full min-h-[120px] p-4 rounded-lg border border-[#C9A84C]/20 bg-[#011a12]/40 text-[#ecfdf5] placeholder:text-[#ecfdf5]/30 focus:border-[#C9A84C]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/50"
                placeholder="Share your insights on the strategic options, sequencing logic, or any recommendations for the investment roadmap..."
              />
            </FormControl>
            <FormDescription className="text-[#ecfdf5]/60 text-sm">
              Optional: Provide additional context or recommendations
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
