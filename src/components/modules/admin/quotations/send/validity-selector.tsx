"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValiditySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ValiditySelector({
  value,
  onValueChange,
}: ValiditySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">
        Link Validity
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12 bg-white/5 border-white/5 rounded-2xl text-sm font-bold text-white group-hover:bg-white/10 transition-colors">
          <SelectValue placeholder="Select validity" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/5 rounded-2xl overflow-hidden p-1 shadow-2xl backdrop-blur-xl">
          <SelectItem
            value="7"
            className="rounded-xl text-white/70 focus:bg-white/10 focus:text-white font-bold py-3"
          >
            7 Days
          </SelectItem>
          <SelectItem
            value="14"
            className="rounded-xl text-white/70 focus:bg-white/10 focus:text-white font-bold py-3"
          >
            14 Days
          </SelectItem>
          <SelectItem
            value="30"
            className="rounded-xl text-white/70 focus:bg-white/10 focus:text-white font-bold py-3"
          >
            30 Days
          </SelectItem>
          <SelectItem
            value="90"
            className="rounded-xl text-white/70 focus:bg-white/10 focus:text-white font-bold py-3"
          >
            90 Days
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
