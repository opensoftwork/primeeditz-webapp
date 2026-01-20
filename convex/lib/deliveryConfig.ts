/**
 * Delivery Configuration Utilities
 * 
 * Provides centralized logic for project-type-specific delivery behavior.
 */

import { Doc } from "../_generated/dataModel";

export interface DeliveryConfig {
  hasPhysicalDelivery: boolean;
  physicalDeliveryLabel: string;
  hasDigitalDelivery: boolean;
  digitalDeliveryLabel: string;
  requiresSignoff: boolean;
}

const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  hasPhysicalDelivery: false,
  physicalDeliveryLabel: "Physical Delivery",
  hasDigitalDelivery: true,
  digitalDeliveryLabel: "File Delivery",
  requiresSignoff: false,
};

/**
 * Gets the consolidated delivery configuration for a project type.
 * Falls back to defaults if not configured.
 */
export function getDeliveryConfig(projectType: Doc<"projectTypes">): DeliveryConfig {
  if (!projectType.deliveryConfig) {
    return DEFAULT_DELIVERY_CONFIG;
  }

  return {
    hasPhysicalDelivery: projectType.deliveryConfig.hasPhysicalDelivery,
    physicalDeliveryLabel:
      projectType.deliveryConfig.physicalDeliveryLabel || "Physical Delivery",
    hasDigitalDelivery: projectType.deliveryConfig.hasDigitalDelivery,
    digitalDeliveryLabel:
      projectType.deliveryConfig.digitalDeliveryLabel || "File Delivery",
    requiresSignoff: projectType.deliveryConfig.requiresSignoff,
  };
}

/**
 * Generates a human-readable label for the delivery phase based on config.
 * e.g., "Album Production & Digital Gallery"
 */
export function getDeliveryPhaseLabel(config: DeliveryConfig): string {
  const labels: string[] = [];

  if (config.hasPhysicalDelivery) {
    labels.push(config.physicalDeliveryLabel);
  }
  if (config.hasDigitalDelivery) {
    labels.push(config.digitalDeliveryLabel);
  }

  return labels.join(" & ") || "Preparing Delivery";
}
