"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, FolderTree, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { FolderGrid } from "@/components/shared/project-folders";

interface FolderListingViewProps {
  projectId: string;
  isAdmin?: boolean;
  isEmployee?: boolean;
}

export function FolderListingView({
  projectId,
  isAdmin = false,
  isEmployee = false,
}: FolderListingViewProps) {
  const router = useRouter();
  const isStaff = isAdmin || isEmployee;

  // Queries
  const project = useQuery(
    isStaff
      ? api.admin.getAdminProject
      : api.functions.projects.queries.getProject,
    {
      projectId: projectId as Id<"projects">,
    },
  );

  const folders = useQuery(
    isStaff
      ? api.functions.folders.queries.getProjectFolders
      : api.functions.folders.queries.getMyProjectFolders,
    {
      projectId: projectId as Id<"projects">,
    },
  );

  // Mutations
  const markAllComplete = useMutation(
    api.functions.folders.mutations.markAllUploadsComplete,
  );

  const handleFolderClick = (folder: any) => {
    // Navigate to dedicated folder upload page
    let baseRoute = `/projects/${projectId}/folders`;
    
    if (isEmployee) {
      baseRoute = `/assigned-work/${projectId}/folders`;
    }
    
    router.push(`${baseRoute}/${folder._id}`);
  };

  const handleUploadsComplete = async () => {
    try {
      await markAllComplete({ projectId: projectId as Id<"projects"> });
      toast.success("Project transitioned to uploads complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete uploads");
    }
  };

  if (!project || folders === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
          Loading Folders...
        </p>
      </div>
    );
  }

  const showCompleteButton =
    project.actionState === "awaiting_uploads" && folders.length > 0;

  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-white/10 hover:bg-white/5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <FolderTree className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Project Folders
              </h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                {project.code} • {folders.length} Folders Configured
              </p>
            </div>
          </div>
        </div>

        {showCompleteButton && (
          <Button
            onClick={handleUploadsComplete}
            className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 group"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Finalize My Uploads
          </Button>
        )}
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FolderGrid
          folders={folders}
          onFolderClick={handleFolderClick}
          title=""
        />
      </motion.div>

      {/* Instructions */}
      {project.actionState === "awaiting_uploads" && (
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 max-w-2xl">
          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
            Upload Instructions
          </h4>
          <p className="text-xs text-white/50 leading-relaxed font-bold uppercase tracking-wide">
            Select a folder above to start uploading your assets. Once you have
            uploaded files to all folders, click the
            <span className="text-emerald-400 mx-1">
              Finalize My Uploads
            </span>{" "}
            button to notify our team.
          </p>
        </div>
      )}
    </div>
  );
}
