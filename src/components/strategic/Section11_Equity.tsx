// src/components/strategic/Section11_Equity.tsx
import { useFormContext } from "react-hook-form";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export function Section11_Equity() {
  const form = useFormContext();

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">11. Provincial Equity & Inclusion</CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          Mainland provinces (Maguindanao del Norte, Lanao del Sur) are growing at 4.1%–5.0%, while archipelagic provinces (Tawi-Tawi, Sulu, Basilan) lag at 1.1%–1.6%. This "Success to the Successful" dynamic requires targeted intervention.
        </CardDescription>
      </CardHeader>

      <FormField
        control={form.control}
        name="q11_1"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              11.1 Should BARMM implement affirmative investment policies (e.g., minimum 30% infrastructure budget for lagging provinces)?
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                {[
                  "Yes, essential for inclusive development",
                  "Yes, but with strict performance conditions",
                  "Neutral / Needs further study",
                  "No, market-driven allocation is more efficient"
                ].map((option) => (
                  <div key={option} className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${field.value === option ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"}`}>
                    <RadioGroupItem value={option} id={`q11_1-${option}`} className="text-[#C9A84C] border-[#C9A84C]/50" />
                    <FormLabel htmlFor={`q11_1-${option}`} className="flex-1 cursor-pointer text-[#ecfdf5]/90 font-normal">{option}</FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q11_2"
        render={() => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              11.2 Which mechanisms would most effectively reduce provincial disparities? (Select all that apply)
            </FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "satellite_bboi", label: "Satellite BBOI offices in Jolo, Bongao, Lamitan" },
                { id: "bridge_infra", label: "Accelerate Bongao & Basilan-Zamboanga Bridges" },
                { id: "affirmative_budget", label: "Mandatory 30% budget for archipelagic provinces" },
                { id: "cold_chain", label: "Cold chain facilities for island fisheries/seaweed" }
              ].map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="q11_2"
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
    </div>
  );
}
