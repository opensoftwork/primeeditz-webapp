# Story 13F.3: Link Line Items to Project Configs

**Status**: done
**Points**: 3  
**Epic**: [13F: Multi-Project Package Support](../../../../planning-artifacts/epics/13f-multi-project-package-support.md)  
**Depends On**: 13F.1 (Schema), 13F.2 (Builder Step 2)

---

## User Story

**As an** Admin,  
**I want** to assign line items to specific project configurations in Step 3,  
**So that** pricing is correctly attributed to each project when the package is used.

---

## Business Context

When a "Complete Wedding Package" is created with 3 project configs:

- Photo Editing (₹50,000)
- Video Editing (₹70,000)
- Album Design (₹30,000)

Each line item should be associated with its respective project config. This enables:

1. Clear pricing breakdown by project type
2. Correct cost allocation when projects are spawned
3. Better reporting and analytics

---

## Acceptance Criteria

### AC1: Project Selector in Line Item Row

**Given** a line item row in Step 3  
**When** the form is rendered  
**Then** there is a "Project" dropdown selector showing:

- All project configs from Step 2 (by label)
- A "General / Shared" option for package-wide costs
- Default to first config if only one exists

### AC2: Line Items Grouped by Project in Summary

**Given** line items with assigned project configs  
**When** viewing the pricing summary  
**Then** line items are grouped by project config:

```
📷 Photo Editing:
  - Culling (500 images): ₹5,000
  - Retouching (100 images): ₹5,000
  Subtotal: ₹10,000

🎬 Video Editing:
  - Main Film Editing: ₹15,000
  - Color Grading (30 min): ₹6,000
  Subtotal: ₹21,000

📚 Album Design:
  - Album Design (20 spreads): ₹10,000
  Subtotal: ₹10,000

────────────────────────
Package Total: ₹41,000
```

### AC3: Receive Project Configs from Context

**Given** Step 3 is loaded  
**When** the component mounts  
**Then** it receives the project configs from builder context (Step 2 data)

**And** if no configs exist (backward compat), it shows no project selector

### AC4: Handle Config Changes Gracefully

**Given** user goes back to Step 2 and removes a config  
**When** returning to Step 3  
**Then** line items referencing deleted configs show a warning

**And** the user can reassign them to remaining configs

### AC5: Default Line Item Per Config (Optional Enhancement)

**Given** user adds a new line item  
**When** the line item is created  
**Then** it defaults to the first project config (if only one)

**Or** no project config if multiple exist (user must select)

---

## Technical Implementation

### Files to Modify

```
MODIFY: src/components/modules/admin/service-packages/builder/step-3-pricing.tsx
  - Add project config context consumption
  - Add grouped summary view
  - Pass configs to line item rows

MODIFY: src/components/modules/admin/service-packages/builder/components/line-item-row.tsx
  - Add projectConfigId field with dropdown
  - Receive projectConfigs as prop
  - Display config label in dropdown

CREATE: src/components/modules/admin/service-packages/builder/components/pricing-summary.tsx
  - Grouped pricing summary component
```

### Updated Line Item Row

```tsx
// components/line-item-row.tsx

interface LineItemRowProps {
  form: FormApi<Step3FormValues>;
  index: number;
  onRemove: () => void;
  projectConfigs: ProjectConfig[]; // NEW: From Step 2
  sections: QuotationSection[];
}

export function LineItemRow({
  form,
  index,
  onRemove,
  projectConfigs,
  sections,
}: LineItemRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      {/* Project Config Selector - NEW */}
      {projectConfigs.length > 0 && (
        <div className="col-span-2">
          <form.Field name={`lineItems[${index}].projectConfigId`}>
            {(field) => (
              <Select
                value={field.state.value || "__general__"}
                onValueChange={(value) =>
                  field.handleChange(value === "__general__" ? "" : value)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__general__">General</SelectItem>
                  {projectConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.label || config.projectTypeName || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </div>
      )}

      {/* Existing fields: Description, Section, Unit, Rate, Qty, Actions */}
    </div>
  );
}
```

### Grouped Pricing Summary

