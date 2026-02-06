"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FolderKanban,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PhaseProgress } from "@/components/modules/projects/phase-progress";
import { StudioStatusBadge } from "@/components/modules/projects/studio-status-badge";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface StudioProject {
  _id: Id<"projects">;
  code: string;
  phase: string;
  actionState: string;
  status: string; // compatibility
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
        "bg-white/2 border-white/5 hover:border-white/10 transition-all duration-300",
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full -translate-y-8 translate-x-8",
          color,
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
            "bg-white/5 border border-white/10",
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

import { getStatusConfig } from "@/lib/status-display";

// StatusBadge is no longer used locally, using StudioStatusBadge from projects module.

// ============================================================================
// Project Card Component
// ============================================================================

function ProjectCard({
  project,
  index,
}: {
  project: StudioProject;
  index: number;
}) {
  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        whileHover={{ y: -3 }}
        className="group relative p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-primary/40" />
                <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tighter truncate">
                  {project.code}
                </span>
              </div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">
                {project.projectTypeName}
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-[14px] font-black text-white leading-tight uppercase tracking-tight truncate">
              {project.eventName || "General Project"}
            </h3>
            {project.eventDate && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                <Calendar className="h-2.5 w-2.5" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-white/5">
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1 text-[8px] font-black text-primary/60 group-hover:text-primary transition-colors uppercase tracking-[0.15em]">
              View <ChevronRight className="h-2.5 w-2.5" />
            </div>
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
            className="h-28 rounded-2xl bg-white/2 border border-white/5"
          />
        ))}
      </div>

      {/* Studio Card Skeleton */}
      <div className="h-48 rounded-2xl bg-white/2 border border-white/5 mb-10" />

      {/* Projects Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-white/2 border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function IndividualStudio() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.studioId as Id<"profiles">;

  const data = useQuery(api.admin.getStudioWithProjects, {
    studioId: studioId,
  });

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
            Studio Not Found
          </h2>
          <p className="text-white/40 mb-6">
            The studio you&apos;re looking for doesn&apos;t exist or has been
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

  const { client: studio, projects, stats } = data;

  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl gap-2 px-3 h-9 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Studios
        </Button>
      </motion.div>

      {/* Page Header with Avatar on Left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 block mb-4">
          STUDIO PROFILE
        </span>

        <div className="flex items-start gap-4">
          {/* Left side - Avatar */}
          <div className="shrink-0">
            <div className="w-20 h-20 xl:w-20 xl:h-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 xl:h-12 xl:w-12 text-primary" />
            </div>
          </div>

          {/* Right side - Studio Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                {studio.name}
              </h1>
              {/* Status Badge */}
              {studio.onboardingComplete ? (
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
              Studio ID: {studio._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Studio Details - Aligned to left side */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
          {/* Email */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Mail className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                Email
              </span>
              <span className="text-sm font-medium text-white/70">
                {studio.email}
              </span>
            </div>
          </div>

          {/* Phone */}
          {studio.phone && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                  Phone
                </span>
                <span className="text-sm font-mono text-white/70">
                  {studio.phone}
                </span>
              </div>
            </div>
          )}

          {/* Company */}
          {studio.company && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Building className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                  Company
                </span>
                <span className="text-sm font-bold text-white/70 uppercase">
                  {studio.company}
                </span>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                Member Since
              </span>
              <span className="text-sm font-medium text-white/70">
                {new Date(studio._creationTime).toLocaleDateString("en-GB", {
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
          <div className="flex flex-col items-center justify-center py-16 rounded-3xl bg-white/2 border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-lg font-black text-white/80 mb-1">
              No Projects Yet
            </h3>
            <p className="text-white/40 text-sm text-center max-w-sm">
              This studio doesn&apos;t have any projects. Create their first
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
