# Story 10-3: Workflow Demo Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: backlog  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-22  
**Priority**: P1 — Visual workflow explanation

---

## 📋 User Story

**As a** Visitor,  
**I want** to see the complete workflow from request to delivery,  
**So that** I understand how the platform works end-to-end.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status  | Notes                      |
| --------------------- | ------- | -------------------------- |
| **10-0 - Foundation** | backlog | Directory structure needed |

### Enables

| Story / Epic              | Notes                      |
| ------------------------- | -------------------------- |
| **10-10 - Page Assembly** | Section will be integrated |

---

## ✅ Acceptance Criteria

### AC1: Timeline Display

- [ ] **Given** I am viewing the Workflow section
- [ ] **When** I see the timeline
- [ ] **Then** I see 6 workflow steps:

| Step | Icon        | Title   | Description                              |
| ---- | ----------- | ------- | ---------------------------------------- |
| 1    | FileEdit    | Request | Client submits project requirements      |
| 2    | Receipt     | Quote   | Admin generates quotation from templates |
| 3    | CheckCircle | Approve | Client reviews and approves quotation    |
| 4    | Upload      | Upload  | Client uploads raw assets to folders     |
| 5    | Wand2       | Edit    | Team works on deliverables               |
| 6    | Download    | Deliver | Final files ready for download           |

### AC2: Desktop Layout (Horizontal)

- [ ] **Given** I am on desktop (1024px+)
- [ ] **Then** steps are displayed horizontally
- [ ] **And** connected by a progress line
- [ ] **And** each step shows number, icon, title, and description

### AC3: Mobile Layout (Vertical)

- [ ] **Given** I am on mobile (< 768px)
- [ ] **Then** steps are displayed vertically
- [ ] **And** connected by a vertical line
- [ ] **And** each step is clearly separated

### AC4: Visual Design

- [ ] **Given** each step
- [ ] **Then** it must have:
  - Step number in a circle (with primary color)
  - Icon below the number
  - Title (bold)
  - Description (muted text)
  - Connecting line to next step

### AC5: Animation (Optional)

- [ ] **Given** the timeline is in viewport
- [ ] **When** scrolling into view
- [ ] **Then** steps animate in sequentially
- [ ] **Or** on click/hover, step highlights

---

## 🎨 Design Specifications

### Desktop Layout (Horizontal)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FROM REQUEST TO DELIVERY                                                    │
│  ────────────────────────                                                    │
│                                                                              │
│    ①──────②──────③──────④──────⑤──────⑥                                     │
│    📝      💰      ✓       📤      🎨      ⬇️                                │
│  Request  Quote  Approve  Upload  Edit   Deliver                            │
│                                                                              │
│  Client    Admin   Client  Client  Team   Ready!                            │
│  submits   creates reviews uploads works
│  request   quote   quote   assets  magic
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Vertical)

```
┌─────────────────────────────────┐
│  FROM REQUEST TO DELIVERY       │
│  ────────────────────────       │
│                                 │
│  ① REQUEST                      │
│  │  📝 Client submits           │
│  │     project requirements     │
│  │                              │
│  ② QUOTE                        │
│  │  💰 Admin generates          │
│  │     quotation                │
│  │                              │
│  ③ APPROVE                      │
│  │  ✓ Client reviews            │
│  │    and approves              │
│  │                              │
│  ④ UPLOAD                       │
│  │  📤 Client uploads           │
│  │     raw assets               │
│  │                              │
│  ⑤ EDIT                         │
│  │  🎨 Team works on            │
│  │     deliverables             │
│  │                              │
│  ⑥ DELIVER                      │
│     ⬇️ Final files ready        │
│        for download             │
│                                 │
└─────────────────────────────────┘
```

### Step Circle Styling

```css
.step-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.3);
}

.step-line {
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--muted));
  flex: 1;
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/workflow.tsx`

- [ ] 1.1 Create base component structure
- [ ] 1.2 Define workflow steps data array
- [ ] 1.3 Import Lucide icons

### Task 2: Build Step Component

- [ ] 2.1 Create WorkflowStep sub-component
- [ ] 2.2 Add number circle with primary color
- [ ] 2.3 Add icon display
- [ ] 2.4 Add title and description

### Task 3: Desktop Horizontal Layout

- [ ] 3.1 Create horizontal flex container
- [ ] 3.2 Add connecting lines between steps
- [ ] 3.3 Center align all steps
- [ ] 3.4 Test on large screens

### Task 4: Mobile Vertical Layout

- [ ] 4.1 Create vertical flex layout
- [ ] 4.2 Add connecting vertical line
- [ ] 4.3 Align content appropriately
- [ ] 4.4 Test on small screens

### Task 5: Optional Animation

- [ ] 5.1 Add sequential fade-in on scroll
- [ ] 5.2 Test animation performance

### Task 6: Export from Index

- [ ] 6.1 Add export to `sections/index.ts`

---

## 🧪 Testing Checklist

- [ ] All 6 steps render correctly
- [ ] Horizontal layout on desktop
- [ ] Vertical layout on mobile
- [ ] Connecting lines visible
- [ ] Icons display correctly
- [ ] Text readable on all sizes
- [ ] Animation smooth (if implemented)

---

## 🚀 Definition of Done

- [ ] Component created at correct path
- [ ] All 6 workflow steps displayed
- [ ] Horizontal (desktop) and vertical (mobile) layouts
- [ ] Connecting lines working
- [ ] Exported from sections index
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                           |
| ---------- | ------- | ------------------------------- |
| 2026-01-22 | backlog | Story created from Epic 10 plan |

---

**Previous Story**: 10-2 - Features Showcase Section  
**Next Story**: 10-4 - Who It's For Section
