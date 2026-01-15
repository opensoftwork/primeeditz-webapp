"use client";

import React from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface DateVenueFieldsProps {
  form: any;
}

export function DateVenueFields({ form }: DateVenueFieldsProps) {
  return (
    <>
      {/* Event Date */}
      <form.Field
        name="eventDate"
        children={(field: any) => {
          return (
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Event Date (Optional)
              </FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-black uppercase tracking-wider rounded-xl border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 px-4",
                        !field.state.value && "text-white/20"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-white/10" />
                      <span className="text-[15px]">
                        {field.state.value
                          ? format(field.state.value, "PPP")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-background border-white/10 rounded-2xl shadow-2xl"
                    align="start"
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

      {/* Venue */}
      <form.Field
        name="venue"
        children={(field: any) => {
          return (
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Venue (Optional)
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <MapPin className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="venue"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Grand Ballroom"
                    className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                  />
                </InputGroup>
              </FieldContent>
            </Field>
          );
        }}
      />
    </>
  );
}