```tsx
// components/pricing-summary.tsx

interface PricingSummaryProps {
  lineItems: LineItem[];
  projectConfigs: ProjectConfig[];
  applyGST: boolean;
}

export function PricingSummary({
  lineItems,
  projectConfigs,
  applyGST,
}: PricingSummaryProps) {
  // Group line items by projectConfigId
  const groupedItems = useMemo(() => {
    const groups: Record<string, LineItem[]> = { __general__: [] };

    projectConfigs.forEach((config) => {
      groups[config.id] = [];
    });

    lineItems.forEach((item) => {
      const key = item.projectConfigId || "__general__";
      if (groups[key]) {
        groups[key].push(item);
      } else {
        groups.__general__.push(item);
      }
    });

    return groups;
  }, [lineItems, projectConfigs]);

  // Calculate totals per group
  const groupTotals = useMemo(() => {
    return Object.entries(groupedItems).map(([configId, items]) => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.rate * item.quantity,
        0,
      );
      const config = projectConfigs.find((c) => c.id === configId);
      return {
        configId,
        label: config?.label || "General / Shared",
        items,
        subtotal,
      };
    });
  }, [groupedItems, projectConfigs]);

  const packageSubtotal = groupTotals.reduce((sum, g) => sum + g.subtotal, 0);
  const gstAmount = applyGST ? Math.round(packageSubtotal * 0.18) : 0;
  const total = packageSubtotal + gstAmount;

  return (
    <div className="space-y-4">
      {groupTotals
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.configId}>
            <h4 className="font-bold text-sm">{group.label}</h4>
            <ul className="text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.description}: ₹
                  {(item.rate * item.quantity).toLocaleString()}
                </li>
              ))}
            </ul>
            <div className="text-right text-sm font-medium">
              Subtotal: ₹{group.subtotal.toLocaleString()}
            </div>
          </div>
        ))}

      <Separator />

      <div className="text-right space-y-1">
        <div>Subtotal: ₹{packageSubtotal.toLocaleString()}</div>
        {applyGST && <div>GST (18%): ₹{gstAmount.toLocaleString()}</div>}
        <div className="text-xl font-bold">
          Total: ₹{total.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
```

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: PRICING & TERMS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ LINE ITEMS                                                      │
│ ┌────────────┬────────────────────┬──────────┬──────┬─────────┐ │
│ │ Project    │ Description        │ Unit     │ Rate │ Qty     │ │
│ ├────────────┼────────────────────┼──────────┼──────┼─────────┤ │
│ │ [Photo ▼]  │ Culling            │ per proj │ 5000 │ 1       │ │
│ │ [Photo ▼]  │ Retouching         │ per img  │ 50   │ 100     │ │
│ │ [Video ▼]  │ Main Film Edit     │ per proj │15000 │ 1       │ │
│ │ [Video ▼]  │ Color Grading      │ per min  │ 200  │ 30      │ │
│ │ [Album ▼]  │ Album Design       │ per sprd │ 500  │ 20      │ │
│ └────────────┴────────────────────┴──────────┴──────┴─────────┘ │
│                                                                 │
│ [+ Add Line Item]                                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ SUMMARY BY PROJECT                          │ PACKAGE TOTAL     │
│ ┌───────────────────────────────────────────┼─────────────────┐ │
│ │ 📷 Photo Editing                          │                 │ │
│ │   - Culling: ₹5,000                       │                 │ │
│ │   - Retouching: ₹5,000                    │                 │ │
│ │   Subtotal: ₹10,000                       │                 │ │
│ │                                           │                 │ │
│ │ 🎬 Video Editing                          │                 │ │
│ │   - Main Film Edit: ₹15,000               │                 │ │
│ │   - Color Grading: ₹6,000                 │                 │ │
│ │   Subtotal: ₹21,000                       │                 │ │
│ │                                           │                 │ │
│ │ 📚 Album Design                           │  Subtotal:      │ │
│ │   - Album Design: ₹10,000                 │  ₹41,000        │ │
│ │   Subtotal: ₹10,000                       │                 │ │
│ │                                           │  GST (18%):     │ │
│ │                                           │  +₹7,380        │ │
│ │                                           │                 │ │
│ │                                           │  TOTAL:         │ │
│ │                                           │  ₹48,380        │ │
│ └───────────────────────────────────────────┴─────────────────┘ │
│                                                                 │
│                                         [ Back ] [ Next ]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❌ DO NOT

- ❌ Do NOT require all line items to have a project config (allow "General")
- ❌ Do NOT show raw config IDs to user - always show labels
- ❌ Do NOT break if user modifies Step 2 configs - handle gracefully
- ❌ Do NOT modify spawning logic - that's Story 13F.4
- ❌ Do NOT hide project selector for single-config packages (still show it)

---

## Tasks/Subtasks

- [x] **Step 3 Updates**
  - [x] Consume projectConfigs from builder context
  - [x] Pass configs to LineItemRow component
  - [x] Add grouped pricing summary section
- [x] **Line Item Row Updates**
  - [x] Add projectConfigId form field
  - [x] Add project config dropdown selector
  - [x] Style dropdown to fit in row grid
- [x] **Pricing Summary Component**
  - [x] Create `components/pricing-summary.tsx`
  - [x] Implement grouping logic by projectConfigId
  - [x] Calculate and display per-project subtotals
  - [x] Show package total with GST
- [x] **Edge Cases**
  - [x] Handle missing project configs (backward compat)
  - [x] Handle deleted config references (show warning)
  - [x] Default new line items appropriately
- [x] **Validation**
  - [x] Run `pnpm tsc --noEmit` - no TypeScript errors
  - [x] Manual test: Assign line items to different configs
  - [x] Manual test: View grouped summary
  - [x] Manual test: Change Step 2 configs, verify Step 3 handles it

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `pnpm build` - build succeeds
- [x] Manual: Create package with 3 configs, assign line items to each
- [x] Manual: Verify grouped summary shows correct totals
- [x] Manual: Add line item to "General" category
- [x] Manual: Go back to Step 2, remove a config, return to Step 3 - no crash
- [x] Manual: Edit existing package - line items keep their config assignment

---

## Dev Agent Record

- Updated `LineItem` interface to include `projectConfigId`.
- Modified `LineItemRow` to show Project selector dropdown.
- Created `PricingSummary` component for grouped project-based cost breakdown.
- Updated `Step3Pricing` to integrate the new summary and pass configs to rows.
- Ensured default project assignment (first config) for new line items.
- Verified and fixed grid layout for line item rows to accommodate the new field.

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

Successfully implemented cost allocation for multi-project packages. Each line item can now be attributed to a specific project config or marked as general. Step 3 now shows a transparent breakdown of costs per project, which is essential for complex offerings.

### Files Changed

- `src/components/modules/admin/service-packages/builder/builder-context.tsx`
- `src/components/modules/admin/service-packages/builder/step-3-pricing.tsx`
- `src/components/modules/admin/service-packages/builder/components/line-item-row.tsx`
- `src/components/modules/admin/service-packages/builder/components/pricing-summary.tsx`
