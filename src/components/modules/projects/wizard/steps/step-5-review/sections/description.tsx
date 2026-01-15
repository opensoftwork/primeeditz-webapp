"use client";

import React from "react";
import { format } from "date-fns";
import { Sparkles, Calendar } from "lucide-react";
import { SectionWrapper } from "../section-wrapper";
import { ReviewData, ReviewLabel } from "../review-data";

interface DescriptionReviewProps {
  formData: any;
  onEdit: () => void;
}

export function DescriptionReview({
  formData,
  onEdit,
}: DescriptionReviewProps) {
  return (
    <SectionWrapper
      title="Project Description"
      onEdit={onEdit}
      icon={<Sparkles className="h-4 w-4" />}
    >
      <div className="space-y-8">
        <div>
          <ReviewLabel label="Description" />
          <p className="text-[15px] font-bold text-white/50 italic leading-relaxed bg-white/2 border border-white/5 p-6 rounded-2xl">
            {formData.step4.description || "No specific description provided."}
          </p>
        </div>
        {formData.step4.additionalNotes && (
          <div>
            <ReviewLabel label="Additional Notes" />
            <p className="text-sm font-medium text-white/40 leading-relaxed">
              {formData.step4.additionalNotes}
            </p>
          </div>
        )}
        <ReviewData
          icon={<Calendar className="h-4 w-4" />}
          label="Delivery Date"
          value={
            formData.step4.preferredDeliveryDate
              ? format(formData.step4.preferredDeliveryDate, "PPP")
              : "ASAP"
          }
        />
      </div>
    </SectionWrapper>
  );
}
