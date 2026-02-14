---
id: 20-2
title: Frontend — Admin Dashboard List & Detail Views
epic: 20-public-form-submissions
status: backlog
priority: high
points: 8
assignee: null
dependencies:
  - 20-1
created: 2026-02-14
updated: 2026-02-14
---

# Story 20-2: Frontend — Admin Dashboard List & Detail Views

**Epic**: Epic 20 - Public Form Submissions (Contacts, Feedbacks & Surveys)
**Status**: backlog
**Complexity**: Medium-Large (8 points)
**Created**: 2026-02-14
**Priority**: HIGH — Admin visibility into incoming form submissions

---

## 📋 User Story

**As an** admin user,
**I want** dashboard pages to view, search, and manage contact, feedback, and survey submissions,
**So that** I can review incoming form data and take action on submissions.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                                  | Status     | Notes                                                             |
| ------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| **20-1: Backend Mutations, Queries & HTTP** | ⏳ Pending | Admin queries (`listContacts`, `getContactById`, etc.) must exist |
| **Shared DataTable**                        | ✅ Done    | `@/components/shared/data-table` already available                |
| **primeeditz-module-patterns SKILL**        | ✅ Done    | `.agent/skills/primeeditz-module-patterns/SKILL.md`               |

### Enables

| Story / Epic         | Notes                                                |
| -------------------- | ---------------------------------------------------- |
| **Admin operations** | Full admin visibility into external form submissions |

### Key Patterns To Follow

Read the SKILL file at `.agent/skills/primeeditz-module-patterns/SKILL.md` for detailed patterns. Key rules:

- **Route pages are thin** (<30 lines) — only import and render container components
- **Container/Presentational pattern** — logic in containers, UI in presentational
- **Barrel exports** (`index.ts`) for all modules
- **DataTable** from `@/components/shared/data-table` with `DataTableSkeleton` for loading
- **motion/react** for entrance animations
- **Premium dark aesthetic** — glassmorphic cards, uppercase tracking labels, motion
- **Import order**: React/Next → Third-party → Convex → Internal → Relative

---

## ✅ Acceptance Criteria

### AC-1: Contacts List View

- [ ] **Given** an admin navigates to the Contacts list page
- [ ] **When** the page loads
- [ ] **Then** a `DataTable` displays all contact submissions with columns: Name, Email, Service, Date
- [ ] **And** a search bar allows filtering by `name`
- [ ] **And** each row has "View" and "Delete" action icons
- [ ] **And** a card view is available with premium dark cards
- [ ] **And** the default view is cards
- [ ] **And** loading state shows `DataTableSkeleton` with skeleton header

### AC-2: Contact Detail View

- [ ] **Given** an admin clicks "View" on a contact submission
- [ ] **When** the detail page loads
- [ ] **Then** all fields are displayed: Name, Email, Phone Number, Service, Message
- [ ] **And** the creation date is shown in human-readable format
- [ ] **And** a back button navigates to the contacts list
- [ ] **And** a "Delete" button with confirmation dialog is available

### AC-3: Feedbacks List View

- [ ] **Given** an admin navigates to the Feedbacks list page
- [ ] **When** the page loads
- [ ] **Then** a `DataTable` displays all feedback submissions with columns: Name, Email, Rating, Date
- [ ] **And** rating is displayed as a numeric badge with color coding (1-2 red, 3 amber, 4-5 green)
- [ ] **And** filtering by rating is available
- [ ] **And** the default view is cards

### AC-4: Feedback Detail View

- [ ] **Given** an admin clicks "View" on a feedback submission
- [ ] **When** the detail page loads
- [ ] **Then** all fields are displayed: Name, Email, Rating (with star/badge), Feedback text
- [ ] **And** the full feedback message is displayed without truncation

### AC-5: Surveys List View

- [ ] **Given** an admin navigates to the Surveys list page
- [ ] **When** the page loads
- [ ] **Then** a `DataTable` displays all survey submissions with columns: Name, Email, Role (q1_role), Date
- [ ] **And** filtering by role (`q1_role`) is available
- [ ] **And** the default view is table (not cards, due to data density)

