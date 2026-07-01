// src/components/strategic/Section13_Policy.tsx
import { useFormContext } from "react-hook-form";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export function Section13_Policy() {
  const form = useFormContext();

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">13. Policy & Governance Recommendations</CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          Fragmented program delivery across BMOAs is a systemic bottleneck. The BIRD roadmap proposes the Bangsamoro Investment Command Center (BICC) and specific enabling laws to synchronize execution.
        </CardDescription>
      </CardHeader>

      <FormField
        control={form.control}
        name="q13_1"
        render={() => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              13.1 Which enabling laws/policies should receive the highest priority? (Select top 2)
            </FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "forestry_code", label: "Bangsamoro Forestry Code (Unlocks carbon/PES markets)" },
                { id: "jmc_2026", label: "JMC No. 2026-01 (Carbon Credits & Eco-tourism Fees)" },
                { id: "bicc_est", label: "BICC Establishment (Cross-agency coordination)" },
                { id: "digital_gov", label: "Digital Governance & Connectivity Act" }
              ].map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="q13_1"
                  render={({ field }) => (
                    <FormItem key={item.id} className={`flex flex-row items-start space-x-3 space-y-0 p-4 rounded-lg border transition-all cursor-pointer ${field.value?.includes(item.id) ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"}`}>
                      <FormControl>
                        <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value: string) => value !== item.id))} className="border-[#C9A84C]/50 data-[state=checked]:bg-[#C9A84C] data-[state=checked]:border-[#C9A84C]" />
                      </FormControl>
                      <FormLabel className="text-[#ecfdf5]/90 font-normal cursor-pointer">{item.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q13_2"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              13.2 How effective will the Bangsamoro Investment Command Center (BICC) be in synchronizing programs across ministries?
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                {[
                  "Highly Effective (Essential to prevent 'Tragedy of the Commons')",
                  "Moderately Effective (Depends on political will and funding)",
                  "Limited Effectiveness (Adds another bureaucratic layer)",
                  "Ineffective (Ministries will continue operating in silos)"
                ].map((option) => (
                  <div key={option} className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${field.value === option ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"}`}>
                    <RadioGroupItem value={option} id={`q13_2-${option}`} className="text-[#C9A84C] border-[#C9A84C]/50" />
                    <FormLabel htmlFor={`q13_2-${option}`} className="flex-1 cursor-pointer text-[#ecfdf5]/90 font-normal">{option}</FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
