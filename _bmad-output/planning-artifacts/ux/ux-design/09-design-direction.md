# 09 — Design Direction

**Visual Approach & Layout Strategy — PrimeEditz**

---

## Chosen Design Direction

### Direction: "Linear-Inspired Premium Dark"

We're adopting a design direction that combines:

- **Linear's** keyboard-first, minimal chrome approach
- **Stripe's** premium light mode with shadows and depth
- **Sajid's** two-step depth methodology for consistent elevation

### Key Visual Characteristics

| Characteristic          | Implementation                                  |
| ----------------------- | ----------------------------------------------- |
| **Dark Mode Default**   | Premium black (#0D0D0D) base, not gray          |
| **Light Mode Optional** | Warm off-white (#FAFAFA) with shadows for depth |
| **Minimal Chrome**      | Content-first, navigation collapses             |
| **Card-Based Layout**   | Status cards as primary information unit        |
| **Progress Visibility** | Inline progress bars, status badges             |
| **Command Palette**     | ⌘K for power users                              |

---

## Layout Approach

### Dashboard Layout (Primary)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]    Search...                            [⌘K]  [Theme] [User] │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐│
│ │ SIDEBAR  │ │                    MAIN CONTENT                      ││
│ │          │ │                                                      ││
│ │ Dashboard│ │  ┌────────────────┐ ┌────────────────┐              ││
│ │ Projects │ │  │ Project Card 1 │ │ Project Card 2 │              ││
│ │ Clients  │ │  │ Status + Progress│ Status + Progress│            ││
│ │ Team     │ │  └────────────────┘ └────────────────┘              ││
│ │ Settings │ │                                                      ││
│ │          │ │  ┌────────────────────────────────────┐              ││
│ └──────────┘ │  │ Needs Your Attention               │              ││
│              │  │ • Quote pending approval           │              ││
│              │  │ • Files ready for download         │              ││
│              │  └────────────────────────────────────┘              ││
└──────────────┴──────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────────────┐
│ [☰]   PrimeEditz   [👤]  │
├──────────────────────────┤
│                          │
│ ┌──────────────────────┐ │
│ │ Project Card         │ │
│ │ ████████░░░░ 75%     │ │
│ │ [View] [Download]    │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ ⚠️ Needs Attention   │ │
│ │ Quote ready to approve│ │
│ │ [Approve Now]        │ │
│ └──────────────────────┘ │
│                          │
├──────────────────────────┤
│ [🏠] [📁] [➕] [🔔] [⚙️] │
└──────────────────────────┘
```

---

## Component Visual Style

### Cards (Primary Information Unit)

**Dark Mode:**

```css
.card {
  background: var(--bg-surface); /* 5% lightness */
  border: 1px solid var(--border); /* 20% lightness */
  border-radius: 12px;
  padding: 24px;
}

.card:hover {
  background: var(--bg-raised); /* 10% lightness */
}
```

**Light Mode:**

```css
.card {
  background: var(--bg-surface); /* 100% - white */
  box-shadow: var(--shadow-sm); /* Sajid shadow system */
  border-radius: 12px;
  padding: 24px;
}

.card:hover {
  box-shadow: var(--shadow-md); /* Elevated on hover */
}
```

### Buttons

| Variant         | Background    | Text               | Use Case          |
| --------------- | ------------- | ------------------ | ----------------- |
| **Primary**     | `--primary`   | White              | Main CTAs         |
| **Secondary**   | `--bg-raised` | `--text-primary`   | Secondary actions |
| **Ghost**       | Transparent   | `--text-secondary` | Tertiary actions  |
| **Destructive** | `--error`     | White              | Delete, remove    |

### Status Badges

| Status           | Color       | Icon | Label           |
| ---------------- | ----------- | ---- | --------------- |
| **Pending**      | `--warning` | ⏳   | Pending         |
| **In Progress**  | `--info`    | 🔄   | In Progress     |
| **Review**       | `--primary` | 👁️   | In Review       |
| **Complete**     | `--success` | ✅   | Complete        |
| **Needs Action** | `--error`   | ⚠️   | Action Required |

---

## Design Rationale

### Why This Direction?

| Decision              | Rationale                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| **Dark Mode Default** | Creative professionals prefer it; reduces eye strain during long sessions |
| **Card-Based Layout** | Glanceable status; each project is a clear information unit               |
| **Minimal Sidebar**   | Maximizes content area; navigation is secondary to status                 |
| **Command Palette**   | Power users (admins, employees) can work faster                           |
| **Progress Inline**   | Status visible without clicking; reduces "is it ready?" calls             |

### Implementation Approach

1. **Start with shadcn/ui** components as baseline
2. **Apply Sajid depth** methodology (lightness layers + shadows)
3. **Customize tokens** to match Linear-inspired aesthetic
4. **Build domain components** (ProjectCard, StatusBadge) using primitives
5. **Test both themes** with visual regression

---

_Design direction established based on inspiration analysis and project requirements._