### AC-6: Survey Detail View

- [ ] **Given** an admin clicks "View" on a survey submission
- [ ] **When** the detail page loads
- [ ] **Then** all survey sections are displayed with clear grouping:
  - **Contact Information**: Name, Email, Phone, Channel Name, Instagram, Best Time, Preferred Method, May Contact
  - **Section A — Basic Info**: Role, Frequency, Content Types, Monthly Volume
  - **Section B — Workflow Pain Points**: Current Editing, Frustrations, Challenges, Turnaround, Satisfaction, Revisions
- [ ] **And** empty optional fields are hidden (not shown as blank)

### AC-7: Delete Confirmation

- [ ] **Given** an admin clicks "Delete" on any submission (list or detail)
- [ ] **When** the confirmation dialog appears and is confirmed
- [ ] **Then** the record is permanently deleted
- [ ] **And** the list refreshes (Convex reactive query)
- [ ] **And** a success toast is shown

### AC-8: Premium Visual Design

- [ ] **Given** any list or detail page
- [ ] **Then** styling matches the PrimeEditz premium aesthetic:
  - Section label: `text-[10px] font-black uppercase tracking-[0.3em] text-primary/40`
  - Page title: `text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white`
  - Card container: `rounded-2xl bg-white/5 border border-white/10`
  - Hover: `hover:border-primary/30 transition-colors`
  - Entrance animations with `motion/react`

---

## 📘 Implementation

### Phase A: Contacts Module (~3 points)

#### Task A1: Contact List Container

**File**: `src/components/modules/admin/contacts/list/contacts-list.tsx`

Container component that fetches data and renders the DataTable.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columns";
import { ContactCard } from "./contact-card";
import type { AdminContact } from "./types";

