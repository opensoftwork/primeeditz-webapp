# Story 10-6: FAQ Section

**Epic**: Epic 10 - Landing Page — Marketing & Conversion  
**Status**: done
**Complexity**: Low (2 points)  
**Created**: 2026-01-22  
**Priority**: P2 — Trust building

---

## 📋 User Story

**As a** Visitor,  
**I want** to find answers to common questions,  
**So that** I can resolve doubts before signing up.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On            | Status       | Notes                      |
| --------------------- | ------------ | -------------------------- |
| **10-0 - Foundation** | backlog      | Directory structure needed |
| **shadcn Accordion**  | ✅ Available | Use existing component     |

### Enables

| Story / Epic              | Notes                      |
| ------------------------- | -------------------------- |
| **10-10 - Page Assembly** | Section will be integrated |

---

## ✅ Acceptance Criteria

### AC1: FAQ Display

- [ ] **Given** I am viewing the FAQ section
- [ ] **When** I see the questions
- [ ] **Then** I see the following FAQs:

| #   | Question                         |
| --- | -------------------------------- |
| 1   | How does file storage work?      |
| 2   | Can I invite my team?            |
| 3   | What file formats are supported? |
| 4   | How do quotations work?          |
| 5   | Is there a mobile app?           |
| 6   | How secure is my data?           |
| 7   | Can I cancel anytime?            |
| 8   | Do you offer custom solutions?   |

### AC2: Accordion Behavior

- [ ] **Given** I click on a question
- [ ] **Then** the answer expands with smooth animation
- [ ] **And** clicking another question closes the previous one (single-open mode)

### AC3: Accessibility

- [ ] **Given** I navigate with keyboard
- [ ] **Then** I can Tab to each question
- [ ] **And** Enter/Space opens the answer
- [ ] **And** proper ARIA attributes are present

### AC4: Visual Design

- [ ] **Given** each FAQ item
- [ ] **Then** it must have:
  - Question text (bold)
  - Expand/collapse indicator (chevron or plus/minus)
  - Answer text (muted color)
  - Subtle separator between items

---

## 🎨 Design Specifications

### Section Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FREQUENTLY ASKED QUESTIONS                                                  │
│  ───────────────────────────                                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ How does file storage work?                                      [▼]   ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Each project is allocated storage based on your quotation. Clients     ││
│  │ can upload raw files directly to secure folders. Storage usage is      ││
│  │ tracked in real-time with clear visual indicators.                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Can I invite my team?                                            [▶]   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ What file formats are supported?                                 [▶]   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ... (more questions)                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### FAQ Item Styling

```css
.faq-item {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.faq-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  font-weight: 600;
}

.faq-content {
  padding: 1rem 1.5rem;
  color: var(--muted-foreground);
  line-height: 1.6;
}
```

---

## 📘 Implementation Tasks

### Task 1: Create Component File

**File**: `src/components/modules/landing/sections/faq.tsx`

- [x] 1.1 Create base component structure
- [x] 1.2 Define FAQ data array (questions + answers)
- [x] 1.3 Import Accordion from shadcn/ui

### Task 2: Define FAQ Content

```typescript
const faqs = [
  {
    question: "How does file storage work?",
    answer:
      "Each project is allocated storage based on your quotation. Clients can upload raw files directly to secure folders. Storage usage is tracked in real-time with clear visual indicators.",
  },
  {
    question: "Can I invite my team?",
    answer:
      "Yes! Depending on your plan, you can invite team members as Employees (Editors, QC) who can access assigned projects, download assets, and upload deliverables.",
  },
  // ... more FAQs
];
```

- [x] 2.1 Write all 8 FAQ answers
- [x] 2.2 Keep answers concise (2-3 sentences)

### Task 3: Build Accordion Component

- [x] 3.1 Use shadcn Accordion component
- [x] 3.2 Configure single-open mode
- [x] 3.3 Style trigger and content
- [x] 3.4 Add expand/collapse icon

### Task 4: Ensure Accessibility

- [x] 4.1 Verify ARIA attributes
- [x] 4.2 Test keyboard navigation
- [x] 4.3 Test screen reader behavior

### Task 5: Export from Index

- [x] 5.1 Add export to `sections/index.ts`

---

## 📝 FAQ Answers

| Question                             | Answer                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **How does file storage work?**      | Each project is allocated storage based on your quotation. Clients upload raw files directly to secure folders. Storage usage is tracked in real-time.   |
| **Can I invite my team?**            | Yes! Depending on your plan, you can invite team members as Employees who can access assigned projects and upload deliverables.                          |
| **What file formats are supported?** | We support JPG, PNG, GIF for photos, and MP4, MOV, AVI for videos. Maximum file sizes are 100MB for photos and 2GB for videos.                           |
| **How do quotations work?**          | Admins create quotations from templates, specifying services and storage needs. Clients receive a detailed breakdown and can approve or request changes. |
| **Is there a mobile app?**           | Not yet, but our web app is fully responsive and works great on mobile devices. Native apps are on our roadmap for 2025.                                 |
| **How secure is my data?**           | All files are encrypted in transit and at rest. We use signed URLs for secure access, and you control who can view your projects.                        |
| **Can I cancel anytime?**            | Yes! All paid plans are month-to-month with no long-term contracts. You can cancel anytime from your account settings.                                   |
| **Do you offer custom solutions?**   | Absolutely! Our Enterprise plan includes custom storage limits, dedicated support, and tailored features for larger studios. Contact us to discuss.      |

---

## 🧪 Testing Checklist

- [x] All 8 FAQs render
- [x] Accordion opens/closes smoothly
- [x] Single-open mode works
- [x] Keyboard navigation works
- [x] ARIA attributes present
- [x] Answers readable

---

## 🚀 Definition of Done

- [x] Component created at correct path
- [x] All 8 FAQs displayed with answers
- [x] Accordion behavior working
- [x] Accessible (keyboard + screen reader)
- [x] Exported from sections index
- [x] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status    | Notes                                         |
| ---------- | --------- | --------------------------------------------- |
| 2026-01-22 | backlog   | Story created from Epic 10 plan               |
| 2026-01-22 | Completed | Implemented FAQ section with shadcn Accordion |

---

**Previous Story**: 10-5 - Pricing Section  
**Next Story**: 10-7 - CTA Banner Section
