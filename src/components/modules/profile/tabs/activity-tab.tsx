import { Activity } from "lucide-react";

import { ComingSoonPlaceholder } from "../components/coming-soon-placeholder";

export function ActivityTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
          Recent Activity
        </h3>
        <p className="text-sm text-white/40 font-medium">
          Track your recent actions and project history.
        </p>
      </div>

      <ComingSoonPlaceholder
        icon={Activity}
        title="Activity Feed"
        description="Your project activity, recent changes, and action history will appear here."
      />
    </div>
  );
}
