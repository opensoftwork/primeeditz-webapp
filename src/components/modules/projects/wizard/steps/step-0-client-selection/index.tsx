/**
 * Step 0: Client Selection
 *
 * Admin-only wizard step for selecting or creating a client
 * before initiating a project.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, UserPlus, FolderOpen, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useWizardForm } from "../../wizard-form-context";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import type { ClientSelectionMode, SelectedClientData } from "../../types";
import type { Id } from "@convex/_generated/dataModel";

// ============================================================================
// Selection Option Cards
// ============================================================================

interface SelectionOption {
    id: ClientSelectionMode;
    icon: React.ElementType;
    title: string;
    description: string;
}

const SELECTION_OPTIONS: SelectionOption[] = [
    {
        id: "existing",
        icon: Users,
        title: "Select Existing",
        description: "Browse your client list",
    },
    {
        id: "new",
        icon: UserPlus,
        title: "Create New Client",
        description: "Add a new client now",
    },
    {
        id: "none",
        icon: FolderOpen,
        title: "No Client",
        description: "Create without association",
    },
];

// ============================================================================
// Client Summary Card
// ============================================================================

function ClientSummaryCard({
    client,
    isNewClient,
    onChangeClient,
}: {
    client: SelectedClientData;
    isNewClient: boolean;
    onChangeClient: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-white/3 border border-white/10 relative overflow-hidden"
        >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                        <span className="text-lg font-black text-primary">
                            {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white">{client.name}</h3>
                            {isNewClient && (
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full">
                                    New Client
                                </span>
                            )}
                            {!client.onboardingComplete && (
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                    Pending Onboarding
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-white/60">{client.email}</p>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            {client.phone && <span>{client.phone}</span>}
                            {client.company && <span>{client.company}</span>}
                            {client.projectCount !== undefined && (
                                <span>
                                    {client.projectCount} project
                                    {client.projectCount !== 1 ? "s" : ""}
                                    {client.activeProjectCount !== undefined &&
                                        client.activeProjectCount > 0 &&
                                        `, ${client.activeProjectCount} active`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onChangeClient}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-primary/30 hover:bg-primary/5"
                >
                    Change Client
                </Button>
            </div>
        </motion.div>
    );
}

// ============================================================================
// New Client Form
// ============================================================================

function NewClientForm({ onSuccess }: { onSuccess: () => void }) {
    const { setFormData, setClientData } = useWizardForm();
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
            className="mt-8 p-6 rounded-2xl bg-white/3 border border-white/10 space-y-5"
            onSubmit={handleSubmit}
        >
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                Create New Client
            </h3>

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

// ============================================================================
// Client Selection Drawer
// ============================================================================

function ClientSelectionDrawer({
    open,
    onOpenChange,
    onSelectClient,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectClient: (client: SelectedClientData) => void;
}) {
    const [search, setSearch] = useState("");

    const clientsResult = useQuery(api.admin.getClientsForSelection, {
        search: search || undefined,
        limit: 50,
    });

    const clients = clientsResult?.clients ?? [];
    const isLoading = clientsResult === undefined;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[480px] sm:max-w-[480px] bg-[#0a0a0b] border-white/10">
                <SheetHeader>
                    <SheetTitle className="text-xl font-black uppercase tracking-wider">
                        Select Client
                    </SheetTitle>
                    <SheetDescription className="text-white/40">
                        Choose an existing client for this project
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or company..."
                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/40"
                        />
                    </div>
                </div>

                <div className="mt-4 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="py-10 text-center text-white/40">Loading clients...</div>
                    ) : clients.length === 0 ? (
                        <div className="py-10 text-center text-white/40">
                            {search ? "No clients found matching your search" : "No clients found"}
                        </div>
                    ) : (
                        clients.map((client) => (
                            <motion.button
                                key={client._id}
                                type="button"
                                onClick={() => {
                                    onSelectClient({
                                        _id: client._id,
                                        name: client.name,
                                        email: client.email,
                                        phone: client.phone,
                                        company: client.company,
                                        onboardingComplete: client.onboardingComplete,
                                        projectCount: client.projectCount,
                                        activeProjectCount: client.activeProjectCount,
                                    });
                                    onOpenChange(false);
                                }}
                                className="w-full p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all text-left group"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                                        <span className="text-sm font-black text-white/60 group-hover:text-primary transition-colors">
                                            {client.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white truncate">
                                                {client.name}
                                            </span>
                                            {!client.onboardingComplete && (
                                                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-white/40 truncate">
                                            {client.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-white/30 mt-0.5">
                                            {client.company && <span>{client.company}</span>}
                                            <span>{client.projectCount} projects</span>
                                        </div>
                                    </div>

                                    <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.button>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function WizardStep0() {
    const { formData, setFormData, nextStep } = useWizardForm();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { selectionMode, clientData, isNewClient } = formData.step0;

    const handleOptionSelect = (option: ClientSelectionMode) => {
        if (option === "existing") {
            setIsDrawerOpen(true);
        } else if (option === "none") {
            setFormData("step0", {
                selectionMode: "none",
                clientId: null,
                clientData: null,
                isNewClient: false,
            });
        } else {
            setFormData("step0", {
                selectionMode: option,
                clientId: null,
                clientData: null,
                isNewClient: option === "new",
            });
        }
    };

    const handleSelectClient = (client: SelectedClientData) => {
        setFormData("step0", {
            selectionMode: "existing",
            clientId: client._id,
            clientData: client,
            isNewClient: false,
        });
    };

    const handleChangeClient = () => {
        setFormData("step0", {
            selectionMode: null,
            clientId: null,
            clientData: null,
            isNewClient: false,
        });
    };

    const isComplete =
        selectionMode === "none" ||
        (selectionMode === "existing" && clientData) ||
        (selectionMode === "new" && clientData);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                    Client Selection
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mt-2">
                    Choose how to associate a client
                </h2>
                <p className="text-white/40 mt-2 text-sm">
                    Select an existing client, create a new one, or proceed without a
                    client for internal projects.
                </p>
            </div>

            {/* Option Cards */}
            {!clientData && selectionMode !== "new" && (
                <div className="grid grid-cols-3 gap-4">
                    {SELECTION_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectionMode === option.id;

                        return (
                            <motion.button
                                key={option.id}
                                type="button"
                                onClick={() => handleOptionSelect(option.id)}
                                className={cn(
                                    "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Glow effect */}
                                <div
                                    className={cn(
                                        "absolute inset-0 opacity-0 transition-opacity duration-500",
                                        isSelected && "opacity-100"
                                    )}
                                >
                                    <div className="absolute top-0 left-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                                </div>

                                <div className="relative space-y-4">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-primary/20 text-primary"
                                                : "bg-white/5 text-white/40 group-hover:text-white/60"
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <h3
                                            className={cn(
                                                "font-black text-lg uppercase tracking-tight transition-colors",
                                                isSelected ? "text-primary" : "text-white"
                                            )}
                                        >
                                            {option.title}
                                        </h3>
                                        <p className="text-xs text-white/40 mt-1">
                                            {option.description}
                                        </p>
                                    </div>

                                    {/* Selected indicator */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                            >
                                                <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* No Client Confirmation */}
            {selectionMode === "none" && !clientData && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-2xl bg-white/3 border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <FolderOpen className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">No Client Associated</h3>
                            <p className="text-sm text-white/40">
                                This project will be created without a client association. You
                                can add a client later.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* New Client Form */}
            {selectionMode === "new" && !clientData && (
                <NewClientForm
                    onSuccess={() => {
                        // Form handles its own state update
                    }}
                />
            )}

            {/* Selected Client Summary */}
            {clientData && (
                <ClientSummaryCard
                    client={clientData}
                    isNewClient={isNewClient}
                    onChangeClient={handleChangeClient}
                />
            )}

            {/* Client Selection Drawer */}
            <ClientSelectionDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSelectClient={handleSelectClient}
            />
        </div>
    );
}
