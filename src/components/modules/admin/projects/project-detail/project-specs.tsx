"use client";

import { Package } from "lucide-react";
import {
  DetailItem,
  DetailSection,
} from "@/components/modules/projects/detail/shared";
import type { AdminProjectDetail } from "./types";

interface ProjectSpecsProps {
  project: AdminProjectDetail;
}

export function ProjectSpecs({ project }: ProjectSpecsProps) {
  return (
    <DetailSection
      title="Project Specifications"
      icon={<Package className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
        <DetailItem label="Project Type" value={project.projectTypeName} />
        <DetailItem label="Event Name" value={project.eventName || "—"} />
        <DetailItem
          label="Event Date"
          value={
            project.eventDate
              ? new Date(project.eventDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"
          }
        />
        <DetailItem label="Venue" value={project.venue || "—"} />
      </div>

      {project.description && (
        <div className="mt-12 pt-10 border-t border-white/5">
          <DetailItem label="Description" value={project.description} />
        </div>
      )}

      {project.additionalNotes && (
        <div className="mt-8">
          <DetailItem
            label="Additional Notes"
            value={project.additionalNotes}
          />
        </div>
      )}
    </DetailSection>
  );
}
