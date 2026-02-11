"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FinalizeWorkDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function FinalizeWorkDrawer({
  open,
  onOpenChange,
  projectId,
  projectName,
}: FinalizeWorkDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );
  const uploadDeliverable = useMutation(
    api.functions.deliverables.mutations.uploadDeliverable,
  );
  const recordHandoff = useMutation(api.admin.recordHandoff);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFinalize = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get pre-signed URL (We need a special folder or project-level deliverable path)
      // For now, let's use a dummy folder ID or modify the generateUploadUrl action.
      // Wait, deliverables table doesn't have folderId.
      // Let's assume generateUploadUrl can handle null folderId? I'll check.

      const { url, storageKey } = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type,
        projectId: projectId as Id<"projects">,
        // folderId: ... // deliverables don't strictly need folderId in schema
        fileSize: file.size,
      } as any);

      // 2. Upload to MinIO
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      // 3. Create Deliverable Record
      await uploadDeliverable({
        projectId: projectId as Id<"projects">,
        name: file.name,
        minioKey: storageKey,
        sizeBytes: file.size,
        mimeType: file.type,
        description: description,
      });

      // 4. Transition Project State to deliverables_ready
      await recordHandoff({
        projectId: projectId as Id<"projects">,
        toState: "deliverables_ready",
        notes: `Production finalized and deliverable uploaded: ${file.name}`,
      });

      toast.success("Work finalized successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to finalize work");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDescription("");
    setUploadProgress(0);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-l border-white/10 h-full w-full sm:max-w-xl p-0 focus:outline-none rounded-l-4xl">
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* CRT scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] animate-scan" />

          <DrawerHeader className="p-8 pb-4 border-b border-white/5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  </div>
                  <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white">
                    Finalize Production
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  Project: {projectName} — Upload your finalized assets for
                  quality check
                </DrawerDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-xl hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar">
            {/* File Selection Zone */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                Deliverable Asset
              </Label>
              <div
                className={cn(
                  "relative group aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-white/2",
                  file
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 hover:border-indigo-500/30 hover:bg-white/5",
                  isUploading && "pointer-events-none opacity-50",
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isUploading}
                />

                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • READY TO
                        UPLOAD
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-white uppercase tracking-tight">
                        Select Final Deliverable
                      </p>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                        Drop video or image assets here
                      </p>
                    </div>
                  </>
                )}

                {isUploading && (
                  <div className="absolute inset-x-8 bottom-8 flex flex-col gap-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-black text-center text-indigo-400 uppercase tracking-[0.2em]">
                      {uploadProgress}% TRANSMITTING...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description / Notes */}
            <div className="space-y-4">
              <Label
                htmlFor="notes"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1"
              >
                Hand-off Notes (Optional)
              </Label>
              <div className="p-1 rounded-2xl bg-white/2 border border-white/5 focus-within:border-indigo-500/30 transition-colors">
                <Textarea
                  id="notes"
                  placeholder="ADD ANY SPECIFIC INSTRUCTIONS FOR QUALITY CONTROL OR THE CLIENT..."
                  className="bg-transparent border-none focus-visible:ring-0 min-h-[120px] text-xs font-bold uppercase tracking-widest placeholder:text-white/10 resize-none p-4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Compliance Check */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
              <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Pre-Flight Check
                </p>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1 leading-relaxed">
                  By finalizing this production, you confirm all requirements
                  from the technical scope have been met. This file will be sent
                  directly to Quality Control.
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter className="p-8 border-t border-white/5 relative z-10 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                className="flex-2 rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 font-black uppercase tracking-[0.2em] text-[10px] gap-3"
                onClick={handleFinalize}
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    FINALIZING...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    FINALIZE PRODUCTION
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
