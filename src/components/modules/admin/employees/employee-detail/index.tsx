"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { 
  Building, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutGrid,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OnboardingBadge } from "../employees-list/status-badge";

// ============================================================================
// Types
// ============================================================================

interface EmployeeDetailProps {
  employeeId: Id<"profiles">;
}

// ============================================================================
// Helper Components
// ============================================================================

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <Card className="p-6 bg-white/2 border-white/5 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full translate-x-12 -translate-y-12 opacity-20", color)} />
      <div className="relative flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", color.replace('bg-', 'bg-').replace('/10', '/20').replace('blur-', 'border-'))}>
          <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-').replace('/10', ''))} />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">
            {label}
          </div>
          <div className="text-2xl font-black text-white leading-none">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  const data = useQuery(api.admin.getEmployeeWithProjects, { employeeId });
  const [isCopying, setIsCopying] = useState(false);

  const getOnboardingUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/employee/${employeeId}/sign-in`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getOnboardingUrl());
    setIsCopying(true);
    toast.success("Onboarding link copied to clipboard!");
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (data === undefined) {
    return (
      <div className="flex-1 p-8 md:p-12 space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 bg-white/5" />
          <Skeleton className="h-12 w-96 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-1 bg-white/5 rounded-[2.5rem]" />
          <Skeleton className="h-[400px] lg:col-span-2 bg-white/5 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Employee Not Found</h1>
        <p className="text-white/40 max-w-sm">The employee you're looking for doesn't exist or you don't have access.</p>
        <Link href="/employees">
          <Button variant="outline" className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const { employee, projects, stats } = data;

  return (
    <div className="flex-1 p-8 md:p-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
              TEAM MEMBER
            </span>
            <OnboardingBadge isComplete={employee.onboardingComplete} />
          </div>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            {employee.name}
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-[0.1em] uppercase">
            Joined {new Date(employee._creationTime).toLocaleDateString()} • ID: {employee._id.slice(-6).toUpperCase()}
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/5"
          >
            EDIT PROFILE
          </Button>
          <Button
            className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-indigo-500 text-white hover:scale-[1.02] transition-transform"
          >
            MANAGE ACCESS
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Projects" 
          value={stats.totalProjects} 
          icon={LayoutGrid} 
          color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
        />
        <StatCard 
          label="Active Projects" 
          value={stats.activeProjects} 
          icon={Clock} 
          color="bg-amber-500/10 text-amber-400 border-amber-500/20" 
        />
        <StatCard 
          label="In Progress" 
          value={stats.inProgressProjects} 
          icon={CheckCircle2} 
          color="bg-blue-500/10 text-blue-400 border-blue-500/20" 
        />
        <StatCard 
          label="Completed" 
          value={stats.completedProjects} 
          icon={ShieldCheck} 
          color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info & Onboarding */}
        <div className="space-y-8 lg:col-span-1">
          {/* Detailed Info Card */}
          <Card className="rounded-[2.5rem] bg-indigo-500/5 border-white/5 p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Designation</span>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-indigo-400" />
                  <span className="text-lg font-bold text-white">{employee.designation || "Not Specified"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Contact Email</span>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <span className="text-base font-bold text-white/80">{employee.email}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Phone Number</span>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-indigo-400" />
                  <span className="text-base font-mono text-white/70">{employee.phone || "No phone added"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Company</span>
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-indigo-400" />
                  <span className="text-lg font-bold text-white">{employee.company || "Individual"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Onboarding Link Card (Only if not complete or for convenience) */}
          <Card className="rounded-[2.5rem] bg-amber-500/5 border-amber-500/10 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full translate-x-16 -translate-y-16" />
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Onboarding Access</h3>
              </div>
              
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                {employee.onboardingComplete 
                  ? "This employee has completed registration. The link below can be used for reference."
                  : "Send this invitation link to the employee so they can complete their registration and access the portal."}
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between group">
                  <span className="text-[9px] font-mono text-white/30 truncate mr-4">
                    {getOnboardingUrl()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="h-8 w-8 text-white/40 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={copyToClipboard}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  {isCopying ? "COPIED!" : "COPY LINK"}
                </Button>
                
                <Link href={getOnboardingUrl()} target="_blank" className="block">
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-xl text-white/40 hover:text-amber-400 hover:bg-amber-400/10 font-black uppercase tracking-widest text-[9px] gap-2"
                  >
                    PREVIEW PAGE <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Assigned Projects</h2>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
              {projects.length} TOTAL
            </span>
          </div>

          {projects.length === 0 ? (
            <Card className="rounded-[2.5rem] bg-white/2 border-white/5 p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                <LayoutGrid className="h-8 w-8" />
              </div>
              <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No projects assigned yet</p>
              <Button variant="outline" className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest">Assign First Project</Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Link key={project._id} href={`/projects/${project._id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="p-6 rounded-[2rem] bg-white/2 border border-white/5 hover:bg-white/5 hover:border-indigo-500/20 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-400/60 tracking-widest uppercase truncate max-w-[100px]">
                            {project.code}
                          </span>
                          <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                            {project.eventName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {project.projectTypeName}
                          </div>
                          {project.eventDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.eventDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                          project.actionState === 'work_in_progress' 
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                          {project.actionState.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/10 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
