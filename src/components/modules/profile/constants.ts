import { User2, Mail, Shield, Activity, type LucideIcon } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type ProfileTab = "profile" | "account" | "security" | "activity";

export interface TabConfig {
  id: ProfileTab;
  label: string;
  icon: LucideIcon;
}

export interface EditFormState {
  name: string;
  phone: string;
  company: string;
}

// ============================================================================
// Tab Configuration
// ============================================================================

export const tabs: TabConfig[] = [
  { id: "profile", label: "Profile Info", icon: User2 },
  { id: "account", label: "Account", icon: Mail },
  { id: "security", label: "Security", icon: Shield },
  { id: "activity", label: "Activity", icon: Activity },
];

// ============================================================================
// Role Badge Styles
// ============================================================================

export const roleBadgeStyles: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  admin: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
  },
  studio: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/20",
  },
  employee: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
};
