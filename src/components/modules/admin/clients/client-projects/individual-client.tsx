"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  Hash,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ClientProject {
  _id: Id<"projects">;
  code: string;
  status: string;
  projectTypeName: string;
  eventName?: string;
  eventDate?: number;
  venue?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ label, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "relative p-5 rounded-2xl border overflow-hidden",
        "bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300"
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full -translate-y-8 translate-x-8",
          color
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
            {label}
          </span>
          <div className="text-3xl font-black text-white tracking-tight">
            {value}
          </div>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-white/5 border border-white/10"
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    draft: {
      label: "Draft",
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10 border-zinc-500/20",
    },
    pending_review: {
      label: "Pending",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    active: {
      label: "Active",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    in_progress: {
      label: "In Progress",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    completed: {
      label: "Completed",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    archived: {
      label: "Archived",
      color: "text-zinc-500",
      bgColor: "bg-zinc-500/5 border-zinc-500/10",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
        config.bgColor,
        config.color
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

// ============================================================================
// Project Card Component
// ============================================================================

function ProjectCard({
  project,
  index,
}: {
  project: ClientProject;
  index: number;
}) {
  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                  {project.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {project.projectTypeName}
                </span>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Event Details */}
          {project.eventName && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="font-bold text-white/70 text-sm truncate">
                {project.eventName}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {project.eventDate && (
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Calendar className="h-3 w-3" />
                    <span className="text-[10px] font-medium">
                      {new Date(project.eventDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {project.venue && (
                  <div className="flex items-center gap-1.5 text-white/40">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[10px] font-medium truncate max-w-[150px]">
                      {project.venue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Created{" "}
              {new Date(project.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-1.5"
            >
              View <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="flex-1 p-8 md:p-12 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-24 bg-white/5 rounded mb-4" />
        <div className="h-12 w-64 bg-white/5 rounded mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/[0.02] border border-white/5"
          />
        ))}
      </div>

      {/* Client Card Skeleton */}
      <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 mb-10" />

      {/* Projects Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-white/[0.02] border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function IndividualClient() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as Id<"profiles">;

  const data = useQuery(api.admin.getClientWithProjects, { clientId });

  if (data === undefined) {
    return <LoadingSkeleton />;
  }

  if (data === null) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Client Not Found
          </h2>
          <p className="text-white/40 mb-6">
            The client you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { client, projects, stats } = data;

  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl gap-2 px-3 h-9 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clients
        </Button>
      </motion.div>

      {/* Page Header with Avatar on Left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 block mb-4">
          CLIENT PROFILE
        </span>
        
        <div className="flex items-start gap-4">
          {/* Left side - Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 xl:w-20 xl:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 xl:h-12 xl:w-12 text-primary" />
            </div>
          </div>

          {/* Right side - Client Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                {client.name}
              </h1>
              {/* Status Badge */}
              {client.onboardingComplete ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Onboarded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}
            </div>
            <p className="text-white/40 text-sm mt-1">
              Client ID: {client._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Client Details - Aligned to left side */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
          {/* Email */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                Email
              </span>
              <span className="text-sm font-medium text-white/70">
                {client.email}
              </span>
            </div>
          </div>

          {/* Phone */}
          {client.phone && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                  Phone
                </span>
                <span className="text-sm font-mono text-white/70">
                  {client.phone}
                </span>
              </div>
            </div>
          )}

          {/* Company */}
          {client.company && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Building className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                  Company
                </span>
                <span className="text-sm font-bold text-white/70 uppercase">
                  {client.company}
                </span>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                Member Since
              </span>
              <span className="text-sm font-medium text-white/70">
                {new Date(client.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 block">
              PROJECT PORTFOLIO
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mt-1">
              All Projects
            </h2>
          </div>
        
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-lg font-black text-white/80 mb-1">
              No Projects Yet
            </h3>
            <p className="text-white/40 text-sm text-center max-w-sm">
              This client doesn&apos;t have any projects. Create their first
              project to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}