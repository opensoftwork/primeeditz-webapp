"use client";

import { Clock, User, UserCog } from "lucide-react";
import { motion } from "motion/react";
import type { AdminProjectDetail } from "./types";

interface AwaitingActorBannerProps {
  project: AdminProjectDetail;
}

export function AwaitingActorBanner({ project }: AwaitingActorBannerProps) {
  const { awaitingActorRole, actionState, assignedEmployeeName } = project;

  if (!awaitingActorRole || awaitingActorRole === "admin") {
    return null;
  }

  const config = getAwaitingConfig(
    awaitingActorRole,
    actionState,
    assignedEmployeeName,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 mb-8"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-amber-500/10 mt-0.5">
          <config.icon className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black uppercase tracking-tight text-amber-500">
              {config.title}
            </h4>
            {config.actorName && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">
                {config.actorName}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest leading-relaxed">
            {config.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function getAwaitingConfig(role: string, state: string, employeeName?: string) {
  if (role === "studio" || role === "studio") {
    const messages: Record<string, { title: string; message: string }> = {
      quotation_sent: {
        title: "Waiting for Client",
        message:
          "Client is reviewing the quotation. They will be notified to approve or request changes.",
      },
      awaiting_uploads: {
        title: "Client Uploading",
        message:
          "Client has been notified to upload their files. Check the folders section for progress.",
      },
      awaiting_review: {
        title: "Client Reviewing",
        message:
          "Client is reviewing the deliverables. They can approve or request revisions.",
      },
      delivered: {
        title: "Client Receipt",
        message:
          "Waiting for client to confirm receipt and finalize the project.",
      },
    };
    return {
      icon: User,
      actorName: null,
      ...(messages[state] || {
        title: "Waiting for Client",
        message: "Client action is required to move this project forward.",
      }),
    };
  }

  if (role === "employee") {
    const messages: Record<string, { title: string; message: string }> = {
      assigned: {
        title: "Employee Assigned",
        message: employeeName
          ? `${employeeName} has been assigned and is expected to start work soon.`
          : "An employee has been assigned. They are expected to start work soon.",
      },
      work_in_progress: {
        title: "Work In Progress",
        message: employeeName
          ? `${employeeName} is currently active on deliverables.`
          : "Employee is currently active on deliverables.",
      },
      revisions_requested: {
        title: "Revisions In Progress",
        message: employeeName
          ? `${employeeName} is working on the requested revisions.`
          : "Employee is working on the requested revisions.",
      },
    };
    return {
      icon: UserCog,
      actorName: employeeName || null,
      ...(messages[state] || {
        title: "Employee Active",
        message: "An employee is currently handling this phase.",
      }),
    };
  }

  return {
    icon: Clock,
    title: "Pending",
    message: "Waiting for next action.",
    actorName: null,
  };
}
