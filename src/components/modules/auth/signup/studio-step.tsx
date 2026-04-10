"use client";

import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { StepProps } from "./types";

export function StudioStep({ form, isLoading }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2 col-span-2">
            <Label
              htmlFor={field.name}
              className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
            >
              Phone Number
            </Label>
            <PhoneInput
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(v) => field.handleChange(v)}
              placeholder="98765 43210"
              className="bg-[#0A0A0C] border-white/5 text-white h-12 rounded-xl focus:ring-1 focus:ring-indigo-500/50 w-full"
              disabled={isLoading}
              showValidation={true}
              error={
                Array.isArray(field.state.meta.errors) &&
                field.state.meta.errors.length > 0
                  ? typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : field.state.meta.errors[0] &&
                      typeof field.state.meta.errors[0] === "object" &&
                      "message" in field.state.meta.errors[0]
                      ? (field.state.meta.errors[0] as { message: string }).message
                      : "Invalid input"
                  : undefined
              }
            />
          </div>
        )}
      </form.Field>
      <form.Field name="company">
        {(field) => (
          <div className="space-y-2 col-span-2">
            <Label
              htmlFor={field.name}
              className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
            >
              Studio Name
            </Label>
            <Input
              id={field.name}
              placeholder="Prime Editz"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="bg-[#0A0A0C] border-white/5 text-white h-12 rounded-xl focus:ring-1 focus:ring-indigo-500/50 font-medium text-xs placeholder:text-white/10"
              disabled={isLoading}
            />
            <FieldError
              errors={field.state.meta.errors}
              className="text-red-500/80 text-[10px] ml-1 mt-1 font-bold uppercase tracking-[0.05em]"
            />
          </div>
        )}
      </form.Field>
    </div>
  );
}
