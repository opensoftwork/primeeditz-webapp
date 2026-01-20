"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Truck, Globe, CheckSquare, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "motion/react";
import type { Id } from "@convex/_generated/dataModel";

interface DeliveryConfig {
  hasPhysicalDelivery: boolean;
  physicalDeliveryLabel?: string;
  hasDigitalDelivery: boolean;
  digitalDeliveryLabel?: string;
  requiresSignoff: boolean;
}

interface DeliveryConfigFormProps {
  projectTypeId: Id<"projectTypes">;
  initialConfig?: DeliveryConfig;
}

export function DeliveryConfigForm({
  projectTypeId,
  initialConfig,
}: DeliveryConfigFormProps) {
  const updateProjectType = useMutation(
    api.functions.admin.projectTypes.updateProjectType,
  );
  const [isPending, setIsPending] = useState(false);

  const [config, setConfig] = useState<DeliveryConfig>({
    hasPhysicalDelivery: initialConfig?.hasPhysicalDelivery ?? false,
    physicalDeliveryLabel: initialConfig?.physicalDeliveryLabel ?? "",
    hasDigitalDelivery: initialConfig?.hasDigitalDelivery ?? true,
    digitalDeliveryLabel: initialConfig?.digitalDeliveryLabel ?? "",
    requiresSignoff: initialConfig?.requiresSignoff ?? false,
  });

  // Sync with initialConfig when it changes (e.g., after a mutation or on load)
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        hasPhysicalDelivery: initialConfig.hasPhysicalDelivery ?? false,
        physicalDeliveryLabel: initialConfig.physicalDeliveryLabel ?? "",
        hasDigitalDelivery: initialConfig.hasDigitalDelivery ?? true,
        digitalDeliveryLabel: initialConfig.digitalDeliveryLabel ?? "",
        requiresSignoff: initialConfig.requiresSignoff ?? false,
      });
    }
  }, [initialConfig]);

  const handleSave = async () => {
    setIsPending(true);
    try {
      await updateProjectType({
        id: projectTypeId,
        deliveryConfig: config,
      });
      toast.success("Delivery settings saved");
    } catch (error) {
      toast.error("Failed to save delivery settings");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-8 rounded-[2rem] bg-white/3 border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Delivery Settings
            </h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Configure delivery phase behavior
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Physical Delivery */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-white/80">
                  Physical Delivery
                </Label>
                <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">
                  Albums, prints, or physical storage
                </p>
              </div>
              <Switch
                checked={config.hasPhysicalDelivery}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    hasPhysicalDelivery: checked,
                  }))
                }
              />
            </div>
            {config.hasPhysicalDelivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">
                  Custom Label (Optional)
                </Label>
                <Input
                  value={config.physicalDeliveryLabel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      physicalDeliveryLabel: e.target.value,
                    }))
                  }
                  placeholder="e.g., Album Production"
                  className="bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold uppercase tracking-widest"
                />
              </motion.div>
            )}
          </div>

          {/* Digital Delivery */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-white/80">
                  Digital Delivery
                </Label>
                <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">
                  Download links and online galleries
                </p>
              </div>
              <Switch
                checked={config.hasDigitalDelivery}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    hasDigitalDelivery: checked,
                  }))
                }
              />
            </div>
            {config.hasDigitalDelivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">
                  Custom Label (Optional)
                </Label>
                <Input
                  value={config.digitalDeliveryLabel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      digitalDeliveryLabel: e.target.value,
                    }))
                  }
                  placeholder="e.g., Video Rendering"
                  className="bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold uppercase tracking-widest"
                />
              </motion.div>
            )}
          </div>

          {/* Signoff Requirement */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                  <CheckSquare className="h-3 w-3 text-primary/60" />
                  Client Signoff
                </Label>
                <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">
                  Requires client to confirm receipt
                </p>
              </div>
              <Switch
                checked={config.requiresSignoff}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, requiresSignoff: checked }))
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-12 gap-2"
        >
          <Save className="h-4 w-4" />
          {isPending ? "SAVING..." : "SAVE SETTINGS"}
        </Button>
      </div>
    </div>
  );
}
