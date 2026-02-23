import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ComingSoonPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoonPlaceholder({
  icon: Icon,
  title,
  description,
}: ComingSoonPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-white/10 rounded-3xl bg-white/2">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 shadow-2xl shadow-primary/5">
        <Icon className="h-8 w-8 text-primary animate-pulse" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
        {title}
      </h3>
      <p className="text-white/40 font-medium max-w-sm text-center text-sm">
        {description}
      </p>
      <Badge className="mt-6 bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-widest">
        Coming Soon
      </Badge>
    </div>
  );
}
