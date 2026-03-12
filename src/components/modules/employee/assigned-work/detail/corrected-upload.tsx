"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import {
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CorrectedUploadProps {
  projectId: string;
  parentDeliverableId: string;
  deliverableName: string;
}

export function CorrectedUpload({
  projectId,
  parentDeliverableId,
  deliverableName,
}: CorrectedUploadProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );
  const uploadCorrectedVersion = useMutation(
    api.functions.deliverables.mutations.uploadCorrectedVersion,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a corrected file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get pre-signed URL
      const { url, storageKey } = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type,
        projectId: projectId as Id<"projects">,
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

      // 3. Create Corrected Deliverable Record
      await uploadCorrectedVersion({
        parentDeliverableId: parentDeliverableId as Id<"deliverables">,
        name: deliverableName, // Keep existing name
        minioKey: storageKey,
        sizeBytes: file.size,
        mimeType: file.type,
        description: description,
      });

      toast.success("Corrected version uploaded! Admin will review.");
      router.push(`/assigned-work/${projectId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload corrected version");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
          Upload Corrected Version
        </Label>

        <div
          className={cn(
            "relative group h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-4 bg-white/2",
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="group-hover:scale-105 transition-transform min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                  {file.name}
                </p>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • READY
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5 text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white uppercase tracking-tight">
                  Select Corrected File
                </p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                  Click or drag assets here
                </p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-x-6 bottom-4 flex flex-col gap-1.5">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[9px] font-black text-center text-indigo-400 uppercase tracking-[0.2em]">
                {uploadProgress}% UPLOADING...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
          Correction Notes (Optional)
        </Label>
        <div className="p-1 rounded-2xl bg-white/2 border border-white/5 focus-within:border-indigo-500/30 transition-colors">
          <Textarea
            placeholder="EXPLAIN THE CHANGES YOU MADE..."
            className="bg-transparent border-none focus-visible:ring-0 min-h-[80px] text-[10px] font-bold uppercase tracking-widest placeholder:text-white/10 resize-none p-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
          />
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 font-black uppercase tracking-widest text-[10px] gap-2.5"
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            UPLOADING CORRECTED VERSION...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            SUBMIT CORRECTED VERSION
          </>
        )}
      </Button>

      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
        <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider leading-relaxed">
          Uploading this will resolve all active version requests and notify the
          admin for a new quality check.
        </p>
      </div>
    </div>
  );
}
