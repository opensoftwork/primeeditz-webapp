import { Mail, Shield, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function AccountTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
          Account Details
        </h3>
        <p className="text-sm text-white/40 font-medium">
          Your account information and role within the system.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 transition-all hover:border-white/10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
              Email Address
            </p>
            <p className="text-sm font-bold text-white truncate">
              {profile.email}
            </p>
            <p className="text-[11px] text-white/30 mt-1">
              Email is managed by your authentication provider
            </p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase tracking-wider shrink-0">
            Verified
          </Badge>
        </div>

        {/* Role */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 transition-all hover:border-white/10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
              Role
            </p>
            <p className="text-sm font-bold text-white capitalize">
              {profile.role}
            </p>
            <p className="text-[11px] text-white/30 mt-1">
              Your role determines your access level and permissions
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 transition-all hover:border-white/10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
              Account Status
            </p>
            <p className="text-sm font-bold text-emerald-400">Active</p>
            <p className="text-[11px] text-white/30 mt-1">
              Last updated{" "}
              {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 transition-all hover:border-white/10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
              Account Created
            </p>
            <p className="text-sm font-bold text-white">
              {new Date(profile._creationTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
