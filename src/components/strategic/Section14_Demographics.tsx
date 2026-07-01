// src/components/strategic/Section14_Demographics.tsx
import { useFormContext } from "react-hook-form";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function Section14_Demographics() {
  const form = useFormContext();

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">14. Respondent Profile</CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          To ensure all sectors of the BEIE are proportionally represented in the validation, please provide your demographic context. (Data is anonymized in reporting).
        </CardDescription>
      </CardHeader>

      <FormField
        control={form.control}
        name="demo_category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">14.1 Which category best describes your role?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-[#011a12]/40 border-[#C9A84C]/30 text-[#ecfdf5]">
                  <SelectValue placeholder="Select Category..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#022c22] border-[#C9A84C]/30 text-[#ecfdf5]">
                <SelectItem value="gov">Bangsamoro Government Official</SelectItem>
                <SelectItem value="lgu">Local Government Unit (LGU)</SelectItem>
                <SelectItem value="private">Private Sector / Investor</SelectItem>
                <SelectItem value="cs">Civil Society Organization</SelectItem>
                <SelectItem value="academe">Academic / Researcher</SelectItem>
                <SelectItem value="dev">Development Partner / Donor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="demo_province"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">14.2 Which province/area do you primarily represent?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-[#011a12]/40 border-[#C9A84C]/30 text-[#ecfdf5]">
                  <SelectValue placeholder="Select Province..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#022c22] border-[#C9A84C]/30 text-[#ecfdf5]">
                <SelectItem value="ldn">Lanao del Norte</SelectItem>
                <SelectItem value="lds">Lanao del Sur</SelectItem>
                <SelectItem value="mdn">Maguindanao del Norte</SelectItem>
                <SelectItem value="mds">Maguindanao del Sur</SelectItem>
                <SelectItem value="bas">Basilan</SelectItem>
                <SelectItem value="sul">Sulu</SelectItem>
                <SelectItem value="taw">Tawi-Tawi</SelectItem>
                <SelectItem value="sga">Special Geographic Area (SGA)</SelectItem>
                <SelectItem value="cot">Cotabato City</SelectItem>
                <SelectItem value="reg">Regional / BARMM-wide</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="demo_expertise"
        render={() => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">14.3 What is your primary area of expertise? (Select up to 3)</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "aff", label: "Agriculture/Fisheries/Forestry" },
                { id: "halal", label: "Halal Industry / Manufacturing" },
                { id: "infra", label: "Infrastructure / Energy" },
                { id: "finance", label: "Islamic Finance / Banking" },
                { id: "trade", label: "Trade / BIMP-EAGA" },
                { id: "gov", label: "Governance / Policy" }
              ].map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="demo_expertise"
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
