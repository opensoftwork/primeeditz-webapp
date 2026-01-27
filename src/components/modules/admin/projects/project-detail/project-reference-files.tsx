"use client";

import { ExternalLink, FileText } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { DetailSection } from "@/components/modules/projects/detail/shared";
import type { VaultFile } from "@/components/shared/files-vault/drawer";
import { Button } from "@/components/ui/button";

interface ProjectReferenceFilesProps {
  referenceFilesCount: number;
  vaultFiles: VaultFile[];
  onOpenVault: () => void;
}

export function ProjectReferenceFiles({
  referenceFilesCount,
  vaultFiles,
  onOpenVault,
}: ProjectReferenceFilesProps) {
  return (
    <DetailSection
      title="Reference Materials"
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm font-semibold text-white/30">
          {referenceFilesCount} files provided by client
        </p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[10px] h-10 px-5 gap-2"
          onClick={onOpenVault}
        >
          OPEN VAULT <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {vaultFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {vaultFiles.slice(0, 5).map((file: VaultFile, idx: number) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden group cursor-pointer relative"
              onClick={onOpenVault}
            >
              {file.type.startsWith("image/") && file.url ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          ))}
          {vaultFiles.length > 5 && (
            <button
              type="button"
              onClick={onOpenVault}
              className="aspect-square rounded-2xl bg-white/5 border border-white/5 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <span className="text-lg font-black text-white">
                +{vaultFiles.length - 5}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                More Files
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
          <p className="text-xs font-black uppercase tracking-widest text-white/20">
            No reference files uploaded
          </p>
        </div>
      )}
    </DetailSection>
  );
}
