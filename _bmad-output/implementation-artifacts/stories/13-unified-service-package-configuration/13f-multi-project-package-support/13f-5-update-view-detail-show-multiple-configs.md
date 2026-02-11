# Story 13F.5: Update View/Detail - Show Multiple Configs

**Status**: done
**Points**: 2  
**Epic**: [13F: Multi-Project Package Support](../../../../planning-artifacts/epics/13f-multi-project-package-support.md)  
**Depends On**: 13F.1 (Schema), 13F.2 (Builder Step 2)

---

## User Story

**As an** Admin,  
**I want** to see all project configurations when viewing a package,  
**So that** I can review the complete combo setup before or after publishing.

---

## Acceptance Criteria

### AC1: Projects Section in Detail View

**Given** the package detail page  
**When** viewing a package with `projectConfigs`  
**Then** a "Projects This Package Creates" section is displayed

**And** it shows the count: "This package will create X projects"

### AC2: Project Config Cards

**Given** a package has project configs  
**When** the projects section is rendered  
**Then** each config is displayed as a card showing:

- Config label (e.g., "Photo Editing")
- Project Type name (fetched from DB)
- Folder Template name (fetched from DB)
- Storage Tier badge (if configured)

### AC3: Line Items Grouped by Config

**Given** line items have `projectConfigId` assigned  
**When** viewing the pricing section  
**Then** line items are grouped by their project config

**And** subtotals are shown per config

### AC4: Edit Button Behavior

**Given** the package detail page  
**When** user clicks "Edit"  
**Then** the builder wizard opens with all projectConfigs pre-filled in Step 2

### AC5: Backward Compatibility Display

**Given** a legacy package without `projectConfigs`  
**When** viewing the detail page  
**Then** it shows the single project type and folder template

**And** no grouping is applied to line items

---

## Technical Implementation

### Files to Modify

```
MODIFY: src/components/modules/admin/service-packages/detail/package-detail.tsx
  - Add "Projects This Package Creates" section
  - Fetch related data (project types, templates, tiers)
  - Group line items by projectConfigId

CREATE: src/components/modules/admin/service-packages/detail/components/project-config-preview.tsx
  - Reusable card for displaying a project config
  - Shows all config details with proper formatting
```

### Package Detail Component Structure

