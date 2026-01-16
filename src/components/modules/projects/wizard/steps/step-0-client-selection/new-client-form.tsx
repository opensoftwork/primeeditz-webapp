/**
 * New Client Form Component
 * Form for creating a new client during project wizard
 */

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardForm } from "../../wizard-form-context";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import type { SelectedClientData } from "../../types";

interface NewClientFormProps {
    onSuccess: () => void;
}

export function NewClientForm({ onSuccess }: NewClientFormProps) {
    const { setFormData } = useWizardForm();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createClientProfile = useMutation(
        api.functions.profiles.mutations.createDraftClientProfile
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.error("Name and email are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createClientProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                company: company.trim() || undefined,
            });

            // Create client data for the wizard
            const clientData: SelectedClientData = {
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
                clientId: result.profileId,
                clientData,
                isNewClient: true,
            });

            toast.success("Client profile created");
            onSuccess();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to create client"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
            onSubmit={handleSubmit}
        >

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="client-name" className="text-xs font-bold text-white/60">
                        Name *
                    </Label>
                    <Input
                        id="client-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/40"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-xs font-bold text-white/60">
                        Email *
                    </Label>
                    <Input
                        id="client-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="bg-white/5 border-white/10 focus:border-primary/40"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="client-phone" className="text-xs font-bold text-white/60">
                        Phone
                    </Label>
                    <Input
                        id="client-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-white/5 border-white/10 focus:border-primary/40"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="client-company" className="text-xs font-bold text-white/60">
                        Company
                    </Label>
                    <Input
                        id="client-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company name"
                        className="bg-white/5 border-white/10 focus:border-primary/40"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim()}
                className="w-full h-11 font-black uppercase tracking-widest text-[11px]"
            >
                {isSubmitting ? "Creating..." : "Create Client"}
            </Button>
        </motion.form>
    );
}
