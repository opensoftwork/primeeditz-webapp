"use client";

import { motion, AnimatePresence } from "motion/react";
import { User, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SelectedMember {
  profileId: string;
  name: string;
  role: string;
  image?: string;
}

interface SquadBuilderBarProps {
  selectedMembers: SelectedMember[];
  onRemove: (id: string) => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export function SquadBuilderBar({
  selectedMembers,
  onRemove,
  onConfirm,
  isConfirming,
}: SquadBuilderBarProps) {
  if (selectedMembers.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
    >
      <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 pr-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex -space-x-3 overflow-visible px-2">
            <AnimatePresence mode="popLayout">
              {selectedMembers.map((member) => (
                <motion.div
                  key={member.profileId}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group/avatar"
                >
                  <Avatar className="h-10 w-10 border-2 border-zinc-900 bg-zinc-800">
                    <AvatarImage src={member.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => onRemove(member.profileId)}
                    className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 opacity-0 group-hover/avatar:opacity-100 transition-opacity border border-zinc-900"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-black uppercase tracking-tight text-white leading-none">
              Build Project Squad
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {selectedMembers.length} Members Prepared
            </span>
          </div>
        </div>

        <Button
          onClick={onConfirm}
          disabled={isConfirming}
          className="rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest gap-2 h-12 px-8 transition-all hover:scale-105"
        >
          {isConfirming ? (
            <div className="animate-spin h-4 w-4 border-2 border-black/20 border-t-black rounded-full" />
          ) : (
            <>
              <Check className="h-4 w-4" />
              ASSIGN SQUAD
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
