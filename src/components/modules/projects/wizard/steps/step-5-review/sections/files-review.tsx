"use client";

import { ChevronRight, Eye, LayoutGrid } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "../section-wrapper";

interface FilesReviewProps {
  files: any[];
  images: any[];
  onOpenVault: () => void;
  onEdit: () => void;
}

export function FilesReview({
  files,
  images,
  onOpenVault,
  onEdit,
}: FilesReviewProps) {
  return (
    <SectionWrapper
      title="Project Files"
      onEdit={onEdit}
      icon={<LayoutGrid className="h-4 w-4" />}
    >
      <div className="space-y-6">
        {files.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square rounded-xl border border-white/10 overflow-hidden relative group cursor-pointer"
                  onClick={onOpenVault}
                >
                  <Image
                    src={img.previewUrl!}
                    alt={img.fileName}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2"
              onClick={onOpenVault}
            >
              Manage {files.length} Assets
              <ChevronRight className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
              No files uploaded
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
