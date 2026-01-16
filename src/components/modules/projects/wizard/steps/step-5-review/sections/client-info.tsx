"use client";

import React from "react";
import { Users, Mail, Phone, Building, Info, UserCircle } from "lucide-react";
import { SectionWrapper } from "../section-wrapper";
import { ReviewData } from "../review-data";

interface ClientInfoReviewProps {
    formData: any;
    onEdit: () => void;
}

export function ClientInfoReview({ formData, onEdit }: ClientInfoReviewProps) {
    const { selectionMode, clientData } = formData.step0;

    if (selectionMode === "none") {
        return (
            <SectionWrapper
                title="Client Association"
                onEdit={onEdit}
                icon={<Users className="h-4 w-4" />}
            >
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 text-amber-400/60">
                    <Info className="h-5 w-5 shrink-0" />
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-1">
                            No Client Associated
                        </h4>
                        <p className="text-[11px] leading-relaxed font-medium">
                            This project will be created without an associated client profile.
                            You can associate one later from the project settings.
                        </p>
                    </div>
                </div>
            </SectionWrapper>
        );
    }

    if (!clientData) return null;

    return (
        <SectionWrapper
            title="Client Information"
            onEdit={onEdit}
            icon={<UserCircle className="h-4 w-4" />}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReviewData
                    icon={<Users className="h-4 w-4" />}
                    label="Name"
                    value={clientData.name}
                />
                <ReviewData
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={clientData.email}
                />
                {clientData.phone && (
                    <ReviewData
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone"
                        value={clientData.phone}
                    />
                )}
                {clientData.company && (
                    <ReviewData
                        icon={<Building className="h-4 w-4" />}
                        label="Company"
                        value={clientData.company}
                    />
                )}
            </div>
        </SectionWrapper>
    );
}
