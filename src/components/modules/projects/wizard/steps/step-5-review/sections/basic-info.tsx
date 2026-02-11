"use client";

import { Database, MapPin, Tag, User } from "lucide-react";
import React from "react";
import { ReviewData } from "../review-data";
import { SectionWrapper } from "../section-wrapper";

interface BasicInfoReviewProps {
  formData: any;
  projectType: any;
  onEdit: () => void;
}

export function BasicInfoReview({
  formData,
  projectType,
  onEdit,
}: BasicInfoReviewProps) {
  return (
    <SectionWrapper
      title="Basic Information"
      onEdit={onEdit}
      icon={<Database className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReviewData
          icon={<Tag className="h-4 w-4" />}
          label="Project Type"
          value={projectType?.name}
        />
        <ReviewData
          icon={<User className="h-4 w-4" />}
          label="End Studio"
          value={formData.step1.endClientName}
        />

        <ReviewData
          icon={<MapPin className="h-4 w-4" />}
          label="Venue"
          value={formData.step1.venue || "N/A"}
        />
      </div>
    </SectionWrapper>
  );
}
