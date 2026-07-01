// src/components/strategic/Section8_StrategicOptions.tsx
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Section8_StrategicOptions() {
  const form = useFormContext();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-primary">8. Strategic Options & Roadmap Strategy</CardTitle>
        <CardDescription>
          The BIRD framework evaluates four strategic pathways. The <strong>Integrated Ecosystem Development Strategy (IEDS)</strong> is recommended for its perfect systems leverage (10.0/10) and ability to synchronize all BEIE clusters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Q8.1: Strategic Option Selection */}
        <FormField
          control={form.control}
          name="q8_1"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">8.1 Which strategic option do you believe is most suitable for BARMM's 2035 vision?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="heds" id="heds" />
                    <FormLabel htmlFor="heds" className="flex-1 cursor-pointer font-normal">
                      <strong>Option 1: HEDS</strong> - Halal Economy Dominance Strategy (Focus on certification & GCC corridors)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="gems" id="gems" />
                    <FormLabel htmlFor="gems" className="flex-1 cursor-pointer font-normal">
                      <strong>Option 2: GEMS</strong> - Green Economy Monetization Strategy (Focus on carbon markets & PES)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="ifes" id="ifes" />
                    <FormLabel htmlFor="ifes" className="flex-1 cursor-pointer font-normal">
                      <strong>Option 3: IFES</strong> - Infrastructure-First Enabling Strategy (Focus on binding constraints)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border-2 border-primary/50 bg-primary/5 p-3 cursor-pointer">
                    <RadioGroupItem value="ieds" id="ieds" />
                    <FormLabel htmlFor="ieds" className="flex-1 cursor-pointer font-normal">
                      <strong>Option 4: IEDS (Recommended)</strong> - Integrated Ecosystem Development Strategy (Synchronized cluster activation)
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Q8.2: Sequencing Logic */}
        <FormField
          control={form.control}
          name="q8_2"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">8.2 How logical is the proposed 3-phase sequencing? (Phase 1: Enablers/Governance → Phase 2: Transformers/Green → Phase 3: Connectors/Global)</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'highly_logical', label: 'Highly Logical & Feasible' },
                    { value: 'mostly_logical', label: 'Mostly Logical' },
                    { value: 'needs_adjustment', label: 'Needs Adjustment' },
                    { value: 'flawed', label: 'Flawed / Unrealistic' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={option.value} id={`seq-${option.value}`} />
                      <FormLabel htmlFor={`seq-${option.value}`} className="flex-1 cursor-pointer font-normal">
                        {option.label}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
