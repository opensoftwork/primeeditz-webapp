# Story 13D.3: Remove Quotation Sections UI

**Status**: backlog  
**Points**: 2  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: Story 13D.1

---

## User Story

**As a** Developer,  
**I want** to remove the standalone quotation sections management UI,  
**So that** sections are only created inline within service packages.

---

## Acceptance Criteria

### AC1: Remove Standalone Route

**Given** the quotation sections page exists  
**When** I clean up  
**Then** `/admin/settings/quotation-sections` is removed  
**And** navigating there returns 404

### AC2: Remove Standalone Components

**Given** standalone section management exists  
**When** I clean up  
**Then** these are deleted:

- `src/app/(protected)/@admin/settings/quotation-sections/`
- `src/components/modules/admin/quotation-sections/` (standalone management)

### AC3: Keep Inline Section Selector

**Given** the service package builder exists  
**When** building line items  
**Then** I can STILL select a section from existing sections  
**And** I can quick-create a new section inline

### AC4: Keep Table for Selection

**Given** `quotationSections` table has data  
**When** I remove the UI  
**Then** the TABLE stays (for selection in service packages)  
**And** existing sections remain usable

### AC5: Update Navigation

**Given** sidebar has quotation sections link  
**When** I clean up  
**Then** the link is removed from navigation

---

## Technical Implementation

### Files to DELETE

```
DELETE: src/app/(protected)/@admin/settings/quotation-sections/
  - page.tsx
  - [id]/page.tsx
  - new/page.tsx

DELETE: src/components/modules/admin/quotation-sections/
  - (entire directory if it's standalone)
```

### Files to KEEP/CREATE

```
KEEP: convex/functions/quotationSections/queries.ts
  - Still needed for selector dropdown

CREATE (if not exists):
  src/components/modules/admin/service-packages/builder/components/section-quick-create.tsx
```

### Quick Create Component (For Package Builder)

```tsx
// section-quick-create.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SectionQuickCreateProps {
  onCreated: (sectionId: string) => void;
}

export function SectionQuickCreate({ onCreated }: SectionQuickCreateProps) {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const createSection = useMutation(api.quotationSections.create);

  async function handleCreate() {
    if (!name.trim()) return;
    const id = await createSection({ name: name.trim(), order: 0 });
    onCreated(id);
    setName("");
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          New Section
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <Input
            placeholder="Section name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button size="sm" onClick={handleCreate}>
            Create Section
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Navigation Update

```typescript
// Remove from sidebar
// Before:
{
  title: "Quotation Sections",
  href: "/admin/settings/quotation-sections",
  icon: ListIcon,
}

// After: ❌ REMOVED entirely
```

---

## ❌ DO NOT

- ❌ Do NOT delete the `quotationSections` table
- ❌ Do NOT delete the queries for section selection
- ❌ Do NOT break section selection in service package builder
- ❌ Do NOT forget to remove from navigation

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: `/admin/settings/quotation-sections` returns 404
- [ ] Manual test: Service package builder can still select sections
- [ ] Manual test: Quick create section works in builder

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
