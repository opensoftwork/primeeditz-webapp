---
name: primeeditz-module-patterns
description: Folder structure and component patterns for PrimeEditz modules with list, detail, create, and edit views. Use when creating new admin/studio/employee modules, implementing CRUD features, or scaffolding new feature modules. Covers Next.js parallel routes, component module organization, DataTable patterns, and wizard flows.
---

# PrimeEditz Module Patterns

Standardized folder structures and component patterns for PrimeEditz feature modules.

## Quick Reference

| View | Route Path | Component Location |
|------|------------|-------------------|
| **List** | `@admin/{feature}/page.tsx` | `modules/admin/{feature}/list/` |
| **Create** | `@admin/{feature}/new/page.tsx` | `modules/admin/{feature}/wizard/` |
| **Detail** | `@admin/{feature}/[id]/page.tsx` | `modules/admin/{feature}/detail/` |
| **Edit** | `@admin/{feature}/[id]/edit/page.tsx` | `modules/admin/{feature}/detail/` or `wizard/` |

## Module Structure Overview

### Complete Module Folder Structure

```
src/components/modules/admin/{feature}/
├── list/                           # List view components
│   ├── {feature}-list.tsx          # Main list container
│   ├── columns.tsx                 # DataTable column definitions
│   ├── {feature}-card.tsx          # Card view item renderer
│   ├── {feature}-actions.tsx       # Row/card action buttons
│   ├── types.ts                    # List-specific types
│   └── index.ts                    # Exports
├── detail/                         # Detail view components
│   ├── {feature}-detail.tsx        # Main detail container
│   ├── {feature}-editor.tsx        # Edit form (if separate from wizard)
│   ├── detail-header.tsx           # Shared detail header
│   └── index.ts                    # Exports
├── wizard/                         # Create/edit wizard (if multi-step)
│   ├── index.tsx                   # Main wizard container
│   ├── wizard-context.tsx          # Wizard state management
│   ├── wizard-step-navigation.tsx  # Step indicator UI
│   ├── types.ts                    # Wizard types
│   └── steps/                      # Individual step components
│       ├── step-basic-info.tsx
│       └── step-configuration.tsx
└── index.ts                        # Module root exports
```

### Route Structure (Next.js Parallel Routes)

```
src/app/(protected)/@admin/{feature}/
├── page.tsx                        # List view route (thin)
├── new/
│   └── page.tsx                    # Create view route (thin)
└── [id]/
    ├── page.tsx                    # Detail view route (thin)
    └── edit/
        └── page.tsx                # Edit view route (thin)
```

## Route Page Patterns

Route pages must be **thin** (<30 lines). They only import and render container components.

### List Route

```tsx
// src/app/(protected)/@admin/settings/project-types/page.tsx
import { ProjectTypeList } from "@/components/modules/admin/project-types";

export default function ProjectTypesPage() {
  return <ProjectTypeList />;
}
```

### Create Route

```tsx
// src/app/(protected)/@admin/settings/project-types/new/page.tsx
import ProjectTypeWizard from "@/components/modules/admin/project-types/wizard";

export default function NewProjectTypePage() {
  return <ProjectTypeWizard />;
}
```

### Detail Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import ProjectTypeDetail from "@/components/modules/admin/project-types/detail/project-type-detail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectTypeDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id || id.length < 10) {
    notFound();
  }

  return <ProjectTypeDetail projectTypeId={id as Id<"projectTypes">} />;
}
```

### Edit Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import ProjectTypeEditor from "@/components/modules/admin/project-types/detail/project-type-editor";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProjectTypePage({ params }: PageProps) {
  const { id } = await params;

  if (!id || id.length < 10) {
    notFound();
  }

  return <ProjectTypeEditor projectTypeId={id as Id<"projectTypes">} />;
}
```

## List View Pattern

### List Container Component

```tsx
// src/components/modules/admin/{feature}/list/{feature}-list.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columns";
import { {Feature}Card } from "./{feature}-card";
import type { Admin{Feature} } from "./types";

export function {Feature}List() {
  const router = useRouter();
  const items = useQuery(api.functions.{feature}s.queries.get{Feature}s);

  const deleteMutation = useMutation(
    api.functions.{feature}s.mutations.delete{Feature},
  );

  const [itemToDelete, setItemToDelete] = useState<{
    id: Id<"{feature}s">;
    name: string;
  } | null>(null);

  const handleCreate = () => {
    router.push("/settings/{feature}s/new");
  };

  const handleView = (id: string) => {
    router.push(`/settings/{feature}s/${id}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation({ id: itemToDelete.id });
      toast.success("{Feature} deleted");
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Loading State
  if (items === undefined) {
    return (
      <div className="w-full px-6 pt-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={4} viewMode="cards" />
      </div>
    );
  }

  const columns = useMemo(() => getColumns(handleView), [router]);

  return (
    <div className="w-full px-6 pt-6">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
            {Feature} Management
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={handleCreate}
            className="h-12 gap-2 rounded-xl bg-primary px-8 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Create {Feature}
          </Button>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No {feature}s found"
        emptyDescription="Get started by creating your first {feature}."
        renderCard={(item) => (
          <{Feature}Card
            key={item._id}
            item={item}
            onView={handleView}
            onDelete={(id) => setItemToDelete({ id: id as Id<"{feature}s">, name: item.name })}
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search {feature}s...",
          },
          filters: [
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ],
            },
          ],
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        {/* Dialog content */}
      </AlertDialog>
    </div>
  );
}
```

### Columns Definition

```tsx
// src/components/modules/admin/{feature}/list/columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Admin{Feature} } from "./types";

