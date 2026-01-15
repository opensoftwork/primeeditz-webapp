"use client";

import React from "react";
import { format } from "date-fns";
import { Tag, User, FileText, Calendar, MapPin, Database } from "lucide-react";
import { SectionWrapper } from "../section-wrapper";
import { ReviewData } from "../review-data";

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
          label="End Client"
          value={formData.step1.endClientName}
        />
        <ReviewData
          icon={<FileText className="h-4 w-4" />}
          label="Event Name"
          value={formData.step1.eventName}
        />
        <ReviewData
          icon={<Calendar className="h-4 w-4" />}
          label="Event Date"
          value={
            formData.step1.eventDate
              ? format(formData.step1.eventDate, "PPP")
              : "N/A"
          }
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
