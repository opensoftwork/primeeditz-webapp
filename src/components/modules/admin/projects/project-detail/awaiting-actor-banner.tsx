"use client";

import { motion } from "motion/react";
import { Clock, User, UserCog } from "lucide-react";
import { AdminProjectDetail } from "./types";

interface AwaitingActorBannerProps {
  project: AdminProjectDetail;
}

export function AwaitingActorBanner({ project }: AwaitingActorBannerProps) {
  const { awaitingActorRole, actionState } = project;

  if (!awaitingActorRole || awaitingActorRole === "admin") {
    return null;
  }

  const config = getAwaitingConfig(awaitingActorRole, actionState);

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
        <div>
          <h4 className="text-xs font-black uppercase tracking-tight text-amber-500">
            {config.title}
          </h4>
          <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest leading-relaxed">
            {config.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function getAwaitingConfig(role: string, state: string) {
  if (role === "client") {
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
      ...(messages[state] || {
        title: "Waiting for Client",
        message: "Client action is required to move this project forward.",
      }),
    };
  }

  if (role === "employee") {
    const messages: Record<string, { title: string; message: string }> = {
      assigned: {
        title: "Employee Action",
        message:
          "An employee has been assigned. They are expected to start work soon.",
      },
      work_in_progress: {
        title: "Work In Progress",
        message: "Employee is currently active on deliverables.",
      },
      revisions_requested: {
        title: "Revisions In Progress",
        message: "Employee is working on the requested revisions.",
      },
    };
    return {
      icon: UserCog,
      ...(messages[state] || {
        title: "Employee Active",
        message: "An employee is currently handling this phase.",
      }),
    };
  }

  return { icon: Clock, title: "Pending", message: "Waiting for next action." };
}
