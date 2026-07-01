// src/components/strategic/Section10_IEDSMatrix.tsx
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

// Define the 7 criteria with their weights and descriptions
const criteria = [
  { key: 'economic_impact', label: 'Economic Impact', weight: '25%', desc: 'Contribution to ₱550B GRDP, job creation, and export revenue.' },
  { key: 'feasibility', label: 'Feasibility', weight: '20%', desc: 'Technical capacity, fiscal realism, and timeline realism.' },
  { key: 'identity_alignment', label: 'BARMM Identity', weight: '15%', desc: 'Alignment with Islamic values, cultural authenticity, and Moral Governance.' },
  { key: 'systems_leverage', label: 'Systems Leverage', weight: '15%', desc: 'Ability to activate high-leverage points and resolve systems archetypes.' },
  { key: 'risk_return', label: 'Risk-Return', weight: '10%', desc: 'Balance between expected returns and exposure to climate/political threats.' },
  { key: 'inclusivity', label: 'Inclusivity & Equity', weight: '10%', desc: 'Distribution of benefits across provinces, MSMEs, and marginalized groups.' },
  { key: 'sustainability', label: 'Sustainability', weight: '5%', desc: 'Environmental, fiscal, and institutional longevity beyond 2035.' },
];

// Define the 4 strategic options
const options = [
  { key: 'heds', name: 'Halal Economy Dominance (HEDS)', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  { key: 'gems', name: 'Green Economy Monetization (GEMS)', color: 'bg-green-500/10 text-green-700 border-green-200' },
  { key: 'ifes', name: 'Infrastructure-First (IFES)', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  { key: 'ieds', name: 'Integrated Ecosystem (IEDS)', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
];

export function Section10_IEDSMatrix() {
  const form = useFormContext();

  return (
    <TooltipProvider>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-primary">10. Strategic Options Evaluation Matrix</CardTitle>
          <CardDescription>
            Rate each strategic option on a scale of <strong>1 to 10</strong> across the 7 weighted criteria. This data feeds the Strat Planner Pro multi-criteria decision matrix to validate the IEDS recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {options.map((option) => (
            <div key={option.key} className={`rounded-lg border-2 p-4 md:p-6 ${option.color}`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                {option.name}
                {option.key === 'ieds' && <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">Recommended</Badge>}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {criteria.map((criterion) => (
                  <FormField
                    key={`${option.key}-${criterion.key}`}
                    control={form.control}
                    name={`q10_matrix.${option.key}.${criterion.key}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel className="text-xs font-semibold text-muted-foreground">
                            {criterion.label}
                          </FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{criterion.desc}</p>
                              <p className="text-xs font-bold mt-1">Weight: {criterion.weight}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            placeholder="1-10"
                            className="h-9 text-sm font-mono text-center"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-bold text-foreground mb-2">Scoring Methodology Note:</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The final composite score is calculated as: <code className="bg-background px-1 rounded">Total Score = Σ (Criterion Score × Weight)</code>. 
              A score of 10 represents perfect alignment with the criterion, while 1 represents poor alignment. 
              The Strat Planner Pro backend will automatically compute the weighted totals and verify the IEDS recommendation.
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
