"use client";

import { AnimatePresence } from "motion/react";
import { Field, FieldLabel } from "@/components/ui/field";
import { FileItem } from "./file-item";

interface FileListProps {
  files: string[];
  onRemove: (index: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-4">
      <Field>
        <FieldLabel>Selected Files ({files.length})</FieldLabel>
        <ul
          className="divide-y rounded-lg border mt-2 overflow-hidden"
          role="list"
        >
          <AnimatePresence mode="popLayout">
            {files.map((fileId, index) => (
              <FileItem
                key={fileId}
                fileId={fileId}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        </ul>
      </Field>
    </div>
  );
}
