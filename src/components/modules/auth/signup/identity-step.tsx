"use client";

import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "./types";

export function IdentityStep({ form, isLoading }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
      <form.Field name="firstName">
        {(field) => (
          <div className="space-y-2 col-span-1">
            <Label
              htmlFor={field.name}
              className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
            >
              First name
            </Label>
            <Input
              id={field.name}
              placeholder="John"
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
      <form.Field name="lastName">
        {(field) => (
          <div className="space-y-2 col-span-1">
            <Label
              htmlFor={field.name}
              className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1"
            >
              Last name
            </Label>
            <Input
              id={field.name}
              placeholder="Doe"
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