export function ContactsList() {
  const router = useRouter();
  const contacts = useQuery(api.functions.contacts.queries.listContacts);
  const deleteMutation = useMutation(
    api.functions.contacts.mutations.deleteContact,
  );

  const [itemToDelete, setItemToDelete] = useState<{
    id: Id<"contacts">;
    name: string;
  } | null>(null);

  const handleView = (id: string) => {
    router.push(`/contacts/${id}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation({ id: itemToDelete.id });
      toast.success("Contact deleted");
      setItemToDelete(null);
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  // Loading state
  if (contacts === undefined) {
    return (
      <div className="w-full px-6 pt-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
        </div>
        <DataTableSkeleton rows={6} columns={4} viewMode="cards" />
      </div>
    );
  }

  const columns = getColumns(handleView, (id, name) =>
    setItemToDelete({ id: id as Id<"contacts">, name }),
  );

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
            FORM SUBMISSIONS
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
            Contacts
          </h1>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={contacts}
        emptyTitle="No contacts yet"
        emptyDescription="Contact submissions will appear here when someone fills out the contact form."
        renderCard={(item) => (
          <ContactCard
            key={item._id}
            item={item}
            onView={() => handleView(item._id)}
            onDelete={() =>
              setItemToDelete({
                id: item._id,
                name: item.name,
              })
            }
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search contacts...",
          },
          filters: [
            {
              column: "service",
              title: "Service",
              options: [], // Will be auto-populated from data
            },
          ],
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the submission from{" "}
              <strong>{itemToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] A1.1 Create `ContactsList` component with `useQuery(api.functions.contacts.queries.listContacts)`
- [ ] A1.2 Integrate `DataTable` with columns, search, and filters
- [ ] A1.3 Loading state with `DataTableSkeleton`
- [ ] A1.4 Delete dialog with `AlertDialog`
- [ ] A1.5 Motion animations for header

#### Task A2: Contact Columns

**File**: `src/components/modules/admin/contacts/list/columns.tsx`

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminContact } from "./types";

export function getColumns(
  onView: (id: string) => void,
  onDelete: (id: string, name: string) => void,
): ColumnDef<AdminContact>[] {
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
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-white/60">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "service",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-bold uppercase tracking-wider text-primary/70">
          {row.getValue("service")}
        </span>
      ),
    },
    {
      accessorKey: "_creationTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-white/40">
          {new Date(row.getValue("_creationTime")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.original._id)}
            className="h-8 w-8 text-white/40 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original._id, row.original.name)}
            className="h-8 w-8 text-white/40 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
```

- [ ] A2.1 Create columns: Name, Email, Service, Date, Actions
- [ ] A2.2 Actions column has View (Eye) and Delete (Trash2) icon buttons
- [ ] A2.3 Use `DataTableColumnHeader` for sortable headers

#### Task A3: Contact Card

**File**: `src/components/modules/admin/contacts/list/contact-card.tsx`

- [ ] A3.1 Create premium dark card showing name, email, service
- [ ] A3.2 Card is clickable → calls `onView`
- [ ] A3.3 Delete icon in card header/corner
- [ ] A3.4 Use `rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30`

#### Task A4: Contact Types

**File**: `src/components/modules/admin/contacts/list/types.ts`

```tsx
import type { Doc } from "@convex/_generated/dataModel";

export type AdminContact = Doc<"contacts">;
```

- [ ] A4.1 Create type alias from Convex Doc

#### Task A5: Contact List Index

**File**: `src/components/modules/admin/contacts/list/index.ts`

```tsx
export { ContactsList } from "./contacts-list";
export { ContactCard } from "./contact-card";
export { getColumns } from "./columns";
export type { AdminContact } from "./types";
```

- [ ] A5.1 Create barrel export

#### Task A6: Contact Detail View

**File**: `src/components/modules/admin/contacts/detail/contact-detail.tsx`

Detail container showing all fields in card-based layout. Do NOT create an edit view — data is read-only.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ChevronLeft, Mail, Phone, Briefcase, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactDetailProps {
  contactId: Id<"contacts">;
}

export default function ContactDetail({ contactId }: ContactDetailProps) {
  const router = useRouter();
  const contact = useQuery(api.functions.contacts.queries.getContactById, {
    id: contactId,
  });
  const deleteMutation = useMutation(
    api.functions.contacts.mutations.deleteContact,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (contact === undefined) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-48 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (contact === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-black text-white uppercase">
          Contact Not Found
        </h2>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/contacts")}
        >
          Back to Contacts
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation({ id: contactId });
      toast.success("Contact deleted");
      router.push("/contacts");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-transparent text-white">
      <section className="px-6 lg:px-10 py-8">
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/contacts")}
            className="gap-1 text-white/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-1 text-red-400/60 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-8"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            CONTACT SUBMISSION
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            {contact.name}
          </h1>
          <p className="text-xs text-white/30">
            Submitted {new Date(contact._creationTime).toLocaleString()}
          </p>
        </motion.div>

        {/* Content Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Contact Info Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/30" />
                <span className="text-sm text-white/80">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white/30" />
                <span className="text-sm text-white/80">{contact.phoneno}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-white/30" />
                <span className="text-sm text-white/80">{contact.service}</span>
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              Message
            </h3>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission from{" "}
              <strong>{contact.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] A6.1 Create `ContactDetail` component with `useQuery(getContactById)`
- [ ] A6.2 Display all fields in card-based layout
- [ ] A6.3 Loading, not-found, and delete states
- [ ] A6.4 Motion animations for entrance

#### Task A7: Contact Detail Index

**File**: `src/components/modules/admin/contacts/detail/index.ts`

- [ ] A7.1 Create barrel export: `export { default as ContactDetail } from "./contact-detail";`

#### Task A8: Contact Module Root Index

**File**: `src/components/modules/admin/contacts/index.ts`

```tsx
export * from "./list";
export { default as ContactDetail } from "./detail/contact-detail";
```

- [ ] A8.1 Create module root barrel export

#### Task A9: Contact Route Pages

**File**: `src/app/(protected)/@admin/contacts/page.tsx` (thin list route)

```tsx
import { ContactsList } from "@/components/modules/admin/contacts";

export default function ContactsPage() {
  return <ContactsList />;
}
```

**File**: `src/app/(protected)/@admin/contacts/[id]/page.tsx` (thin detail route)

```tsx
import { notFound } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import ContactDetail from "@/components/modules/admin/contacts/detail/contact-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id || id.length < 10) {
    notFound();
  }
  return <ContactDetail contactId={id as Id<"contacts">} />;
}
```

- [ ] A9.1 Create list route page (<30 lines)
- [ ] A9.2 Create detail route page with `params.id` extraction (<30 lines)

---

### Phase B: Feedbacks Module (~2.5 points)

Same structure as contacts, with following differences:

#### Task B1: Feedback List Container

**File**: `src/components/modules/admin/feedbacks/list/feedbacks-list.tsx`

- [ ] B1.1 Create `FeedbacksList` component using `useQuery(api.functions.feedbacks.queries.listFeedbacks)`
- [ ] B1.2 Integrate `DataTable` with search on `name` and filter on `rating`
- [ ] B1.3 No create button (read-only)

#### Task B2: Feedback Columns

**File**: `src/components/modules/admin/feedbacks/list/columns.tsx`

Columns: Name, Email, Rating (numeric badge with color coding), Date, Actions.

**Rating badge colors:**

- Rating 1-2: `bg-red-500/10 text-red-400 border-red-500/20`
- Rating 3: `bg-amber-500/10 text-amber-400 border-amber-500/20`
- Rating 4-5: `bg-green-500/10 text-green-400 border-green-500/20`

- [ ] B2.1 Create columns with rating badge color coding
- [ ] B2.2 Actions: View + Delete icon buttons

#### Task B3: Feedback Card

**File**: `src/components/modules/admin/feedbacks/list/feedback-card.tsx`

- [ ] B3.1 Card showing name, rating (stars or badge), truncated feedback preview

#### Task B4: Feedback Types + Index

**File**: `src/components/modules/admin/feedbacks/list/types.ts`
**File**: `src/components/modules/admin/feedbacks/list/index.ts`

```tsx
// types.ts
import type { Doc } from "@convex/_generated/dataModel";
export type AdminFeedback = Doc<"feedbacks">;
```

- [ ] B4.1 Create types and barrel exports

#### Task B5: Feedback Detail View

**File**: `src/components/modules/admin/feedbacks/detail/feedback-detail.tsx`

- [ ] B5.1 Create `FeedbackDetail` showing all fields: name, email, rating (with large badge), full feedback text
- [ ] B5.2 Loading, not-found, delete states
- [ ] B5.3 Back button and delete action

#### Task B6: Feedback Detail Index + Module Index

- [ ] B6.1 `src/components/modules/admin/feedbacks/detail/index.ts`
- [ ] B6.2 `src/components/modules/admin/feedbacks/index.ts`

#### Task B7: Feedback Route Pages

**File**: `src/app/(protected)/@admin/feedbacks/page.tsx`
**File**: `src/app/(protected)/@admin/feedbacks/[id]/page.tsx`

- [ ] B7.1 Create thin list route page
- [ ] B7.2 Create thin detail route page

---

### Phase C: Surveys Module (~2.5 points)

Same structure, with key difference: survey detail has many grouped sections.

#### Task C1: Survey List Container

**File**: `src/components/modules/admin/surveys/list/surveys-list.tsx`

- [ ] C1.1 Create `SurveysList` component using `useQuery(api.functions.surveys.queries.listSurveys)`
- [ ] C1.2 Default view: `table` (not cards) due to data density
- [ ] C1.3 Search on `name`, filter on `q1_role`

#### Task C2: Survey Columns

**File**: `src/components/modules/admin/surveys/list/columns.tsx`

Columns: Name, Email, Role (q1_role), Date, Actions.

- [ ] C2.1 Create columns
- [ ] C2.2 Show `q1_role` or "Not specified" fallback

#### Task C3: Survey Card

**File**: `src/components/modules/admin/surveys/list/survey-card.tsx`

- [ ] C3.1 Card with name, email, role, content type tags

#### Task C4: Survey Types + Index

**File**: `src/components/modules/admin/surveys/list/types.ts`
**File**: `src/components/modules/admin/surveys/list/index.ts`

```tsx
// types.ts
import type { Doc } from "@convex/_generated/dataModel";
export type AdminSurvey = Doc<"surveys">;
```

- [ ] C4.1 Create types and barrel exports

#### Task C5: Survey Detail View

**File**: `src/components/modules/admin/surveys/detail/survey-detail.tsx`

**This is the most complex detail view.** Display all survey fields grouped into sections. Skip empty optional fields.

Section layout:

```
┌──────────────────────────────────────────────┐
│ 📇 CONTACT INFORMATION                       │
│  Name: ...   Email: ...   Phone: ...          │
│  Channel: ...  Instagram: ...                 │
│  Best Time: ...  Preferred Method: ...        │
│  May Contact: ...                             │
├──────────────────────────────────────────────┤
│ 🅰️ SECTION A — BASIC INFORMATION             │
│  Role: ...                                    │
│  Frequency: ...                               │
│  Content Types: [tag1] [tag2]                 │
│  Monthly Volume: ...                          │
├──────────────────────────────────────────────┤
│ 🅱️ SECTION B — WORKFLOW PAIN POINTS          │
│  Current Editing: ...                         │
│  Frustrations: ...                            │
│  Editing Challenges: [tag1] [tag2]            │
│  Turnaround Time: ...                         │
│  Satisfaction: ...                            │
│  Revision Rounds: ...                         │
└──────────────────────────────────────────────┘
```

Helper pattern for hiding empty fields:

```tsx
function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
        {label}
      </span>
      <p className="text-sm text-white/80 mt-1">{value}</p>
    </div>
  );
}

function DetailTags({
  label,
  values,
}: {
  label: string;
  values?: string[] | null;
}) {
  if (!values?.length) return null;
  return (
    <div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 mt-1">
        {values.map((v) => (
          <span
            key={v}
            className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary/70 border border-primary/20"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] C5.1 Create `SurveyDetail` with three section cards
- [ ] C5.2 Use `DetailField` helper to hide empty optional fields
- [ ] C5.3 Use `DetailTags` for array fields (content types, editing challenges)
- [ ] C5.4 Loading, not-found, delete states
- [ ] C5.5 Back button and delete action

#### Task C6: Survey Detail Index + Module Index

- [ ] C6.1 `src/components/modules/admin/surveys/detail/index.ts`
- [ ] C6.2 `src/components/modules/admin/surveys/index.ts`

#### Task C7: Survey Route Pages

**File**: `src/app/(protected)/@admin/surveys/page.tsx`
**File**: `src/app/(protected)/@admin/surveys/[id]/page.tsx`

- [ ] C7.1 Create thin list route page
- [ ] C7.2 Create thin detail route page

---

## 🧪 Testing Checklist

### Contacts

- [ ] List loads with skeleton, then shows data
- [ ] Search by name filters correctly
- [ ] Card view shows premium cards
- [ ] Table view shows sortable columns
- [ ] View navigates to detail
- [ ] Delete shows confirmation, deletes, list refreshes
- [ ] Detail shows all fields
- [ ] Detail back button works
- [ ] Empty state renders correctly

### Feedbacks

- [ ] List loads with rating badges (color-coded)
- [ ] Filter by rating works
- [ ] Card shows name + rating + preview
- [ ] Detail shows full feedback text
- [ ] Delete works from list and detail

### Surveys

- [ ] List defaults to table view
- [ ] Role column shows `q1_role` or fallback
- [ ] Filter by role works
- [ ] Detail groups fields into 3 sections
- [ ] Empty optional fields are hidden
- [ ] Array fields render as tags
- [ ] Delete works

### Premium Aesthetics

- [ ] All list headers have entrance animations
- [ ] Cards use `rounded-2xl bg-white/5 border border-white/10`
- [ ] Section labels use `text-[10px] font-black uppercase tracking-[0.3em] text-primary/40`
- [ ] Delete buttons are red-tinted
- [ ] Loading skeletons match existing patterns

---

## 🚀 Definition of Done

- [ ] All Contacts module files created (list, detail, routes, index files)
- [ ] All Feedbacks module files created (list, detail, routes, index files)
- [ ] All Surveys module files created (list, detail, routes, index files)
- [ ] All route pages are thin (<30 lines)
- [ ] All module files under 150 lines
- [ ] DataTable integration working with search and filters
- [ ] Delete dialogs working with toast notifications
- [ ] Premium visual aesthetic matching existing modules
- [ ] All files compile without TypeScript errors
- [ ] Barrel exports correctly configured at all levels

---

## Estimated Effort

- Contacts module (list + detail + routes): 2 hours
- Feedbacks module (list + detail + routes): 1.5 hours
- Surveys module (list + detail + routes): 2.5 hours
- Polish & testing: 1 hour
- **Total: ~7 hours**

---

## 📂 File Summary

| File                                                                | Action | Lines (Est.) |
| ------------------------------------------------------------------- | ------ | ------------ |
| `src/components/modules/admin/contacts/list/contacts-list.tsx`      | Create | ~130         |
| `src/components/modules/admin/contacts/list/columns.tsx`            | Create | ~75          |
| `src/components/modules/admin/contacts/list/contact-card.tsx`       | Create | ~45          |
| `src/components/modules/admin/contacts/list/types.ts`               | Create | ~4           |
| `src/components/modules/admin/contacts/list/index.ts`               | Create | ~5           |
| `src/components/modules/admin/contacts/detail/contact-detail.tsx`   | Create | ~140         |
| `src/components/modules/admin/contacts/detail/index.ts`             | Create | ~2           |
| `src/components/modules/admin/contacts/index.ts`                    | Create | ~3           |
| `src/app/(protected)/@admin/contacts/page.tsx`                      | Create | ~7           |
| `src/app/(protected)/@admin/contacts/[id]/page.tsx`                 | Create | ~16          |
| `src/components/modules/admin/feedbacks/list/feedbacks-list.tsx`    | Create | ~130         |
| `src/components/modules/admin/feedbacks/list/columns.tsx`           | Create | ~85          |
| `src/components/modules/admin/feedbacks/list/feedback-card.tsx`     | Create | ~50          |
| `src/components/modules/admin/feedbacks/list/types.ts`              | Create | ~4           |
| `src/components/modules/admin/feedbacks/list/index.ts`              | Create | ~5           |
| `src/components/modules/admin/feedbacks/detail/feedback-detail.tsx` | Create | ~130         |
| `src/components/modules/admin/feedbacks/detail/index.ts`            | Create | ~2           |
| `src/components/modules/admin/feedbacks/index.ts`                   | Create | ~3           |
| `src/app/(protected)/@admin/feedbacks/page.tsx`                     | Create | ~7           |
| `src/app/(protected)/@admin/feedbacks/[id]/page.tsx`                | Create | ~16          |
| `src/components/modules/admin/surveys/list/surveys-list.tsx`        | Create | ~130         |
| `src/components/modules/admin/surveys/list/columns.tsx`             | Create | ~75          |
| `src/components/modules/admin/surveys/list/survey-card.tsx`         | Create | ~50          |
| `src/components/modules/admin/surveys/list/types.ts`                | Create | ~4           |
| `src/components/modules/admin/surveys/list/index.ts`                | Create | ~5           |
| `src/components/modules/admin/surveys/detail/survey-detail.tsx`     | Create | ~150         |
| `src/components/modules/admin/surveys/detail/index.ts`              | Create | ~2           |
| `src/components/modules/admin/surveys/index.ts`                     | Create | ~3           |
| `src/app/(protected)/@admin/surveys/page.tsx`                       | Create | ~7           |
| `src/app/(protected)/@admin/surveys/[id]/page.tsx`                  | Create | ~16          |

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-14 | backlog | Story created |

---

**Previous Story**: 20-1 - Backend Mutations, Queries & HTTP Endpoints
**Next Story**: N/A (final story in Epic 20)
