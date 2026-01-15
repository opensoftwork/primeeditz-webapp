"use client";

import React from "react";
import { format } from "date-fns";
import { MessageSquare, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DeliveryNotesFieldsProps {
  form: any;
}

export function DeliveryNotesFields({ form }: DeliveryNotesFieldsProps) {
  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
      {/* Additional Notes Field */}
      <form.Field
        name="additionalNotes"
        children={(field: any) => {
          return (
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Notes
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="additionalNotes"
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Any secondary instructions (Optional)..."
                  className="min-h-[120px] p-6 text-[15px] font-bold text-white bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl resize-none placeholder:text-white/10"
                />
              </FieldContent>
            </Field>
          );
        }}
      />

      {/* Preferred Delivery Date Field */}
      <form.Field
        name="preferredDeliveryDate"
        children={(field: any) => {
          return (
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Delivery Date
              </FieldLabel>
              <FieldContent className="flex flex-col h-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      className={cn(
                        "w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/4 hover:border-primary/20 transition-all duration-500 group",
                        field.state.value &&
                          "border-solid border-primary/20 bg-primary/5"
                      )}
                    >
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <CalendarIcon
                          className={cn(
                            "h-6 w-6",
                            field.state.value ? "text-primary" : "text-white/20"
                          )}
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <span
                          className={cn(
                            "block text-xs font-black uppercase tracking-widest transition-colors",
                            field.state.value ? "text-white" : "text-white/20"
                          )}
                        >
                          {field.state.value
                            ? format(field.state.value, "PPP")
                            : "Set Target Date"}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-background border-white/10 rounded-2xl shadow-2xl"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        field.state.value
                          ? new Date(field.state.value)
                          : undefined
                      }
                      onSelect={(date) =>
                        field.handleChange(date?.getTime() ?? null)
                      }
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </FieldContent>
            </Field>
          );
        }}
      />
    </div>
  );
}
