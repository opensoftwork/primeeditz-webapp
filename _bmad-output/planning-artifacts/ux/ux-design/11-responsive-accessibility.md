# 11 — Responsive & Accessibility

**Mobile-First Design & WCAG Compliance — PrimeEditz**

---

## Responsive Strategy

### Mobile-First Approach

All styles start with mobile as the base, then enhance for larger screens.

```css
/* Base: Mobile (< 640px) */
.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

### Breakpoint Reference

| Token | Width  | Device         | Layout Adaptation           |
| ----- | ------ | -------------- | --------------------------- |
| `sm`  | 640px  | Large phones   | 1-2 columns                 |
| `md`  | 768px  | Tablets        | 2 columns, sidebar collapse |
| `lg`  | 1024px | Small laptops  | 3 columns, sidebar visible  |
| `xl`  | 1280px | Desktops       | Full layout                 |
| `2xl` | 1536px | Large desktops | Wider margins               |

---

## Mobile-Specific Adaptations

### Navigation

**Desktop:** Left sidebar, always visible
**Mobile:** Bottom navigation bar + hamburger menu

```
Mobile Navigation:
┌──────────────────────────────────────┐
│ [🏠 Home] [📁 Projects] [➕] [🔔] [👤] │
└──────────────────────────────────────┘
```

### Cards

**Desktop:** Horizontal layout with actions inline
**Mobile:** Vertical stack, actions in dropdown or bottom sheet

### Tables

**Desktop:** Full table with all columns
**Mobile:** Card-based view or horizontal scroll with primary columns

### Upload

**Desktop:** Large dropzone with drag-drop
**Mobile:** Full-screen button → native file picker

---

## Touch Target Standards

| Element     | Minimum Size | Recommended |
| ----------- | ------------ | ----------- |
| Buttons     | 44 × 44px    | 48 × 48px   |
| Links       | 44 × 44px    | —           |
| Icons       | 44 × 44px    | 48 × 48px   |
| List items  | 48px height  | 56px height |
| Form inputs | 44px height  | 48px height |

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement                      | Implementation                           |
| -------------------------------- | ---------------------------------------- |
| **1.1.1** Text alternatives      | Alt text on images, ARIA labels on icons |
| **1.3.1** Info and relationships | Semantic HTML (header, nav, main, aside) |
| **1.4.3** Contrast (minimum)     | 4.5:1 for text, 3:1 for large text       |
| **1.4.11** Non-text contrast     | 3:1 for UI components and graphics       |
| **2.1.1** Keyboard               | All functionality via keyboard           |
| **2.4.3** Focus order            | Logical tab order                        |
| **2.4.7** Focus visible          | 2px solid focus ring                     |
| **4.1.2** Name, role, value      | ARIA labels on all interactive elements  |

### Color Contrast Verification

| Element                | Foreground     | Background         | Ratio | Pass |
| ---------------------- | -------------- | ------------------ | ----- | ---- |
| Primary text (dark)    | oklch(90% 0 0) | oklch(0% 0 0)      | 18:1  | ✅   |
| Primary text (light)   | oklch(15% 0 0) | oklch(95% 0 0)     | 12:1  | ✅   |
| Secondary text (dark)  | oklch(70% 0 0) | oklch(0% 0 0)      | 9:1   | ✅   |
| Secondary text (light) | oklch(40% 0 0) | oklch(95% 0 0)     | 7:1   | ✅   |
| Primary button         | oklch(98% 0 0) | oklch(65% 0.2 265) | 5:1   | ✅   |

---

## Keyboard Navigation

### Global Shortcuts

| Shortcut        | Action                   |
| --------------- | ------------------------ |
| `⌘K` / `Ctrl+K` | Open command palette     |
| `Esc`           | Close modal/palette      |
| `Tab`           | Move focus forward       |
| `Shift+Tab`     | Move focus backward      |
| `Enter`         | Activate focused element |
| `Space`         | Toggle checkbox/button   |
| `Arrow keys`    | Navigate lists/menus     |

### Focus Management

```tsx
// Focus trap for modals
<Dialog>
  <FocusTrap>
    <DialogContent>
      {/* First focusable element receives focus */}
      <CloseButton autoFocus />
      {/* Tab cycles within modal */}
      <Content />
      <Actions />
    </DialogContent>
  </FocusTrap>
</Dialog>
```

### Focus Ring Style

```css
/* Visible focus ring for all interactive elements */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Remove default outline when not using keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## Screen Reader Support

### ARIA Labels

```tsx
// Icon-only buttons need labels
<Button aria-label="Download files">
  <DownloadIcon />
</Button>

// Status badges need context
<StatusBadge
  status="in-progress"
  aria-label="Project status: In Progress, 75% complete"
/>

// Progress bars need values
<Progress
  value={75}
  aria-label="Upload progress"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

### Live Regions

```tsx
// Announce dynamic updates
<div aria-live="polite" aria-atomic="true">
  {uploadComplete && "Upload complete. 247 files uploaded successfully."}
</div>

// Urgent announcements
<div aria-live="assertive">
  {error && "Error: Upload failed. Please try again."}
</div>
```

---

## Reduced Motion

Respect user preference for reduced motion:

```css
/* Default animations */
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .card:hover {
    transform: none;
  }
}
```

---

## Color Blind Considerations

### Never Rely on Color Alone

| Scenario | Bad                 | Good                           |
| -------- | ------------------- | ------------------------------ |
| Status   | 🟢 (just green dot) | ✅ Complete (icon + label)     |
| Error    | Red text only       | ⚠️ Error message (icon + text) |
| Progress | Colored bar only    | Bar + percentage text          |

### Status Badge Implementation

```tsx
// Accessible status badge
<StatusBadge status="error">
  <ErrorIcon aria-hidden="true" />
  <span>Action Required</span>
</StatusBadge>
```

---

## Testing Checklist

### Accessibility Testing

- [ ] Lighthouse accessibility audit (score > 95)
- [ ] axe DevTools scan (0 critical/serious issues)
- [ ] Keyboard navigation test (all interactive elements reachable)
- [ ] Screen reader test (VoiceOver, NVDA)
- [ ] Color contrast verification
- [ ] Reduced motion test

### Responsive Testing

- [ ] Mobile (375px) — iPhone SE
- [ ] Mobile Large (414px) — iPhone 14
- [ ] Tablet (768px) — iPad Mini
- [ ] Tablet Large (1024px) — iPad Pro
- [ ] Desktop (1280px)
- [ ] Desktop Large (1536px)

---

_Accessibility and responsive design following WCAG 2.1 AA standards and mobile-first principles._
