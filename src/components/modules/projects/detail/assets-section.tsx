"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { type Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { FolderGrid } from "@/components/shared/project-folders";
import { StorageUsageBar } from "@/components/shared/storage-usage-bar";

interface AssetsSectionProps {
  projectId: string;
}

export function AssetsSection({ projectId }: AssetsSectionProps) {
  const router = useRouter();

  const updateFolderStatus = useMutation(
    api.functions.folders.mutations.updateFolderStatus,
  );

  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });

  const folders = useQuery(api.functions.folders.queries.getMyProjectFolders, {
    projectId: projectId as Id<"projects">,
  });

  const storage = useQuery(
    api.functions.storage.queries.getProjectStorageUsage,
    {
      projectId: projectId as Id<"projects">,
    },
  );

  const isLocked = project?.uploadEligibility?.isAllowed === false;

  const handleFolderClick = (folder: any) => {
    if (isLocked) return;
    // Navigate to the dedicated folder page
    router.push(`/projects/${projectId}/folders/${folder._id}`);
  };

  const handleFolderComplete = async (folder: any) => {
    try {
      await updateFolderStatus({
        folderId: folder._id,
        status: "completed",
      });
      toast.success(`Folder ${folder.name} marked as complete`);
    } catch (error) {
      toast.error("Failed to update folder status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Project Assets
            {isLocked && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] tracking-[0.2em] font-black">
                LOCKED
              </span>
            )}
          </h2>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">
            {isLocked
              ? "Uploads will be enabled once your quotation is approved"
              : "Click a folder to upload files"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 relative">
          {isLocked && (
            <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center p-8 text-center border border-white/5">
              <div className="max-w-md space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    Upload Gated
                  </h3>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-2 px-4">
                    {project?.uploadEligibility?.reason ||
                      "Awaiting quotation approval to unlock project storage."}
                  </p>
                </div>
              </div>
            </div>
          )}
          <FolderGrid
            folders={folders}
            isLocked={isLocked}
            onFolderClick={handleFolderClick}
            onFolderComplete={handleFolderComplete}
          />
        </div>
        <div className="space-y-6">
          {storage && (
            <StorageUsageBar
              used={storage.used}
              allocated={storage.allocated}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
