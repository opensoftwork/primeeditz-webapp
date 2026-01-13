"use client";

import { FileText, Edit2, Trash2, Power, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Template } from "../quotation-sections/types";

interface TemplateCardProps {
  template: Template & {
    projectTypeName: string | null;
    calculatedSubtotal: number;
    calculatedGst: number;
    calculatedTotal: number;
  };
  onEdit: (template: Template) => void;
  onView: (template: Template) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TemplateCard({
  template,
  onEdit,
  onView,
  onToggleActive,
  onDelete,
}: TemplateCardProps) {
  return (
    <div
      className={cn(
        "group relative p-5 rounded-2xl bg-white/5 border border-white/10 transition-[background-color,border-color,box-shadow,opacity,filter] duration-300 hover:bg-white/8 hover:shadow-xl hover:shadow-black/40 overflow-hidden",
        !template.isActive && "opacity-60 grayscale"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold tracking-tight text-sm leading-tight truncate">
              {template.name}
            </h3>
            {template.projectTypeName && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-1 w-2 bg-primary/40 rounded-full" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest truncate">
                  {template.projectTypeName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              template.isActive ? "bg-green-500 animate-pulse" : "bg-white/20"
            )}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
            {template.isActive ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
            Total
          </span>
          <span className="text-lg font-black text-white tracking-tight">
            {formatCurrency(template.calculatedTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 text-white/20" />
            <span className="text-[9px] font-bold text-white/20">
              {template.lineItems.length} item
              {template.lineItems.length !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-[9px] font-bold text-white/20">
            +{formatCurrency(template.calculatedGst)} GST
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(template)}
          className="h-9 w-9 bg-white/5 hover:bg-white/10 text-white rounded-lg p-0"
        >
          <Edit2 className="h-3 w-3 opacity-40 shrink-0" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(template)}
          className="flex-1 h-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest"
        >
          View Detailed Architecture
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleActive(template._id, template.isActive)}
          className={cn(
            "h-9 w-9 rounded-lg",
            template.isActive
              ? "text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10"
              : "text-green-500/40 hover:text-green-500 hover:bg-green-500/10"
          )}
        >
          <Power className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(template._id)}
          className="h-9 w-9 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
