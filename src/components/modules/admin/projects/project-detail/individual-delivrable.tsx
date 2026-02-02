"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function DeliverableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const deliverableId = params.deliverableId as Id<"deliverables">;

  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    deliverableId ? { deliverableId } : "skip",
  );

  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey) {
        try {
          const url = await getSignedUrlAction({
            storageKey: deliverable.minioKey,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable, getSignedUrlAction]);

  if (deliverable === undefined) {
    return (
      <div className="p-12 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-1/3 bg-white/5 rounded-xl" />
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (deliverable === null) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-xl font-bold text-white">Deliverable Not Found</h1>
        <Button variant="link" asChild className="mt-4 text-indigo-400">
          <Link href={`/projects/${projectId}`}>Return to Project</Link>
        </Button>
      </div>
    );
  }

  const handleSendToClient = () => {
    toast.success("Deliverable sent to client successfully!");
    // In real implementation, this would trigger an email or notification
  };

  return (
    <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-10 w-10 border border-white/5 hover:bg-white/5"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5 text-white/60" />
        </Button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            {deliverable.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Version {deliverable.version}</span>
            <span>•</span>
            <span>{(deliverable.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            <span>•</span>
            <span>{format(deliverable._creationTime, "PPP p")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Preview/Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-zinc-900 border border-white/5 overflow-hidden min-h-[400px] flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

            {fileUrl && deliverable.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={deliverable.name}
                className="max-w-full max-h-[500px] object-contain shadow-2xl"
              />
            ) : fileUrl && deliverable.mimeType.startsWith("video/") ? (
              <video
                src={fileUrl}
                controls
                className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                  <FileText className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white uppercase tracking-widest">
                    Preview Not Available
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mt-2">
                    {deliverable.mimeType}
                  </p>
                </div>
                {fileUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
                  >
                    <a href={fileUrl} download>
                      <Download className="h-4 w-4" /> Download File
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Description / Notes
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {deliverable.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right Column - Actions & Meta */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Current Status
              </p>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider",
                  deliverable.status === "approved"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : deliverable.status === "revision_requested"
                      ? "text-red-400 border-red-500/20 bg-red-500/10"
                      : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                )}
              >
                {deliverable.status === "approved" && (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                {deliverable.status === "revision_requested" && (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {deliverable.status === "pending_qc" && (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {deliverable.status.replace("_", " ")}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Submitted By
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-white">
                  {deliverable.uploadedByName}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <Button
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 gap-2"
                onClick={handleSendToClient}
              >
                <Send className="h-4 w-4" /> Send To Client
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-bold uppercase tracking-wider text-[10px] h-10"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold uppercase tracking-wider text-[10px] h-10"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex gap-4">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">
                  Quality Control
                </h4>
                <p className="text-[10px] font-medium text-indigo-200/60 mt-2 leading-relaxed">
                  Verify technical specs, resolution, and format compliance
                  before sending to client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
