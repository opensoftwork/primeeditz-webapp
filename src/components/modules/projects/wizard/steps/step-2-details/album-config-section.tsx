"use client";

import { motion } from "motion/react";
import type { FieldValue } from "@/components/shared/dynamic-form-fields";
import { AlbumConfigField } from "../../album-config-field";

interface AlbumConfigSectionProps {
  form: {
    Field: any;
  };
  albumCount: number;
}

export function AlbumConfigSection({
  form,
  albumCount,
}: AlbumConfigSectionProps) {
  if (albumCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-10 p-8 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-xs relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
      <form.Field
        name="sheetsPerAlbum"
        validators={{
          onChange: ({ value }: { value: number[] }) => {
            if (!value || value.length !== albumCount) {
              return "Please enter sheets for all albums";
            }
            if (value.some((s) => !s || s <= 0)) {
              return "All albums must have at least 1 sheet";
            }
            return undefined;
          },
        }}
      >
        {(field: {
          state: {
            value: FieldValue;
            meta: { isTouched: boolean; errors: any[] };
          };
          handleChange: (val: FieldValue) => void;
          handleBlur: () => void;
        }) => {
          const isInvalid =
            field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <AlbumConfigField
              albumCount={albumCount}
              value={(field.state.value as number[]) ?? []}
              onChange={(sheets) => field.handleChange(sheets)}
              onBlur={field.handleBlur}
              error={isInvalid ? field.state.meta.errors.join(", ") : undefined}
            />
          );
        }}
      </form.Field>
    </motion.div>
  );
}
