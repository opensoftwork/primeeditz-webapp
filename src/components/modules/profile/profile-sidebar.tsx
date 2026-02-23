"use client";

import { motion } from "motion/react";
import { Camera, CheckCircle2, Clock, Pencil, Save, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleBadgeStyles } from "./constants";

interface ProfileSidebarProps {
  profile: any;
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
}

export function ProfileSidebar({
  profile,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSave,
}: ProfileSidebarProps) {
  const roleStyle = roleBadgeStyles[profile.role] || roleBadgeStyles.studio;
  const initials = profile.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="w-[280px] shrink-0 border-r border-white/5 px-8 pb-8"
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative group mb-6">
          <div className="relative">
            <Avatar className="size-28 ring-4 ring-white/5 shadow-2xl">
              {profile.image ? (
                <AvatarImage
                  src={profile.image}
                  alt={profile.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary/10 text-primary text-2xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Camera overlay */}
            <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
              <Camera className="size-6 text-white/80" />
            </button>
          </div>

          {/* Online indicator */}
          <div className="absolute bottom-1 right-1 size-5 rounded-full bg-emerald-500 ring-4 ring-background shadow-lg shadow-emerald-500/30" />
        </div>

        {/* Name */}
        <h2 className="text-xl font-black tracking-tight text-white mb-1">
          {profile.name}
        </h2>

        {/* Email */}
        <p className="text-sm text-white/40 font-medium mb-4 truncate max-w-full">
          {profile.email}
        </p>

        {/* Role Badge */}
        <Badge
          className={cn(
            "px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg mb-6",
            roleStyle.bg,
            roleStyle.text,
            roleStyle.border,
            roleStyle.glow,
          )}
        >
          {profile.role}
        </Badge>

        {/* Edit Profile Button */}
        {!isEditing ? (
          <Button
            onClick={onStartEditing}
            variant="outline"
            className="w-full h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold tracking-wide transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
          >
            <Pencil className="size-4 mr-2 text-primary" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              onClick={onCancelEditing}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold"
            >
              <X className="size-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="flex-1 h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Save className="size-4 mr-1" />
              Save
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
                Status
              </p>
              <p className="text-xs font-bold text-emerald-400">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="size-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
                Member Since
              </p>
              <p className="text-xs font-bold text-white/70">
                {new Date(profile._creationTime).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
