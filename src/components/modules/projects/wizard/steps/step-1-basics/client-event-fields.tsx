"use client";

import { User, Tag, Lock, Info, Sparkles } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { WizardMode, ClientSelectionMode } from "../../types";

interface ClientEventFieldsProps {
  form: any;
  mode?: WizardMode;
  isClientSelectedOrNew?: boolean;
  selectionMode?: ClientSelectionMode;
}

export function ClientEventFields({
  form,
  mode = "client",
  isClientSelectedOrNew = false,
  selectionMode = null,
}: ClientEventFieldsProps) {
  const isEndClientReadOnly = mode === "admin" && isClientSelectedOrNew;

  return (
    <>
      {/* End Client Name */}
      <form.Field
        name="endClientName"
        validators={{
          onChange: ({ value }: { value: string }) =>
            !value || value.length < 2
              ? "Client name must be at least 2 characters"
              : undefined,
        }}
        children={(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <Field data-invalid={isInvalid}>
              <div className="flex items-center justify-between mb-3">
                <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
                  End Client Name{" "}
                  {!isEndClientReadOnly && (
                    <span className="text-primary ml-1.5">*</span>
                  )}
                </FieldLabel>

                {/* Status Badges */}
                {mode === "admin" && selectionMode === "new" && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                      New Client Profile
                    </span>
                  </div>
                )}
                {mode === "admin" && selectionMode === "existing" && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    <Lock className="h-3 w-3 text-white/40" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                      Pre-filled from Profile
                    </span>
                  </div>
                )}
              </div>

              <FieldContent>
                <InputGroup
                  className={cn(
                    "bg-white/3 border-white/10 transition-all duration-500 rounded-xl h-12",
                    !isEndClientReadOnly && "focus-within:border-primary/40",
                    isEndClientReadOnly && "bg-white/[0.01] border-dashed"
                  )}
                >
                  <InputGroupAddon align="inline-start" className="pl-4">
                    {isEndClientReadOnly ? (
                      <Lock className="h-4 w-4 text-white/20" />
                    ) : (
                      <User className="h-4 w-4 text-white/10" />
                    )}
                  </InputGroupAddon>
                  <InputGroupInput
                    id="endClientName"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    readOnly={isEndClientReadOnly}
                    disabled={isEndClientReadOnly}
                    placeholder="e.g., John & Jane"
                    className={cn(
                      "text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10",
                      isEndClientReadOnly && "text-white/40 cursor-not-allowed"
                    )}
                  />
                </InputGroup>

                {/* Info Messages */}
                {mode === "admin" && selectionMode === "none" && (
                  <div className="mt-3 flex items-start gap-2 text-amber-400/60 bg-amber-400/5 p-3 rounded-lg border border-amber-400/10">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-medium">
                      No client profile will be associated with this project.
                    </p>
                  </div>
                )}

                {isInvalid && !isEndClientReadOnly && (
                  <FieldError className="mt-2 ml-1">
                    {field.state.meta.errors.join(", ")}
                  </FieldError>
                )}
              </FieldContent>
            </Field>
          );
        }}
      />

      {/* Event Name */}
      <form.Field
        name="eventName"
        validators={{
          onChange: ({ value }: { value: string }) =>
            !value || value.length < 2
              ? "Event name must be at least 2 characters"
              : undefined,
        }}
        children={(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Event Name <span className="text-primary ml-1.5">*</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <Tag className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="eventName"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g., Smith Wedding"
                    className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                  />
                </InputGroup>
                {isInvalid && (
                  <FieldError className="mt-2 ml-1">
                    {field.state.meta.errors.join(", ")}
                  </FieldError>
                )}
              </FieldContent>
            </Field>
          );
        }}
      />
    </>
  );
}
