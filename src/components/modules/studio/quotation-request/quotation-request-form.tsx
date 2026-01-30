"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { PackageSelector } from "./package-selector";
import { SelectedPackagesSummary } from "./selected-packages-summary";

const formSchema = z.object({
  selectedPackageIds: z
    .array(z.string())
    .min(1, "Please select at least one service package."),
  endClientName: z
    .string()
    .min(2, "Client name must be at least 2 characters."),
  eventName: z.string().default(""),
  eventDate: z.date().optional(),
  notes: z.string().default(""),
});

type FormValues = z.infer<typeof formSchema>;

export function QuotationRequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestQuotation = useMutation(
    api.functions.quotations.mutations.requestQuotation,
  );

  const form = useForm({
    defaultValues: {
      selectedPackageIds: [] as string[],
      endClientName: "",
      eventName: "",
      eventDate: undefined as Date | undefined,
      notes: "",
    },
    onSubmit: async ({ value }) => {
      const validation = formSchema.safeParse(value);
      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        return;
      }

      setIsSubmitting(true);
      try {
        const quotationId = await requestQuotation({
          selectedPackageIds:
            value.selectedPackageIds as Id<"servicePackages">[],
          endClientName: value.endClientName,
          eventName: value.eventName || undefined,
          eventDate: value.eventDate
            ? (value.eventDate as Date).getTime()
            : undefined,
          notes: value.notes || undefined,
        });

        toast.success("Quotation request submitted!");
        router.push(`/quotations/${quotationId}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to submit request",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-12 max-w-5xl mx-auto py-10"
    >
      {/* 1. Package Selection */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            1. Select Service Packages
          </h2>
          <p className="text-white/40 font-medium text-sm">
            Choose one or more packages for your project. Each package will
            create a separate project upon approval.
          </p>
        </div>

        <form.Field name="selectedPackageIds">
          {(field) => (
            <Field>
              <FieldContent>
                <PackageSelector
                  selectedIds={field.state.value as Id<"servicePackages">[]}
                  onSelectionChange={(ids) => field.handleChange(ids)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </div>

      <div className="grid gap-12 md:grid-cols-2 pt-10 border-t border-white/5">
        {/* 2. Project Details */}
        <div className="space-y-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              2. Project Details
            </h2>
            <p className="text-white/40 font-medium text-sm">
              Tell us a bit more about the client and the event.
            </p>
          </div>

          <form.Field name="endClientName">
            {(field) => (
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Client Name *
                </FieldLabel>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
                />
                <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                  Who is this project for?
                </FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="eventName">
            {(field) => (
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Event / Project Name
                </FieldLabel>
                <Input
                  placeholder="e.g. Annual Conference 2024"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="eventDate">
            {(field) => (
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Event Date
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 pl-3 text-left font-normal bg-white/5 border-white/5 hover:bg-white/10 rounded-xl transition-all shadow-inner",
                        !field.state.value && "text-white/20",
                      )}
                    >
                      {field.state.value ? (
                        format(field.state.value as Date, "PPP")
                      ) : (
                        <span className="text-[13px] font-bold uppercase tracking-widest">
                          Pick a date
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-zinc-950 border-white/10 rounded-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.state.value as Date}
                      onSelect={(date) => field.handleChange(date)}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Additional Notes
                </FieldLabel>
                <Textarea
                  placeholder="Tell us any specific requirements..."
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-32 rounded-xl text-sm transition-all p-4 shadow-inner"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        {/* 3. Summary */}
        <div className="space-y-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              3. Summary
            </h2>
            <p className="text-white/40 font-medium text-sm">
              Review your selection and project preview.
            </p>
          </div>

          <form.Subscribe
            selector={(state) => [state.values.selectedPackageIds]}
          >
            {([selectedIds]) => (
              <SelectedPackagesSummary
                selectedIds={selectedIds as Id<"servicePackages">[]}
              />
            )}
          </form.Subscribe>

          <div className="pt-6">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmittingFromState]) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    (isSubmittingFromState as boolean)
                  }
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[12px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Submit Quotation Request
                      <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  );
}
