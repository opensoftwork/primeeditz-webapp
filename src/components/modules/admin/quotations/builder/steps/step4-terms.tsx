/**
 * Quotation Builder Step 4: Terms & Conditions
 *
 * Enter terms of service and finalize the quotation.
 */

"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { motion } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { useQuotationBuilder } from "../quotation-builder-context";

export function Step4Terms() {
  const { formData, setFormData, saveQuotation, setSubmitTrigger } =
    useQuotationBuilder();

  const step4Data = formData.step4;

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      terms: step4Data.terms,
    },
    onSubmit: async ({ value }) => {
      setFormData("step4", { terms: value.terms });
      await saveQuotation();
    },
  });

  // Register submit trigger for the global footer
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="w-full flex flex-col h-full"
    >
      <div className="flex-1">
        <div className="mb-8 space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Terms & Conditions
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Define the legal terms for this quotation
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-1 rounded-3xl bg-white/2 border border-white/5"
        >
          <div className="p-8 space-y-6">
            <FieldSet className="border-none p-0">
              <FieldGroup className="space-y-6">
                <form.Field
                  name="terms"
                  children={(field) => (
                    <Field>
                      <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3">
                        Terms of Service
                      </FieldLabel>
                      <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest mb-4 italic">
                        Specify payment milestones, cancellation policy, etc.
                      </FieldDescription>
                      <FieldContent>
                        <Textarea
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setFormData("step4", { terms: e.target.value });
                          }}
                          placeholder="Payment milestones, cancellation policy, etc..."
                          className="min-h-[300px] bg-white/5 border-white/5 rounded-2xl p-6 text-white text-sm leading-relaxed focus:ring-primary/20 resize-none"
                        />
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </div>
        </motion.div>
      </div>
    </form>
  );
}
