"use client";

import { useState } from "react";
import { User, Mail, Building2, X, Plus } from "lucide-react";
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

interface NewStudioDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewStudioDrawer({ open, onOpenChange }: NewStudioDrawerProps) {
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

    // Validate phone number if provided
    if (phone && !isValidPhoneNumber(phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      await createStudioProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });

      toast.success("Studio profile created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create studio profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              STUDIO MANAGEMENT
            </span>
          </div>
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            Create New Studio Profile
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Enter the studio details below to create a new profile
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
                <PhoneInput
                  id="studio-phone"
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

          <div className="pt-8 space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? "Creating..." : "Create Studio Profile"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
