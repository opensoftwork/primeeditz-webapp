"use client";

import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface QuotationCardProps {
  quotation: {
    _id: string;
    code: string;
    version: number;
    status: string;
    total: number;
    _creationTime: number;
    clientName?: string;
    projectName?: string;
  };
  onView: (id: string) => void;
}

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-white/40",
    bgColor: "bg-white/5",
  },
  sent: {
    label: "Sent",
    icon: ArrowRight,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  viewed: {
    label: "Viewed",
    icon: ShieldCheck,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  changes_requested: {
    label: "Revisions",
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
  },
  superseded: {
    label: "Superseded",
    icon: FileText,
    color: "text-zinc-600",
    bgColor: "bg-zinc-600/5",
  },
};

export function QuotationCard({ quotation, onView }: QuotationCardProps) {
  const status = statusConfig[quotation.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/2 p-1 transition-all hover:border-white/10 hover:bg-white/4"
    >
      {/* Visual Accent */}
      <div
        className={cn(
          "absolute top-0 right-0 h-24 w-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity rounded-full",
          status.color.replace("text-", "bg-")
        )}
      />

      <div className="relative h-full space-y-5 p-6 flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Ref: {quotation.code}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                v{quotation.version}
              </span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
              {quotation.projectName || "Standard Quotation"}
            </h3>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/5",
              status.bgColor,
              status.color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">
              {status.label}
            </span>
          </div>
        </div>

        {/* Client / Project Info */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <User className="h-4 w-4 text-white/40" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Client
              </span>
              <span className="text-sm font-bold text-white/70 truncate max-w-[150px]">
                {quotation.clientName || "Direct Inquiry"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <Calendar className="h-4 w-4 text-white/40" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Created
              </span>
              <span className="text-sm font-bold text-white/70">
                {format(quotation._creationTime, "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-5 border-t border-white/5">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Total Valuation
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-white/40 tracking-tighter">
                  ₹
                </span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  {quotation.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(quotation._id)}
              className="h-10 w-10 p-0 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all hover:scale-105"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
