"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  Briefcase,
  Building2,
  Check,
  Copy,
  Link as LinkIcon,
  Mail,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { isValidPhoneNumber, PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

interface NewEmployeeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatedEmployee {
  profileId: Id<"profiles">;
  name: string;
}

export function NewEmployeeDrawer({
  open,
  onOpenChange,
}: NewEmployeeDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEmployee, setCreatedEmployee] =
    useState<CreatedEmployee | null>(null);
  const [copied, setCopied] = useState(false);

  const createEmployeeProfile = useMutation(
    api.admin.createDraftEmployeeProfile,
  );

  // Generate the onboarding URL
  const getOnboardingUrl = (employeeId: Id<"profiles">) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/employee/${employeeId}/sign-in`;
  };

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
      const result = await createEmployeeProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        designation: designation.trim() || undefined,
      });

      toast.success("Employee profile created successfully");
      setCreatedEmployee({
        profileId: result.profileId,
        name: result.name,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create employee",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdEmployee) return;
    const url = getOnboardingUrl(createdEmployee.profileId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Onboarding link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setDesignation("");
    setCreatedEmployee(null);
    setCopied(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleAddAnother = () => {
    resetForm();
  };

  return (
    <Drawer open={open} onOpenChange={handleClose} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleClose(false)}
            className="absolute right-4 top-4 text-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Plus className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/40">
              EMPLOYEE MANAGEMENT
            </span>
          </div>
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            {createdEmployee ? "Employee Created" : "Add New Employee"}
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {createdEmployee
              ? "Share the onboarding link with your new team member"
              : "Enter the employee details below to create a new profile"}
          </DrawerDescription>
        </DrawerHeader>

        {createdEmployee ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Success State with Onboarding Link */}
            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      {createdEmployee.name}
                    </h3>
                    <p className="text-xs font-bold text-emerald-400/60 uppercase tracking-widest">
                      Profile Created Successfully
                    </p>
                  </div>
                </div>
              </div>

              {/* Onboarding Link Section */}
              <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/2 p-6 transition-all hover:bg-white/4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <LinkIcon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      Onboarding Link
                    </span>
                    <span className="text-sm font-bold text-white/70">
                      Share this link for employee sign-in
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 overflow-hidden h-12 bg-black/40 rounded-2xl border border-white/5 flex items-center px-4">
                    <span className="text-xs font-bold text-white/40 truncate select-all">
                      {getOnboardingUrl(createdEmployee.profileId)}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyLink}
                    className={cn(
                      "h-12 w-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all",
                      copied &&
                        "border-green-500/50 bg-green-500/10 text-green-400",
                    )}
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5 text-white/40" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-white/30 mt-2">
                  The employee will use this link to complete their onboarding
                  and set up their account.
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <Button
                onClick={handleAddAnother}
                className="w-full h-14 bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Add Another Employee
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar"
          >
            <div className="space-y-8">
              {/* Name Field */}
              <Field>
                <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                  Employee Name{" "}
                  <span className="text-indigo-400 ml-1.5">*</span>
                </FieldLabel>
                <FieldContent>
                  <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <User className="h-4 w-4 text-white/10" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="employee-name"
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
                  Work Email (Optional)
                </FieldLabel>
                <FieldContent>
                  <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <Mail className="h-4 w-4 text-white/10" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="employee-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., employee@primeeditz.com"
                      className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                    />
                  </InputGroup>
                  <p className="text-[10px] text-white/20 mt-2 font-medium uppercase tracking-wider">
                    If provided, only this email can claim the profile.
                  </p>
                </FieldContent>
              </Field>

              {/* Designation Field */}
              <Field>
                <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                  Designation (Optional)
                </FieldLabel>
                <FieldContent>
                  <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <Briefcase className="h-4 w-4 text-white/10" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="employee-designation"
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
                  Phone (Optional)
                </FieldLabel>
                <FieldContent>
                  <PhoneInput
                    id="employee-phone"
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
                  Company (Optional)
                </FieldLabel>
                <FieldContent>
                  <InputGroup className="bg-white/3 border-white/10 focus-within:border-indigo-500/40 transition-all duration-500 rounded-xl h-12">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <Building2 className="h-4 w-4 text-white/10" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="employee-company"
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
                {isSubmitting ? "Creating..." : "Create Employee Profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
