import { Shield } from "lucide-react";

import { ComingSoonPlaceholder } from "../components/coming-soon-placeholder";

export function SecurityTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
          Security & Privacy
        </h3>
        <p className="text-sm text-white/40 font-medium">
          Manage your security and privacy preferences.
        </p>
      </div>

      <ComingSoonPlaceholder
        icon={Shield}
        title="Security Module"
        description="Password management, two-factor authentication, and session management will be available here."
      />
    </div>
  );
}
