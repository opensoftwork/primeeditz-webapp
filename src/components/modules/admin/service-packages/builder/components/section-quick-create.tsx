"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus, PlusCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface SectionQuickCreateProps {
  onCreated: (sectionId: string) => void;
}

export function SectionQuickCreate({ onCreated }: SectionQuickCreateProps) {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSection = useMutation(
    api.functions.quotations.sections.mutations.createSection,
  );

  async function handleCreate() {
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
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to create section");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1.5"
        >
          <PlusCircle className="h-3 w-3" />
          Add Phase
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-zinc-950 border-white/10 rounded-2xl p-4 shadow-2xl glass-subtle">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">
              New Quotation Phase
            </h4>
            <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
              e.g. Production, Post-Production, Delivery
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="Phase name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-xl text-sm transition-all"
            />
            <Button
              size="icon"
              onClick={handleCreate}
              disabled={isSubmitting || !name.trim()}
              className="h-10 w-10 shrink-0 bg-primary text-primary-foreground rounded-xl"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
