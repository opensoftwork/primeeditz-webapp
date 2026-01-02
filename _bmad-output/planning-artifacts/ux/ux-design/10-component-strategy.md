# 10 — Component Strategy

**Component Library & Custom Components — PrimeEditz**

---

## Design System Components

### From shadcn/ui (Available)

| Component         | Usage in PrimeEditz            |
| ----------------- | ------------------------------ |
| **Button**        | All CTAs, actions              |
| **Card**          | Project cards, info panels     |
| **Dialog**        | Confirmations, forms           |
| **Dropdown Menu** | Context menus, bulk actions    |
| **Input**         | Forms, search                  |
| **Select**        | Dropdowns, filters             |
| **Tabs**          | Section navigation             |
| **Table**         | Data lists, admin views        |
| **Toast**         | Notifications, confirmations   |
| **Avatar**        | User/client images             |
| **Badge**         | Status indicators (base)       |
| **Progress**      | Upload/stage progress          |
| **Skeleton**      | Loading states                 |
| **Sheet**         | Mobile navigation, side panels |
| **Command**       | Command palette (⌘K)           |

### From Radix (Primitives)

| Primitive           | Usage                     |
| ------------------- | ------------------------- |
| **Navigation Menu** | Sidebar navigation        |
| **Scroll Area**     | Long lists, project views |
| **Tooltip**         | Icon labels, help text    |
| **Popover**         | Quick actions, previews   |
| **Separator**       | Section dividers          |

---

## Custom Components

### 1. ProjectCard

**Purpose:** Display project status at a glance

**Anatomy:**

```
┌─────────────────────────────────────────────────────────┐
│ [Client Avatar]  Project Name              [Status Badge]│
│                  Client Name • Due Mar 22               │
├─────────────────────────────────────────────────────────┤
│ ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 75%     │
├─────────────────────────────────────────────────────────┤
│ Current Stage: QC Review                                │
│ 3 albums ready • 247 files                              │
├─────────────────────────────────────────────────────────┤
│ [View Details]                        [Download] [More] │
└─────────────────────────────────────────────────────────┘
```

**States:**

- Default, Hover (elevated), Expanded
- Status variants: Pending, In Progress, Review, Complete, Needs Action

**Props:**

```typescript
interface ProjectCardProps {
  project: Project;
  variant?: "compact" | "expanded";
  onView?: () => void;
  onDownload?: () => void;
}
```

---

### 2. StatusBadge

**Purpose:** Indicate project/stage status with color + icon + label

**Variants:**

| Status            | Background | Icon | Label           |
| ----------------- | ---------- | ---- | --------------- |
| `pending`         | warning/10 | ⏳   | Pending         |
| `in-progress`     | info/10    | 🔄   | In Progress     |
| `review`          | primary/10 | 👁️   | In Review       |
| `complete`        | success/10 | ✅   | Complete        |
| `action-required` | error/10   | ⚠️   | Action Required |

**Props:**

```typescript
interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
}
```

---

### 3. UploadDropzone

**Purpose:** Drag-drop file upload area with progress

**Anatomy:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              📁 Drop files here or click                │
│                                                         │
│        Supports: RAW, JPG, PNG, MP4, MOV (up to 10GB)   │
│                                                         │
└─────────────────────────────────────────────────────────┘

Uploading state:
┌─────────────────────────────────────────────────────────┐
│ wedding_001.jpg                    ██████████░░ 75%     │
│ wedding_002.jpg                    ████░░░░░░░░ 25%     │
│ wedding_003.jpg                    Queued...            │
│                                                         │
│ 2 of 247 files • 1.2 GB of 4.8 GB                       │
└─────────────────────────────────────────────────────────┘
```

**States:**

- Empty, Hovering, Uploading, Complete, Error

**Props:**

```typescript
interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  projectId?: string;
}
```

---

### 4. ActionCard

**Purpose:** Surface actionable items requiring attention

**Anatomy:**

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Quotation Ready for Approval                         │
│                                                         │
│ Wedding Photography Edit — Sharma Family                │
│ ₹45,000 • 500 photos • Standard delivery                │
│                                                         │
│ [View Details]                      [Approve & Continue] │
└─────────────────────────────────────────────────────────┘
```

**Variants:**

- Quote approval
- Files ready for download
- Review requested
- Payment pending

---

### 5. ProgressStages

**Purpose:** Show multi-stage workflow progress

**Anatomy:**

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Upload ─── ✅ Editing ─── 🔄 QC ─── ○ Review ─── ○ Done│
│     100%         100%       75%       0%           0%   │
└─────────────────────────────────────────────────────────┘
```

**Props:**

```typescript
interface ProgressStagesProps {
  stages: WorkflowStage[];
  currentStage: string;
  variant?: "horizontal" | "vertical";
}
```

---

### 6. CommandPalette

**Purpose:** Universal search and action access (⌘K)

**Anatomy:**

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Search projects, actions, or type a command...       │
├─────────────────────────────────────────────────────────┤
│ Recent Projects                                         │
│   📁 Sharma Wedding                                     │
│   📁 Corporate Shoot - TechCorp                         │
│                                                         │
│ Quick Actions                                           │
│   ➕ Create New Project                                 │
│   📤 Upload Files                                       │
│   ⚙️ Settings                                           │
│                                                         │
│ Navigation                                              │
│   🏠 Dashboard                                          │
│   👥 Clients                                            │
└─────────────────────────────────────────────────────────┘
```

**Implementation:** Use `cmdk` library (included in shadcn/ui)

---

## Component Implementation Strategy

### Phase 1: Core Components (MVP)

| Component      | Priority | Source        |
| -------------- | -------- | ------------- |
| ProjectCard    | P0       | Custom        |
| StatusBadge    | P0       | Custom        |
| UploadDropzone | P0       | Custom        |
| ActionCard     | P0       | Custom        |
| CommandPalette | P1       | cmdk + custom |

### Phase 2: Enhancement Components

| Component         | Priority | Source |
| ----------------- | -------- | ------ |
| ProgressStages    | P2       | Custom |
| QuotationCard     | P2       | Custom |
| TeamAssignment    | P2       | Custom |
| NotificationPanel | P2       | Custom |

### Phase 3: Polish Components

| Component      | Priority | Source |
| -------------- | -------- | ------ |
| EmptyState     | P3       | Custom |
| OnboardingFlow | P3       | Custom |
| ActivityFeed   | P3       | Custom |

---

## Implementation Guidelines

### All Custom Components Must:

1. **Use design tokens** — Never hardcode colors/spacing
2. **Support both themes** — Test in dark and light mode
3. **Be keyboard accessible** — Tab navigation, focus states
4. **Include ARIA labels** — For screen readers
5. **Have loading states** — Skeleton or spinner
6. **Handle errors gracefully** — Error states, retry actions
7. **Be responsive** — Work on mobile

### Component File Structure

```
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── domain/                # PrimeEditz custom components
│   ├── project-card.tsx
│   ├── status-badge.tsx
│   ├── upload-dropzone.tsx
│   ├── action-card.tsx
│   └── ...
└── layout/                # Layout components
    ├── sidebar.tsx
    ├── header.tsx
    └── ...
```

---

_Component strategy aligned with shadcn/ui baseline and Sajid's depth methodology._
