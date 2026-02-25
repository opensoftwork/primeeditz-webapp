"use client";

import {
  AlertCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { useRequestWizard } from "../../request-wizard-context";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function Step2Details() {
  const { formData, setFormData } = useRequestWizard();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20"
    >
      <div className="mb-8 space-y-1">
        <h2 className="text-xl font-black tracking-tight uppercase text-white">
          Project Details
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Configure parameters for this production request
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {/* End Client Name */}
        <Field className="space-y-3">
          <FieldLabel
            htmlFor="endClientName"
            className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center"
          >
            End Client Identity <span className="text-primary ml-1.5">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 transition-all duration-500 rounded-xl h-12 focus-within:border-primary/40">
              <InputGroupAddon align="inline-start" className="pl-4">
                <User className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="endClientName"
                value={formData.endClientName}
                onChange={(e) => updateField("endClientName", e.target.value)}
                placeholder="e.g. Rahul & Priya"
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Event Name */}
        <Field className="space-y-3">
          <FieldLabel
            htmlFor="eventName"
            className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center"
          >
            Event Name
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 transition-all duration-500 rounded-xl h-12 focus-within:border-primary/40">
              <InputGroupAddon align="inline-start" className="pl-4">
                <Tag className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="eventName"
                value={formData.eventName}
                onChange={(e) => updateField("eventName", e.target.value)}
                placeholder="e.g. Grand Wedding Reception"
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Event Date */}
        <Field className="space-y-3">
          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
            Event Date
          </FieldLabel>
          <FieldContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 bg-white/3 border-white/10 rounded-xl justify-start text-left font-black uppercase tracking-wider text-[15px] hover:bg-white/5 hover:text-white hover:border-white/20",
                    !formData.eventDate && "text-white/10",
                  )}
                >
                  <Calendar className="mr-3 h-4 w-4 opacity-50" />
                  {formData.eventDate ? (
                    format(new Date(formData.eventDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-zinc-950 border-white/10 rounded-xl"
                align="start"
              >
                <div className="p-3 border-b border-white/5 bg-white/2">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40 text-center">
                    Select Date
                  </h4>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={
                    formData.eventDate
                      ? new Date(formData.eventDate)
                      : undefined
                  }
                  onSelect={(date) =>
                    updateField(
                      "eventDate",
                      date ? date.toISOString().split("T")[0] : "",
                    )
                  }
                  initialFocus
                  className="bg-transparent"
                />
              </PopoverContent>
            </Popover>
          </FieldContent>
        </Field>

        {/* Venue */}
        <Field className="space-y-3">
          <FieldLabel
            htmlFor="venue"
            className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center"
          >
            Venue / Location
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 transition-all duration-500 rounded-xl h-12 focus-within:border-primary/40">
              <InputGroupAddon align="inline-start" className="pl-4">
                <MapPin className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="venue"
                value={formData.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                placeholder="e.g. Taj Lands End, Mumbai"
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Technical Requirements */}
        <Field className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="notes"
              className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center"
            >
              Technical Requirements & Notes
            </FieldLabel>
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-primary/60 uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
              <AlertCircle className="h-2.5 w-2.5" />
              <span>Optional</span>
            </div>
          </div>
          <div className="relative group/input">
            <div className="absolute left-4 top-4 text-white/10 group-focus-within/input:text-primary transition-colors">
              <FileText className="h-4 w-4" />
            </div>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Specify scope, special deliverables, raw footage handling, or strict deadlines..."
              className="pl-11 py-4 min-h-[140px] bg-white/3 border-white/10 rounded-xl font-medium text-white text-sm leading-relaxed focus:border-primary/40 transition-all outline-none resize-none placeholder:text-white/10 shadow-inner"
            />
          </div>
        </Field>
      </FieldGroup>
    </motion.div>
  );
}
