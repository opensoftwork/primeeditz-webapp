---
id: 5a-5
title: Project Type Delivery Configuration
epic: 05a-project-status-workflow
status: done
priority: medium
points: 3
assignee: null
dependencies:
  - 5a-1
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.5: Project Type Delivery Configuration

## User Story

**As an** Admin,
**I want** to configure how the delivery phase works for each project type,
**So that** projects show context-appropriate labels (e.g., "Album Production" vs "Video Rendering").

## Background

Different project types have different delivery requirements:

- **Wedding Album**: Physical album production + digital files
- **Video Editing**: Digital video rendering only
- **Pre-Wedding Shoot**: Photos + optional album

The "preparing_delivery" phase should show appropriate labels and options based on project type.

## Acceptance Criteria

### AC-1: Schema Update

**Given** the `projectTypes` table
**When** the schema is updated
**Then** a new `deliveryConfig` field must be added:

```typescript
projectTypes: defineTable({
  // ... existing fields ...

  deliveryConfig: v.optional(v.object({
    hasPhysicalDelivery: v.boolean(),        // Album, prints, USB
    physicalDeliveryLabel: v.optional(v.string()), // e.g., "Album Production"
    hasDigitalDelivery: v.boolean(),         // Download links
    digitalDeliveryLabel: v.optional(v.string()),  // e.g., "Video Rendering"
    requiresSignoff: v.boolean(),            // Client must confirm receipt
  })),
}),
```

### AC-2: Default Values

**Given** a project type without deliveryConfig
**When** the delivery phase is reached
**Then** default values must be used:

- `hasPhysicalDelivery: false`
- `hasDigitalDelivery: true`
- `digitalDeliveryLabel: "File Delivery"`
- `requiresSignoff: false`

### AC-3: UI Label Display

**Given** a project of type "Wedding Album" with `physicalDeliveryLabel: "Album Production"`
**When** the project is in `actionState: 'preparing_delivery'`
**Then** the UI must display "Album Production" instead of generic "Preparing Delivery".

### AC-4: Delivery Options Display

**Given** a project in the delivery phase
**When** the admin views the project detail
**Then** show delivery checklist based on config:

- [ ] Physical delivery: [Label] (if hasPhysicalDelivery)
- [ ] Digital delivery: [Label] (if hasDigitalDelivery)
- [ ] Client signoff required (if requiresSignoff)

### AC-5: Project Type Admin UI

**Given** the project type editing page
**When** an admin edits a project type
**Then** a "Delivery Settings" section must appear with:

- Toggle: Has Physical Delivery
- Input: Physical Delivery Label (shown when toggled on)
- Toggle: Has Digital Delivery
- Input: Digital Delivery Label (shown when toggled on)
- Toggle: Requires Client Signoff
- Preview of how delivery phase will appear

## Technical Design

### Schema Update

```typescript
// convex/schema.ts

// Add to projectTypes table
deliveryConfig: v.optional(v.object({
  hasPhysicalDelivery: v.boolean(),
  physicalDeliveryLabel: v.optional(v.string()),
  hasDigitalDelivery: v.boolean(),
  digitalDeliveryLabel: v.optional(v.string()),
  requiresSignoff: v.boolean(),
})),
```

### Utility Function

```typescript
// convex/lib/delivery-config.ts

interface DeliveryConfig {
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

export function getDeliveryConfig(projectType: ProjectType): DeliveryConfig {
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
```

### Files to Create/Modify

```
convex/
├── schema.ts                    # Add deliveryConfig to projectTypes
├── lib/
│   └── delivery-config.ts       # NEW: Delivery config utilities
└── functions/
    └── admin/
        └── projectTypes.ts      # Update mutations for deliveryConfig

src/components/modules/admin/
└── project-types/
    └── delivery-config-form.tsx  # NEW: Delivery settings form
```

## Definition of Done

- [ ] Schema updated with deliveryConfig field
- [ ] Utility functions created
- [ ] Admin UI shows delivery settings
- [ ] Project detail shows context-appropriate labelsqwert
- [ ] Default config works for types without config
- [ ] **Seed data updated with deliveryConfig for all project types**
- [ ] TypeScript compiles without errors

## Seed Data Update

**IMPORTANT**: Update `convex/seed.ts` to include deliveryConfig for existing project types:

```typescript
// In seed.ts - projectTypes seed data

const projectTypes = [
  {
    name: "Wedding Album",
    categoryId: weddingCategory._id,
    isActive: true,
    deliveryConfig: {
      hasPhysicalDelivery: true,
      physicalDeliveryLabel: "Album Production",
      hasDigitalDelivery: true,
      digitalDeliveryLabel: "Photo Delivery",
      requiresSignoff: true,
    },
  },
  {
    name: "Video Editing",
    categoryId: videoCategory._id,
    isActive: true,
    deliveryConfig: {
      hasPhysicalDelivery: false,
      physicalDeliveryLabel: null,
      hasDigitalDelivery: true,
      digitalDeliveryLabel: "Video Rendering",
      requiresSignoff: false,
    },
  },
  {
    name: "Photo Editing",
    categoryId: photoCategory._id,
    isActive: true,
    deliveryConfig: {
      hasPhysicalDelivery: false,
      physicalDeliveryLabel: null,
      hasDigitalDelivery: true,
      digitalDeliveryLabel: "Photo Delivery",
      requiresSignoff: false,
    },
  },
  {
    name: "Pre-Wedding Shoot",
    categoryId: weddingCategory._id,
    isActive: true,
    deliveryConfig: {
      hasPhysicalDelivery: true,
      physicalDeliveryLabel: "Print Package",
      hasDigitalDelivery: true,
      digitalDeliveryLabel: "Photo Delivery",
      requiresSignoff: true,
    },
  },
  {
    name: "Corporate Event",
    categoryId: corporateCategory._id,
    isActive: true,
    deliveryConfig: {
      hasPhysicalDelivery: false,
      physicalDeliveryLabel: null,
      hasDigitalDelivery: true,
      digitalDeliveryLabel: "File Handover",
      requiresSignoff: false,
    },
  },
];
```

## Estimated Effort

- Schema update: 30 min
- Utility functions: 1 hour
- Admin UI: 1.5 hours
- **Total: ~3 hours**

## Sample Configurations

| Project Type    | Physical | Physical Label   | Digital | Digital Label   | Signoff |
| --------------- | -------- | ---------------- | ------- | --------------- | ------- |
| Wedding Album   | ✅       | Album Production | ✅      | Photo Delivery  | ✅      |
| Video Editing   | ❌       | -                | ✅      | Video Rendering | ❌      |
| Photo Editing   | ❌       | -                | ✅      | Photo Delivery  | ❌      |
| Pre-Wedding     | ✅       | Print Package    | ✅      | Photo Delivery  | ✅      |
| Corporate Event | ❌       | -                | ✅      | File Handover   | ❌      |