```tsx
// detail/package-detail.tsx

export function PackageDetail({
  packageId,
}: {
  packageId: Id<"servicePackages">;
}) {
  const pkg = useQuery(api.functions.servicePackages.queries.get, {
    id: packageId,
  });
  const projectTypes = useQuery(api.functions.projectTypes.queries.list);
  const folderTemplates = useQuery(api.functions.folderTemplates.queries.list);
  const storageTiers = useQuery(
    api.functions.storageTiers.queries.listStorageTiers,
  );

  if (pkg === undefined) return <PackageDetailLoading />;
  if (!pkg) return <PackageDetailError message="Package not found" />;

  // Resolve config references
  const resolvedConfigs = useMemo(() => {
    if (!pkg.projectConfigs) {
      // Legacy: single config from deprecated fields
      if (pkg.projectTypeId && pkg.folderTemplateId) {
        return [
          {
            id: "legacy",
            label: "Default",
            projectTypeId: pkg.projectTypeId,
            folderTemplateId: pkg.folderTemplateId,
            defaultStorageTierId: pkg.defaultStorageTierId,
            projectTypeName: projectTypes?.find(
              (t) => t._id === pkg.projectTypeId,
            )?.name,
            folderTemplateName: folderTemplates?.find(
              (t) => t._id === pkg.folderTemplateId,
            )?.name,
            storageTierName: storageTiers?.find(
              (t) => t._id === pkg.defaultStorageTierId,
            )?.name,
          },
        ];
      }
      return [];
    }

    return pkg.projectConfigs.map((config) => ({
      ...config,
      projectTypeName: projectTypes?.find((t) => t._id === config.projectTypeId)
        ?.name,
      folderTemplateName: folderTemplates?.find(
        (t) => t._id === config.folderTemplateId,
      )?.name,
      storageTierName: storageTiers?.find(
        (t) => t._id === config.defaultStorageTierId,
      )?.name,
    }));
  }, [pkg, projectTypes, folderTemplates, storageTiers]);

  // Group line items
  const groupedLineItems = useMemo(() => {
    const groups: Record<string, typeof pkg.lineItems> = { __general__: [] };
    resolvedConfigs.forEach((c) => {
      groups[c.id] = [];
    });

    pkg.lineItems.forEach((item) => {
      const key = item.projectConfigId || "__general__";
      if (groups[key]) {
        groups[key].push(item);
      } else {
        groups.__general__.push(item);
      }
    });

    return groups;
  }, [pkg.lineItems, resolvedConfigs]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PackageHeader pkg={pkg} />

      {/* Projects Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Projects This Package Creates ({resolvedConfigs.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resolvedConfigs.map((config) => (
            <ProjectConfigPreview key={config.id} config={config} />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
        <GroupedPricingDisplay
          lineItems={pkg.lineItems}
          configs={resolvedConfigs}
          groupedItems={groupedLineItems}
          applyGST={pkg.applyGST ?? true}
        />
      </section>

      {/* Terms Section */}
      {pkg.terms && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
          <div className="prose prose-sm prose-invert max-w-none">
            {pkg.terms}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/admin/settings/service-packages/${packageId}/edit`}>
            Edit Package
          </Link>
        </Button>
        <Button variant="outline" onClick={handleDuplicate}>
          Duplicate
        </Button>
        <Button variant="destructive" onClick={handleToggleActive}>
          {pkg.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
```

### Project Config Preview Card

```tsx
// components/project-config-preview.tsx

interface ProjectConfigPreviewProps {
  config: {
    id: string;
    label?: string;
    projectTypeName?: string;
    folderTemplateName?: string;
    storageTierName?: string;
  };
}

export function ProjectConfigPreview({ config }: ProjectConfigPreviewProps) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {getProjectIcon(config.projectTypeName)}
          {config.label || "Default Project"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span>{config.projectTypeName || "Unknown"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Template:</span>
          <span>{config.folderTemplateName || "None"}</span>
        </div>
        {config.storageTierName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage:</span>
            <Badge variant="secondary">{config.storageTierName}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getProjectIcon(typeName?: string) {
  if (!typeName) return <Folder className="h-4 w-4" />;
  if (typeName.toLowerCase().includes("photo"))
    return <Camera className="h-4 w-4" />;
  if (typeName.toLowerCase().includes("video"))
    return <Video className="h-4 w-4" />;
  if (typeName.toLowerCase().includes("album"))
    return <Book className="h-4 w-4" />;
  return <Folder className="h-4 w-4" />;
}
```

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ Complete Wedding Package                           [Active] │
│ Category: Premium Wedding                                   │
│ Created: Jan 15, 2026                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📦 PROJECTS THIS PACKAGE CREATES (3)                        │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ 📷 Photo Editing    │ │ 🎬 Video Editing    │             │
│ │                     │ │                     │             │
│ │ Type: Photo Post-   │ │ Type: Video         │             │
│ │       Production    │ │       Production    │             │
│ │ Template: Wedding   │ │ Template: Wedding   │             │
│ │           Photos    │ │           Cinema    │             │
│ │ Storage: Premium    │ │ Storage: Enterprise │             │
│ │          (500GB)    │ │          (1TB)      │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ ┌─────────────────────┐                                     │
│ │ 📚 Album Design     │                                     │
│ │                     │                                     │
│ │ Type: Album         │                                     │
│ │       Production    │                                     │
│ │ Template: Premium   │                                     │
│ │           Album     │                                     │
│ │ Storage: Standard   │                                     │
│ │          (100GB)    │                                     │
│ └─────────────────────┘                                     │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 💰 PRICING                                                  │
│                                                             │
│ 📷 Photo Editing                                            │
│ ├── Culling (500 images): ₹5,000                            │
│ └── Retouching (100 images): ₹5,000                         │
│     Subtotal: ₹10,000                                       │
│                                                             │
│ 🎬 Video Editing                                            │
│ ├── Main Film Editing: ₹15,000                              │
│ └── Color Grading (30 min): ₹6,000                          │
│     Subtotal: ₹21,000                                       │
│                                                             │
│ 📚 Album Design                                             │
│ └── Album Design (20 spreads): ₹10,000                      │
│     Subtotal: ₹10,000                                       │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ Subtotal: ₹41,000                                           │
│ GST (18%): +₹7,380                                          │
│ TOTAL: ₹48,380                                              │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 📋 TERMS & CONDITIONS                                       │
│ All deliverables within 30 days. 50% advance required.      │
│                                                             │
│                         [Edit] [Duplicate] [Deactivate]     │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ DO NOT

- ❌ Do NOT show raw IDs to users - always show names/labels
- ❌ Do NOT break display for legacy packages without projectConfigs
- ❌ Do NOT fetch data N times in loops - batch queries
- ❌ Do NOT skip loading states

---

## Tasks/Subtasks

- [x] **Package Detail Updates**
  - [x] Add "Projects This Package Creates" section
  - [x] Implement config resolution with related data
  - [x] Add grouped line items display
- [x] **Project Config Preview Component**
  - [x] Create `components/project-config-preview.tsx`
  - [x] Add icon selection based on project type
  - [x] Style cards consistently with design system
- [x] **Grouped Pricing Display**
  - [x] Create or update pricing display component
  - [x] Group line items by projectConfigId
  - [x] Show per-config subtotals
- [x] **Backward Compatibility**
  - [x] Handle legacy packages with single projectTypeId
  - [x] Show single config without grouping
- [x] **Edit Flow**
  - [x] Ensure Edit button opens builder with configs pre-filled
  - [x] Verify all data survives round-trip
- [x] **Validation**
  - [x] Run `pnpm tsc --noEmit` - no TypeScript errors
  - [x] Manual test: View multi-config package
  - [x] Manual test: View legacy single-config package
  - [x] Manual test: Edit and save, verify no data loss

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `pnpm build` - build succeeds
- [x] Manual: View package with 3 project configs - all shown correctly
- [x] Manual: View legacy package - single config displayed
- [x] Manual: Line items grouped correctly by config
- [x] Manual: Click Edit - builder opens with all configs
- [x] Manual: Duplicate package - new package has all configs

---

## Dev Agent Record

**Status**: done
**Points**: 2

- Implemented `PackageDetail` with full project config and pricing breakdown.
- Created `ProjectConfigPreview` card component for individual project setups.
- Created `GroupedPricingDisplay` to organize line items by project config with subtotals.
- Updated `BuilderProvider` to initialize state from Convex data, supporting the edit flow.
- Refactored routes to separate Detail view from Edit builder.
- Maintained backward compatibility for legacy single-config packages.

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

The service package management interface now provides a clear and detailed view of multi-project offerings. Admins can review precisely how projects will be spawned and how costs are allocated across different delivery workflows. The transition from Detail to Edit is seamless, with all project configurations and line-item assignments preserved.

### Files Changed

- `src/components/modules/admin/service-packages/detail/package-detail.tsx`
- `src/components/modules/admin/service-packages/detail/components/project-config-preview.tsx`
- `src/components/modules/admin/service-packages/detail/components/grouped-pricing-display.tsx`
- `src/components/modules/admin/service-packages/builder/builder-context.tsx`
- `src/app/(protected)/@admin/settings/service-packages/[packageId]/page.tsx`
- `src/app/(protected)/@admin/settings/service-packages/[packageId]/edit/page.tsx`
- `src/components/modules/admin/service-packages/list/package-card.tsx`
- `src/components/modules/admin/service-packages/list/service-package-list.tsx`
