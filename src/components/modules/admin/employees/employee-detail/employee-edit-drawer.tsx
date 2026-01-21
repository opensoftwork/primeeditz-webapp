"use client";

import { useState, useEffect } from "react";
import { User, Phone, Building2, Briefcase, X, Save } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PhoneInput, isValidPhoneNumber } from "@/components/ui/phone-input";
import type { Id, Doc } from "@convex/_generated/dataModel";

interface EmployeeEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Doc<"profiles">;
}

export function EmployeeEditDrawer({ 
  open, 
  onOpenChange, 
  employee 
}: EmployeeEditDrawerProps) {
  const [name, setName] = useState(employee.name);
  const [phone, setPhone] = useState(employee.phone || "");
  const [company, setCompany] = useState(employee.company || "");
  const [designation, setDesignation] = useState(employee.designation || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with employee prop when it changes or drawer opens
  useEffect(() => {
    if (open) {
      setName(employee.name);
      setPhone(employee.phone || "");
      setCompany(employee.company || "");
      setDesignation(employee.designation || "");
    }
  }, [open, employee]);

  const updateProfile = useMutation(api.admin.updateEmployeeProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    // Validate phone number if provided
    if (phone && !isValidPhoneNumber(phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        profileId: employee._id,
        name: name.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        designation: designation.trim() || undefined,
      });

      toast.success("Employee profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update employee",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/40">
              EMPLOYEE MANAGEMENT
            </span>
          </div>
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            Edit Profile
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Update team member information and role details
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar"
        >
          <div className="space-y-8">
            {/* Name Field */}
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Employee Name <span className="text-indigo-400 ml-1.5">*</span>
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <User className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="edit-employee-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Smith"
                    required
                    className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            {/* Designation Field */}
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Designation
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <Briefcase className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="edit-employee-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g., Video Editor, Photographer"
                    className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            {/* Phone Field */}
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Phone Number
              </FieldLabel>
              <FieldContent>
                <PhoneInput
                  id="edit-employee-phone"
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  placeholder="98765 43210"
                  className="bg-white/3 border-white/10 [&_button]:bg-white/3 [&_button]:border-white/10 [&_button]:text-white [&_button]:hover:bg-white/5 [&_input]:bg-white/3 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-white/20"
                  inputClassName="text-[15px] font-black uppercase tracking-wider placeholder:text-white/10"
                />
              </FieldContent>
            </Field>

            {/* Company Field */}
            <Field>
              <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                Company
              </FieldLabel>
              <FieldContent>
                <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                  <InputGroupAddon align="inline-start" className="pl-4">
                    <Building2 className="h-4 w-4 text-white/10" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="edit-employee-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., PrimeEditz Studios"
                    className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                  />
                </InputGroup>
              </FieldContent>
            </Field>
          </div>

          <div className="pt-8 space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full h-14 bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </div>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
            >
              Discard Changes
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
