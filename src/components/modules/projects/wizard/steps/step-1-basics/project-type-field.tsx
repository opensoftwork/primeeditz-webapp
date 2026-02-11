"use client";

import { Tag } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { ProjectType } from "../../types";

interface ProjectTypeFieldProps {
  field: any;
  projectTypes: ProjectType[];
  onOpenDrawer: () => void;
}

export function ProjectTypeField({
  field,
  projectTypes,
  onOpenDrawer,
}: ProjectTypeFieldProps) {
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;
  const currentProjectType = projectTypes?.find(
    (pt) => pt._id === field.state.value,
  );

  return (
    <Field data-invalid={isInvalid} className="md:col-span-2">
      <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
        Project Type <span className="text-primary ml-1.5">*</span>
      </FieldLabel>
      <FieldContent>
        <Button
          type="button"
          onClick={onOpenDrawer}
          className={cn(
            "w-full h-12 justify-start gap-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 font-black uppercase tracking-wider px-4",
            currentProjectType ? "text-white" : "text-white/20",
          )}
        >
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-[15px]">
            {currentProjectType?.name || "Select project type"}
          </span>
        </Button>
        {isInvalid && (
          <FieldError className="mt-2 ml-1">
            {field.state.meta.errors.join(", ")}
          </FieldError>
        )}
      </FieldContent>
    </Field>
  );
}
