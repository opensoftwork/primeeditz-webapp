"use client";

import { Check, Copy, Link, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareLinkSectionProps {
  shareToken?: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function ShareLinkSection({
  shareToken,
  isGenerating,
  onGenerate,
}: ShareLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  // Generate the full URL - using window.location for dynamic origin
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/q/${shareToken}`
      : "";

  const handleCopy = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/2 p-6 transition-all hover:bg-white/4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Link className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Share Link
            </span>
            <span className="text-sm font-bold text-white/70">
              For clients without an account
            </span>
          </div>
        </div>

        {!shareToken && (
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Generate Link
          </Button>
        )}
      </div>

      {shareToken && (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 overflow-hidden h-12 bg-black/40 rounded-2xl border border-white/5 flex items-center px-4 group/url">
            <span className="text-xs font-bold text-white/40 truncate select-all">
              {shareUrl}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className={cn(
              "h-12 w-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all",
              copied && "border-green-500/50 bg-green-500/10 text-green-400",
            )}
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5 text-white/40" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-12 w-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/40"
            title="Regenerate link"
          >
            <RefreshCw
              className={cn("h-5 w-5", isGenerating && "animate-spin")}
            />
          </Button>
        </div>
      )}
    </div>
  );
}
