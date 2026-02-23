import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFieldProps {
  icon: LucideIcon;
  label: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isEmpty?: boolean;
}

export function ProfileField({
  icon: Icon,
  label,
  value,
  isEditing,
  editValue,
  onChange,
  placeholder,
  isEmpty,
}: ProfileFieldProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300",
        isEditing
          ? "bg-white/4 border-primary/20 shadow-lg shadow-primary/5"
          : "bg-white/2 border-white/5 hover:border-white/10",
      )}
    >
      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block">
          {label}
        </Label>
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 bg-white/5 border-white/10 text-sm font-bold text-white placeholder:text-white/20 rounded-lg focus:border-primary/40 focus:ring-primary/20"
          />
        ) : (
          <p
            className={cn(
              "text-sm font-bold",
              isEmpty ? "text-white/20 italic" : "text-white",
            )}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
