"use client";

import { Building, Info, Mail, Phone, UserCircle, Users } from "lucide-react";
import React from "react";
import { ReviewData } from "../review-data";
import { SectionWrapper } from "../section-wrapper";

interface StudioInfoReviewProps {
  formData: any;
  onEdit: () => void;
}

export function StudioInfoReview({ formData, onEdit }: StudioInfoReviewProps) {
  const { selectionMode, studioData } = formData.step0;

  if (selectionMode === "none") {
    return (
      <SectionWrapper
        title="Studio Association"
        onEdit={onEdit}
        icon={<Users className="h-4 w-4" />}
      >
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 text-amber-400/60">
          <Info className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-1">
              No Studio Associated
            </h4>
            <p className="text-[11px] leading-relaxed font-medium">
              This project will be created without an associated studio profile.
              You can associate one later from the project settings.
            </p>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (!studioData) return null;

  return (
    <SectionWrapper
      title="Studio Information"
      onEdit={onEdit}
      icon={<UserCircle className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReviewData
          icon={<Users className="h-4 w-4" />}
          label="Name"
          value={studioData.name}
        />
        <ReviewData
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={studioData.email}
        />
        {studioData.phone && (
          <ReviewData
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={studioData.phone}
          />
        )}
        {studioData.company && (
          <ReviewData
            icon={<Building className="h-4 w-4" />}
            label="Company"
            value={studioData.company}
          />
        )}
      </div>
    </SectionWrapper>
  );
}
