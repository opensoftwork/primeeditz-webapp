"use client";

import React from "react";
import { User, Tag } from "lucide-react";
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

interface ClientEventFieldsProps {
  form: any;
}

export function ClientEventFields({ form }: ClientEventFieldsProps) {
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
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                End Client Name <span className="text-primary ml-1.5">*</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <User className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="endClientName"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g., John & Jane"
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
