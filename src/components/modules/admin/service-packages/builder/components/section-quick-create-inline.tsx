"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SectionQuickCreateInlineProps {
  onCreated: (sectionId: string) => void;
}

export function SectionQuickCreateInline({ onCreated }: SectionQuickCreateInlineProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSection = useMutation(
    api.functions.quotations.sections.mutations.createSection,
  );

  async function handleCreate(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!name.trim()) {
      toast.error("Section name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createSection({
        name: name.trim(),
      });
      toast.success("Section created");
      onCreated(id);
      setName("");
      setIsAdding(false);
    } catch (err) {
      toast.error("Failed to create section");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAdding) {
    return (
      <div 
        className="px-2 py-2 border-t border-white/5 bg-white/2 space-y-2 mt-1"
        onKeyDown={(e) => e.stopPropagation()} // Prevent select from closing on space
      >
        <div className="flex items-center gap-1">
          <Input
            autoFocus
            size={undefined}
            placeholder="Phase name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === "Enter") handleCreate(e);
               if (e.key === "Escape") setIsAdding(false);
            }}
            className="h-8 bg-black/40 border-white/10 rounded-lg text-[10px] px-2 placeholder:text-white/10"
          />
          <Button
            size="icon"
            onClick={handleCreate}
            disabled={isSubmitting || !name.trim()}
            className="h-8 w-8 shrink-0 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          <Button
             size="icon"
             variant="ghost"
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsAdding(false);
             }}
             className="h-8 w-8 shrink-0 text-white/20 hover:text-white hover:bg-white/5 rounded-lg"
          >
             <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
      }}
      className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors border-t border-white/5 mt-1"
    >
      <Plus className="h-3 w-3" />
      Create New Phase
    </button>
  );
}
