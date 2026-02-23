"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { tabs, type ProfileTab, type EditFormState } from "./constants";
import { ProfileSidebar } from "./profile-sidebar";
import { ProfileSettingsSkeleton } from "./profile-skeleton";
import { ProfileInfoTab } from "./tabs/profile-info-tab";
import { AccountTab } from "./tabs/account-tab";
import { SecurityTab } from "./tabs/security-tab";
import { ActivityTab } from "./tabs/activity-tab";

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile data
  //@ts-ignore - Same pattern as layout.tsx for deeply nested type
  const profile = useQuery(api.profiles.getMyProfile);

  // Edit form state
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    phone: "",
    company: "",
  });

  const updateProfile = useMutation(
    api.functions.profiles.mutations.updateProfile,
  );

  // Initialize edit form when entering edit mode
  const startEditing = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
        company: profile.company || "",
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: editForm.name || undefined,
        phone: editForm.phone || undefined,
        company: editForm.company || undefined,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Loading state
  if (profile === undefined) {
    return <ProfileSettingsSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/40 font-medium">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <header className="px-8 pt-8 pb-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ACCOUNT
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white to-white/50">
            Profile Settings
          </h1>
        </motion.div>
      </header>

      {/* Main Layout: Sidebar + Tabs */}
      <div className="flex flex-1 gap-0 mt-8 overflow-hidden">
        {/* Left Profile Sidebar */}
        <ProfileSidebar
          profile={profile}
          isEditing={isEditing}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSave={handleSave}
        />

        {/* Right Content Area with Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="px-8 border-b border-white/5">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-5 py-4 group outline-none shrink-0"
                  >
                    <div className="flex items-center gap-2.5 relative z-10">
                      <tab.icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-300",
                          isActive
                            ? "text-primary"
                            : "text-white/30 group-hover:text-white/60",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-black uppercase tracking-wider transition-colors duration-300",
                          isActive
                            ? "text-white"
                            : "text-white/30 group-hover:text-white/60",
                        )}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="profileActiveTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary-rgb),0.5)]"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover background */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-t-lg transition-colors duration-300",
                        isActive ? "bg-white/2" : "group-hover:bg-white/2",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeTab === "profile" && (
                  <ProfileInfoTab
                    profile={profile}
                    isEditing={isEditing}
                    editForm={editForm}
                    setEditForm={setEditForm}
                  />
                )}
                {activeTab === "account" && <AccountTab profile={profile} />}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "activity" && <ActivityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
