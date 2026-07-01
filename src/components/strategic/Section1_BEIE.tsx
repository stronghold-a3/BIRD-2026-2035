// src/components/strategic/Section1_BEIE.tsx
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
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Section1_BEIE() {
  const form = useFormContext();

  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-serif text-[#C9A84C]">
          1. The BEIE Framework Context
        </CardTitle>
        <CardDescription className="text-[#ecfdf5]/70 text-base mt-2">
          The Bangsamoro Economic and Investment Ecosystem (BEIE) Framework organizes the region into five functional clusters anchored by Moral Governance.
        </CardDescription>
      </CardHeader>

      {/* Video Embed Placeholder */}
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#C9A84C]/30 bg-black/40">
        <iframe 
          className="w-full h-full" 
          src="https://www.youtube.com/embed/0J491Vqya_4" 
          title="BEIE Framework Video" 
          allowFullScreen 
        />
      </div>

      {/* Question 1.1 */}
      <FormField
        control={form.control}
        name="q1_1"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              1.1 How well do you understand the BEIE Framework after watching the video?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {["Very Well", "Well", "Moderately", "Slightly", "Not at All"].map((option) => (
                  <div
                    key={option}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer
                      ${field.value === option ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"}`}
                  >
                    <RadioGroupItem value={option} id={`q1_1-${option}`} className="text-[#C9A84C] border-[#C9A84C]/50" />
                    <FormLabel htmlFor={`q1_1-${option}`} className="flex-1 cursor-pointer text-[#ecfdf5]/90 font-normal">
                      {option}
                    </FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Question 1.2 */}
      <FormField
        control={form.control}
        name="q1_2"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-[#ecfdf5] text-lg font-semibold">
              1.2 How relevant is this five-cluster framework to BARMM's development needs?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {["Highly Relevant", "Relevant", "Moderately Relevant", "Slightly Relevant", "Not Relevant"].map((option) => (
                  <div
                    key={option}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer
                      ${field.value === option ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-[#C9A84C]/20 bg-[#011a12]/40 hover:border-[#C9A84C]/50"}`}
                  >
                    <RadioGroupItem value={option} id={`q1_2-${option}`} className="text-[#C9A84C] border-[#C9A84C]/50" />
                    <FormLabel htmlFor={`q1_2-${option}`} className="flex-1 cursor-pointer text-[#ecfdf5]/90 font-normal">
                      {option}
                    </FormLabel>
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
