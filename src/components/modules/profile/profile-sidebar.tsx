"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Camera,
  CheckCircle2,
  Clock,
  Pencil,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleBadgeStyles } from "./constants";
import { api } from "@convex/_generated/api";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const generateUploadUrl = useAction(
    //@ts-ignore
    api.functions.storage.actions.generateProfilePhotoUploadUrl,
  );
  const getSignedUrl = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );
  const updateProfile = useMutation(
    api.functions.profiles.mutations.updateProfile,
  );

  // Resolve the stored image key to a signed URL for display
  useEffect(() => {
    const fetchPhotoUrl = async () => {
      if (
        profile.image &&
        (profile.image.startsWith("profiles/") || profile.image.includes("/"))
      ) {
        try {
          const url = await getSignedUrl({ storageKey: profile.image });
          setPhotoPreviewUrl(url);
        } catch (error) {
          console.error("Failed to fetch profile photo URL:", error);
          setPhotoPreviewUrl(null);
        }
      } else if (profile.image) {
        // Direct URL (e.g. from auth provider)
        setPhotoPreviewUrl(profile.image);
      } else {
        setPhotoPreviewUrl(null);
      }
    };
    fetchPhotoUrl();
  }, [profile.image, getSignedUrl]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get a pre-signed upload URL
      const { url, storageKey } = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type,
      });

      // 2. Upload to MinIO
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) throw new Error("Upload failed");

      // 3. Save the storage key to the profile
      await updateProfile({ image: storageKey });

      // 4. Show preview immediately
      const preview = await getSignedUrl({ storageKey });
      setPhotoPreviewUrl(preview);

      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Profile photo upload error:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
              {photoPreviewUrl ? (
                <AvatarImage
                  src={photoPreviewUrl}
                  alt={profile.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary/10 text-primary text-2xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Upload spinner overlay */}
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center z-20">
                <Loader2 className="size-8 text-primary animate-spin" />
              </div>
            )}

            {/* Camera overlay - clickable to upload */}
            {!isUploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
              >
                <Camera className="size-6 text-white/80" />
              </button>
            )}
          </div>

          {/* Online indicator */}
          <div className="absolute bottom-1 right-1 size-5 rounded-full bg-emerald-500 ring-4 ring-background shadow-lg shadow-emerald-500/30" />
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

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
