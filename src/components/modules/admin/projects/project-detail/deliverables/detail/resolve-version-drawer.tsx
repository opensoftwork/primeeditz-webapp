"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ResolveVersionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  deliverableId: string;
  deliverableName: string;
  versionNumber: number;
}

export function ResolveVersionDrawer({
  open,
  onOpenChange,
  projectId,
  deliverableId,
  deliverableName,
  versionNumber,
}: ResolveVersionDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // @ts-ignore
  const actionPath: any = api.functions.storage.actions.generateUploadUrl;
  const generateUploadUrl = useAction(actionPath);
  const uploadCorrectedVersion = useMutation(
    api.functions.deliverables.mutations.uploadCorrectedVersion,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleResolve = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { url, storageKey } = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type,
        projectId: projectId as Id<"projects">,
        fileSize: file.size,
      } as any);

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

      await uploadCorrectedVersion({
        parentDeliverableId: deliverableId as Id<"deliverables">,
        name: deliverableName,
        minioKey: storageKey,
        sizeBytes: file.size,
        mimeType: file.type,
        description: description,
      });

      toast.success("Version request resolved with new upload!");
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to resolve version request");
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
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] animate-scan" />

          <DrawerHeader className="p-8 pb-4 border-b border-white/5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white">
                    Resolve Version Request
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-2">
                  Request #{versionNumber} — Upload the corrected asset to
                  automatically resolve this request
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
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                Corrected Deliverable Asset
              </Label>
              <div
                className={cn(
                  "relative group aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-white/2",
                  file
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 hover:border-emerald-500/30 hover:bg-white/5",
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
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-white uppercase tracking-tight">
                        Select Corrected File
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
                        className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-black text-center text-emerald-400 uppercase tracking-[0.2em]">
                      {uploadProgress}% TRANSMITTING...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label
                htmlFor="notes"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1"
              >
                Correction Notes (Optional)
              </Label>
              <div className="p-1 rounded-2xl bg-white/2 border border-white/5 focus-within:border-emerald-500/30 transition-colors">
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

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
              <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Automatic Resolution
                </p>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1 leading-relaxed">
                  Uploading this file will create a new version of the
                  deliverable and automatically resolve this request and any
                  other pending requests for this deliverable.
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
                className="flex-2 rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 font-black uppercase tracking-[0.2em] text-[10px] gap-3"
                onClick={handleResolve}
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    RESOLVING...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    UPLOAD AND RESOLVE
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
