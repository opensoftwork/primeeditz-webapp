"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { SectionWrapper } from "../section-wrapper";
import { ReviewData } from "../review-data";

interface SpecificationsReviewProps {
  formData: any;
  projectType: any;
  onEdit: () => void;
}

export function SpecificationsReview({
  formData,
  projectType,
  onEdit,
}: SpecificationsReviewProps) {
  if (!projectType?.hasCustomFields) return null;

  return (
    <SectionWrapper
      title="Project Specifications"
      onEdit={onEdit}
      icon={<Sparkles className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(formData.step2.typeSpecificDetails || {}).map(
          ([key, value]) => {
            let displayValue = String(value);
            if (Array.isArray(value)) displayValue = value.join(", ");
            if (typeof value === "boolean") displayValue = value ? "Yes" : "No";

            return (
              <ReviewData
                key={key}
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                }
                label={key.replace(/([A-Z])/g, " $1").trim()}
                value={displayValue}
              />
            );
          }
        )}
      </div>
    </SectionWrapper>
  );
}
