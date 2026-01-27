/**
 * New Studio Form Component
 * Form for creating a new studio during project wizard
 */

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useWizardForm } from "../../wizard-form-context";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import type { SelectedStudioData } from "../../types";

interface NewStudioFormProps {
  onSuccess: () => void;
}

export function NewStudioForm({ onSuccess }: NewStudioFormProps) {
  const { setFormData } = useWizardForm();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createStudioProfile = useMutation(
    api.functions.profiles.mutations.createDraftStudioProfile,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createStudioProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });

      // Create studio data for the wizard
      const studioData: SelectedStudioData = {
        _id: result.profileId,
        name: result.name,
        email: result.email,
        phone: result.phone,
        company: result.company,
        onboardingComplete: false,
        projectCount: 0,
        activeProjectCount: 0,
      };

      // Update wizard state
      setFormData("step0", {
        selectionMode: "new",
        studioId: result.profileId,
        studioData,
        isNewStudio: true,
      });

      toast.success("Studio profile created");
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create studio",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        {/* Name Field */}
        <Field>
          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
            Studio Name <span className="text-primary ml-1.5">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
              <InputGroupAddon align="inline-start" className="pl-4">
                <User className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="studio-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                required
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Email Field */}
        <Field>
          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
            Email <span className="text-primary ml-1.5">*</span>
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
              <InputGroupAddon align="inline-start" className="pl-4">
                <Mail className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="studio-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., studio@email.com"
                required
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Phone Field */}
        <Field>
          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
            Phone (Optional)
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
              <InputGroupAddon align="inline-start" className="pl-4">
                <Phone className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="studio-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +91 98765 43210"
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        {/* Company Field */}
        <Field>
          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
            Company (Optional)
          </FieldLabel>
          <FieldContent>
            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
              <InputGroupAddon align="inline-start" className="pl-4">
                <Building2 className="h-4 w-4 text-white/10" />
              </InputGroupAddon>
              <InputGroupInput
                id="studio-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
              />
            </InputGroup>
          </FieldContent>
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim()}
        className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded-xl"
      >
        {isSubmitting ? "Creating..." : "Create Studio"}
      </Button>
    </motion.form>
  );
}
