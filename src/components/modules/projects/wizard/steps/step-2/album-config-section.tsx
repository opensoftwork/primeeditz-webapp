"use client";

import { motion } from "motion/react";
import { AlbumConfigField } from "../../album-config-field";

interface AlbumConfigSectionProps {
  form: any;
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
      className="mt-6 p-5 rounded-xl bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20"
    >
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
        children={(field: any) => {
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
      />
    </motion.div>
  );
}
