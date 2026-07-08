// src/components/strategic/Section8_StrategicOptions.tsx
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function Section8_StrategicOptions() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-[#C9A84C] mb-2">8. Strategic Options & Roadmap Strategy</h2>
        <p className="text-[#ecfdf5]/70 text-sm">Select the most viable pathway for BARMM's 2035 vision.</p>
      </div>

      <FormField
        control={form.control}
        name="q8_1_strategy"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { val: "heds", label: "HEDS", desc: "Halal Economy Dominance", badge: "Identity Focus" },
                  { val: "gems", label: "GEMS", desc: "Green Economy Monetization", badge: "Sustainability Focus" },
                  { val: "ifes", label: "IFES", desc: "Infrastructure-First", badge: "Feasibility Focus" },
                  { val: "ieds", label: "IEDS", desc: "Integrated Ecosystem", badge: "Recommended" },
                ].map((opt) => (
                  <Card key={opt.val} className={`border transition-all cursor-pointer ${field.value === opt.val ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50'}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <RadioGroupItem value={opt.val} id={opt.val} className="mt-1 text-[#C9A84C] border-[#C9A84C]/50" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FormLabel htmlFor={opt.val} className="text-[#ecfdf5] font-bold cursor-pointer">{opt.label}</FormLabel>
                          <Badge variant="outline" className="text-[10px] border-[#C9A84C]/40 text-[#C9A84C]">{opt.badge}</Badge>
                        </div>
                        <p className="text-xs text-[#ecfdf5]/60">{opt.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="bg-[#C9A84C]/20" />

      <FormField
        control={form.control}
        name="q8_2_sequencing"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-[#ecfdf5] font-semibold">8.2 Coherent Sequencing Logic Assessment</FormLabel>
            <Alert className="bg-[#011a12]/60 border-[#C9A84C]/20 text-[#ecfdf5]/80">
              <AlertTriangle className="h-4 w-4 text-[#C9A84C]" />
              <AlertDescription className="text-xs">
                IEDS relies on: <strong>Phase 1 (Enablers)</strong> → <strong>Phase 2 (Transformers)</strong> → <strong>Phase 3 (Connectors)</strong>.
              </AlertDescription>
            </Alert>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2">
                {["highly_logical", "mostly_logical", "needs_adjustment", "flawed"].map((val) => (
                  <Card key={val} className={`border cursor-pointer p-3 text-center text-sm ${field.value === val ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]' : 'border-[#C9A84C]/20 text-[#ecfdf5]/60'}`}>
                    <RadioGroupItem value={val} id={val} className="sr-only" />
                    <FormLabel htmlFor={val} className="cursor-pointer capitalize font-medium">{val.replace('_', ' ')}</FormLabel>
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Deep Context via Accordion */}
      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value="archetypes" className="border-[#C9A84C]/20">
          <AccordionTrigger className="text-[#C9A84C] hover:no-underline text-sm font-serif">
            🐘 Systems Archetypes Context (Why Sequencing Matters)
          </AccordionTrigger>
          <AccordionContent className="text-[#ecfdf5]/70 text-xs space-y-2 pt-2">
            <p><strong className="text-[#E8C560]">Limits to Growth:</strong> Scaling Transformers without Enablers (ZBIP, Roads) causes a plateau.</p>
            <p><strong className="text-[#E8C560]">Fixes that Fail:</strong> Incentives without BHB capacity building lead to investor flight.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
