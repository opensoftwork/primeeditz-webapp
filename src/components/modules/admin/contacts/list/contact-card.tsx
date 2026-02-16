"use client";

import { format } from "date-fns";
import { Eye, Mail, MessageSquare, Phone, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminContact } from "./types";

interface ContactCardProps {
  item: AdminContact;
  onView: () => void;
  onDelete: () => void;
}

export function ContactCard({ item, onView, onDelete }: ContactCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onView}
      className="cursor-pointer"
    >
      <Card className="group relative overflow-hidden bg-white/2 border-white/5 p-6 rounded-3xl transition-all hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {item.service}
                </span>
                <Badge className="w-fit font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md mt-0.5 shadow-none bg-primary/10 text-primary border-primary/20">
                  {format(item._creationTime, "MMM dd")}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                title="View Details"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
              {item.message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
            <div className="flex items-center gap-4 text-[10px] text-white/30">
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[120px]">{item.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />
                {item.phoneno}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
