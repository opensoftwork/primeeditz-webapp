# 05 — UX Patterns & Inspiration

**Pattern Analysis & Anti-Patterns — PrimeEditz**

---

## Inspiring Products Analysis

### Linear (Primary Inspiration)

**Why:** Premium productivity tool with exceptional UX craftsmanship

| Pattern              | Linear Implementation           | PrimeEditz Application                        |
| -------------------- | ------------------------------- | --------------------------------------------- |
| Command Palette (⌘K) | Universal action access         | Jump to project, search, quick actions        |
| Keyboard Navigation  | Full keyboard control           | Navigate, approve, actions via keyboard       |
| Instant Transitions  | No spinners, immediate response | Optimistic UI, skeleton screens               |
| Status Visualization | Color-coded, progress bars      | Project cards with status + progress          |
| Minimal Chrome       | Content-first, clean interface  | Maximum content area, hide navigation clutter |
| Dark Theme Premium   | Deep blacks, subtle accents     | Primary theme with premium feel               |

**Key Takeaways:**

- Speed is the feature
- Keyboard shortcuts for power users
- Every transition should feel instant
- Status should be visible without interaction

---

### Stripe (Light Mode Reference)

**Why:** Premium light mode that doesn't feel sterile

| Pattern            | Stripe Implementation  | PrimeEditz Application        |
| ------------------ | ---------------------- | ----------------------------- |
| Depth with Shadows | Soft, diffused shadows | Card elevation in light mode  |
| Warm Whites        | Off-white backgrounds  | #FAFAFA not #FFFFFF           |
| Accent Use         | Strategic blue accents | Indigo for CTAs only          |
| Typography         | Clear hierarchy        | Large headings, readable body |

**Key Takeaways:**

- Light mode needs depth (shadows, not borders)
- Strategic color use creates hierarchy
- White space is premium

---

### Notion (Onboarding Reference)

**Why:** Frictionless first-time experience

| Pattern                | Notion Implementation           | PrimeEditz Application              |
| ---------------------- | ------------------------------- | ----------------------------------- |
| Progressive Disclosure | Simple start, reveal complexity | Basic project first, advanced later |
| Templates              | Pre-built starting points       | Project type templates              |
| Inline Help            | Contextual tips                 | Guided first upload                 |

**Key Takeaways:**

- Get users to value fast
- Don't front-load complexity
- Templates accelerate adoption

---

## Transferable UX Patterns

### Navigation Patterns

- **Linear-Style Sidebar**: Collapsible, keyboard-navigable, current context visible
- **Command Palette**: Universal search and action access (⌘K)
- **Breadcrumb Context**: Always show where user is

### Interaction Patterns

- **Drag-Drop Everywhere**: File upload accepts drops on any project view
- **Optimistic UI**: Show success immediately, sync in background
- **Inline Actions**: Approve, download, delete without modal navigation
- **Swipe on Mobile**: Quick actions on cards

### Visual Patterns

- **Status Cards**: Color-coded status, progress visualization
- **Skeleton Loading**: Show layout while content loads
- **Micro-Animations**: 150-200ms transitions, confirms actions
- **Toast Notifications**: Non-blocking confirmations

### Feedback Patterns

- **Instant Confirmation**: Every action acknowledged immediately
- **Progress Visibility**: Upload %, stage completion
- **Error Context**: Clear what went wrong, how to fix

---

## Anti-Patterns to Avoid

| Anti-Pattern             | Why Harmful           | Prevention Strategy                           |
| ------------------------ | --------------------- | --------------------------------------------- |
| Feature-Heavy Dashboards | Cognitive overload    | Action-focused cards, progressive disclosure  |
| Buried Core Actions      | Friction on key tasks | Upload/approve visible at all times           |
| Desktop-Only Design      | Excludes mobile users | Mobile-first responsive approach              |
| Loading Spinners         | Feel slow             | Skeleton screens, optimistic updates          |
| Complex Terminology      | Confuses users        | Plain English: "Ready", "In Progress", "Done" |
| Deep Navigation Nesting  | Items hard to find    | Flat structure + search                       |
| Modal Overload           | Interrupts flow       | Inline editing, sheets over modals            |
| Email-Only Notifications | Easy to miss          | In-app primary, email secondary               |

---

## Design Inspiration Strategy

### Adopt Directly

- Command palette (⌘K) for universal access
- Keyboard shortcuts for power users
- Optimistic UI with instant feedback
- Status-focused cards with progress visualization
- Skeleton loading states

### Adapt for Context

- Linear's team/project hierarchy → Client/Project/Stage hierarchy
- Linear's cycles → Project due dates and milestones
- Linear's filters → Project status, client, date filters

### Avoid Explicitly

- Complex multi-step wizards (merge into single forms)
- Hidden upload functionality (always visible)
- Technical error messages (user-friendly language)
- Desktop-only features (mobile-first)

---

_Pattern analysis conducted through inspiration study and Party Mode discussion._
