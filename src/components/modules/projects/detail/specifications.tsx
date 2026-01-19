"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Tag, User, Database } from "lucide-react";
import { motion } from "motion/react";
import { DetailSection, DetailItem } from "./shared";

interface ProjectSpecificationsProps {
  project: any;
  fields?: any[];
}

export function ProjectSpecifications({
  project,
  fields,
}: ProjectSpecificationsProps) {
  const staticItems = [
    {
      icon: <Tag className="h-4 w-4" />,
      label: "Project Category",
      value: project.projectTypeName,
    },
    {
      icon: <User className="h-4 w-4" />,
      label: "End Client",
      value: project.endClientName || "N/A",
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Event Venue",
      value: project.venue || "N/A",
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Event Date",
      value: project.eventDate
        ? format(project.eventDate, "MMMM dd, yyyy")
        : "N/A",
    },
  ];

  return (
    <DetailSection
      title="Production Specifications"
      icon={<Database className="h-4 w-4" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {staticItems.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.3, duration: 0.4 }}
          >
            <DetailItem
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          </motion.div>
        ))}
      </div>

      {/* Dynamic Fields */}
      {project.typeSpecificDetails && (
        <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {Object.entries(project.typeSpecificDetails).map(
            ([key, value], idx) => {
              const fieldDef = fields?.find((f) => f.name === key);
              const label =
                fieldDef?.label ||
                key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

              // Special handling for arrays (like sheetsPerAlbum)
              const displayValue = Array.isArray(value)
                ? `${value.length} Items Configured`
                : String(value);

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (staticItems.length + idx) * 0.05 + 0.3,
                    duration: 0.4,
                  }}
                >
                  <DetailItem label={label} value={displayValue} />
                </motion.div>
              );
            }
          )}
        </div>
      )}
    </DetailSection>
  );
}