export function getColumns(
  onView: (item: Admin{Feature}) => void,
): ColumnDef<Admin{Feature}>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-black tracking-tight text-white uppercase">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("status") as boolean;
        return (
          <Badge
            className={cn(
              "font-black text-[8px] uppercase tracking-widest",
              isActive
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-white/5 text-white/40 border-white/5",
            )}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <{Feature}Actions item={row.original} onView={onView} />
      ),
    },
  ];
}
```

### Card Component

```tsx
// src/components/modules/admin/{feature}/list/{feature}-card.tsx
"use client";

import type { Admin{Feature} } from "./types";

interface {Feature}CardProps {
  item: Admin{Feature};
  onView: (item: Admin{Feature}) => void;
  onDelete?: (id: string) => void;
}

export function {Feature}Card({ item, onView, onDelete }: {Feature}CardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
      {/* Card content */}
    </div>
  );
}
```

### List Types

```tsx
// src/components/modules/admin/{feature}/list/types.ts
import type { Doc } from "@convex/_generated/dataModel";

export type Admin{Feature} = Doc<"{feature}s"> & {
  categoryName?: string;
};
```

### List Index

```tsx
// src/components/modules/admin/{feature}/list/index.ts
export { {Feature}List } from "./{feature}-list";
export { {Feature}Card } from "./{feature}-card";
export { getColumns } from "./columns";
export type { Admin{Feature} } from "./types";
```

## Detail View Pattern

### Detail Container Component

```tsx
// src/components/modules/admin/{feature}/detail/{feature}-detail.tsx
"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ChevronLeft, Settings } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface {Feature}DetailProps {
  {feature}Id: Id<"{feature}s">;
}

export default function {Feature}Detail({ {feature}Id }: {Feature}DetailProps) {
  const item = useQuery(api.functions.{feature}s.queries.getById, {
    id: {feature}Id,
  });

  // Loading state
  if (item === undefined) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-32 rounded-3xl bg-white/5" />
      </div>
    );
  }

  // Not found state
  if (item === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-black text-white uppercase">Not Found</h2>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/{feature}s">Back to List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-transparent text-white">
      {/* Hero Section */}
      <section className="px-6 lg:px-10 py-12">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/{feature}s">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="flex items-start justify-between mt-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            {item.name}
          </h1>
          
          <Link href={`/{feature}s/${{feature}Id}/edit`}>
            <Button className="h-11 px-6 rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 pb-24">
        {/* Detail content */}
      </main>
    </div>
  );
}
```

## Wizard/Create Pattern

For multi-step creation flows, see [references/wizard-pattern.md](references/wizard-pattern.md).

### Simple Create (Single Step)

```tsx
// src/components/modules/admin/{feature}/wizard/index.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { {Feature}Form } from "./{feature}-form";

export default function {Feature}Wizard() {
  const router = useRouter();
  const create = useMutation(api.functions.{feature}s.mutations.create);

  const handleSubmit = async (values: Create{Feature}Input) => {
    try {
      const id = await create(values);
      toast.success("{Feature} created");
      router.push(`/settings/{feature}s/${id}`);
    } catch {
      toast.error("Failed to create");
    }
  };

  return (
    <div className="w-full px-6 pt-6">
      <h1 className="text-4xl font-black uppercase text-white">
        Create {Feature}
      </h1>
      <{Feature}Form onSubmit={handleSubmit} />
    </div>
  );
}
```

## Module Root Index

```tsx
// src/components/modules/admin/{feature}/index.ts
export * from "./list";
export { default as {Feature}Detail } from "./detail/{feature}-detail";
export { default as {Feature}Wizard } from "./wizard";
```

## Key Conventions

### Visual Styling Standards

- **Section label**: `text-[10px] font-black uppercase tracking-[0.3em] text-primary/40`
- **Page title**: `text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white`
- **Primary button**: `h-12 px-8 rounded-xl bg-primary text-[11px] font-black uppercase tracking-widest`
- **Card container**: `rounded-2xl bg-white/5 border border-white/10`
- **Status badge active**: `bg-green-500/10 text-green-500 border-green-500/20`
- **Status badge inactive**: `bg-white/5 text-white/40 border-white/5`

### Animation Patterns

Use `motion/react` for consistent animations:

```tsx
// Header entrance
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
>

// Button entrance
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
>

// Page transition
<div className="animate-in fade-in duration-500">
```

### Import Order

```tsx
// 1. React/Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// 3. Convex
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

// 4. Internal components
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";

// 5. Relative imports
import { getColumns } from "./columns";
```

## Reference Documents

- [Wizard Pattern](references/wizard-pattern.md) - Multi-step wizard implementation
- [DataTable Usage](references/datatable-usage.md) - DataTable configuration patterns
- [Convex Queries](references/convex-queries.md) - Query/mutation patterns for modules
