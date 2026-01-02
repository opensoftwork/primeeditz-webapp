# 08 — Visual Foundation

**Colors, Typography, Spacing & Accessibility — PrimeEditz**

---

## Color System (Consolidated)

### Semantic Color Mapping

| Token       | Purpose           | Dark Mode             | Light Mode            |
| ----------- | ----------------- | --------------------- | --------------------- |
| **Primary** | CTAs, key actions | `oklch(65% 0.2 265)`  | `oklch(55% 0.25 265)` |
| **Success** | Positive states   | `oklch(70% 0.2 150)`  | `oklch(45% 0.2 150)`  |
| **Warning** | Alerts, caution   | `oklch(75% 0.15 80)`  | `oklch(55% 0.2 80)`   |
| **Error**   | Destructive       | `oklch(65% 0.25 25)`  | `oklch(50% 0.25 25)`  |
| **Info**    | Informational     | `oklch(70% 0.15 230)` | `oklch(50% 0.2 230)`  |

### Neutral Scale (Sajid Lightness Ladder)

| Layer              | Dark Mode | Light Mode            | Application     |
| ------------------ | --------- | --------------------- | --------------- |
| **Base**           | 0% L      | 95% L                 | Page background |
| **Surface**        | 5% L      | 100% L                | Cards           |
| **Raised**         | 10% L     | 100% L + shadow       | Modals          |
| **Interactive**    | 15% L     | 100% L + hover shadow | Buttons         |
| **Text Primary**   | 90% L     | 15% L                 | Headings        |
| **Text Secondary** | 70% L     | 40% L                 | Body text       |
| **Text Muted**     | 50% L     | 60% L                 | Captions        |

---

## Typography System

### Font Stack

| Category           | Font           | Fallback              |
| ------------------ | -------------- | --------------------- |
| **Sans (Primary)** | Inter          | system-ui, sans-serif |
| **Mono**           | JetBrains Mono | monospace             |

**Why Inter?**

- Designed for screens (optimal legibility at 14-16px)
- Variable font support (weight range)
- Used by Linear, Vercel, and modern SaaS products
- Excellent tabular figures for numbers/prices

### Type Scale

| Token       | Size | Weight | Line Height | Use                      |
| ----------- | ---- | ------ | ----------- | ------------------------ |
| `text-xs`   | 12px | 400    | 1.5         | Labels, captions         |
| `text-sm`   | 14px | 400    | 1.5         | Secondary text, metadata |
| `text-base` | 16px | 400    | 1.6         | Body text                |
| `text-lg`   | 18px | 500    | 1.5         | Emphasis                 |
| `text-xl`   | 20px | 600    | 1.4         | Section headings         |
| `text-2xl`  | 24px | 600    | 1.3         | Page headings            |
| `text-3xl`  | 30px | 700    | 1.2         | Hero titles              |

### Typography Hierarchy Rules

- **Headings:** Use 600-700 weight, tighter tracking (-0.01em)
- **Body:** Use 400 weight, looser line height (1.6)
- **Numbers/Prices:** Use tabular figures (font-feature-settings)
- **Contrast:** Primary text 7:1 ratio, secondary 4.5:1 ratio

---

## Spacing & Layout Foundation

### Spacing Scale (4px grid)

| Token | Value | CSS Var       | Use Case                 |
| ----- | ----- | ------------- | ------------------------ |
| `0`   | 0px   | `--space-0`   | None                     |
| `px`  | 1px   | `--space-px`  | Borders, fine lines      |
| `0.5` | 2px   | `--space-0.5` | Micro gaps               |
| `1`   | 4px   | `--space-1`   | Tight spacing, icons     |
| `2`   | 8px   | `--space-2`   | Small gaps, inline items |
| `3`   | 12px  | `--space-3`   | Default element gap      |
| `4`   | 16px  | `--space-4`   | Default padding          |
| `5`   | 20px  | `--space-5`   | Medium padding           |
| `6`   | 24px  | `--space-6`   | Section spacing          |
| `8`   | 32px  | `--space-8`   | Large gaps, card padding |
| `10`  | 40px  | `--space-10`  | Section separators       |
| `12`  | 48px  | `--space-12`  | Major sections           |
| `16`  | 64px  | `--space-16`  | Page-level spacing       |

### Layout Specifications

| Aspect            | Value                     |
| ----------------- | ------------------------- |
| Container max     | 1280px                    |
| Container padding | 16px mobile, 32px desktop |
| Grid columns      | 12 (4 mobile)             |
| Grid gap          | 24px (16px mobile)        |
| Text max width    | 65ch                      |

### Layout Principles

| Principle            | Implementation                          |
| -------------------- | --------------------------------------- |
| **Content First**    | Maximum content area, minimal chrome    |
| **Breathing Room**   | Generous padding (16-32px for cards)    |
| **Visual Hierarchy** | Sajid depth layers create natural order |
| **Responsive Grid**  | 12-column fluid, 4-column mobile        |

---

## Accessibility Specifications

### Contrast Requirements

| Element                     | Minimum | Target |
| --------------------------- | ------- | ------ |
| **Primary text**            | 4.5:1   | 7:1+   |
| **Large text (>18px bold)** | 3:1     | 4.5:1  |
| **Icons & Graphics**        | 3:1     | 3:1    |
| **Focus indicators**        | 3:1     | 3:1    |

### Interaction Standards

| Requirement             | Implementation                            |
| ----------------------- | ----------------------------------------- |
| **Focus visible**       | 2px solid primary ring on all interactive |
| **Touch targets**       | Min 44×44px on mobile                     |
| **Keyboard navigation** | Full keyboard support, ⌘K command palette |
| **Screen readers**      | ARIA labels on icons, semantic HTML       |
| **Reduced motion**      | Respect `prefers-reduced-motion`          |

### Color Blind Considerations

| Consideration                 | Implementation              |
| ----------------------------- | --------------------------- |
| **Don't rely on color alone** | Use icons + text for status |
| **Status badges**             | Icon + color + label        |
| **Progress bars**             | Percentage text alongside   |
| **Error states**              | Icon + red + message        |

---

## Border Radius System

| Token          | Value  | Use Case                |
| -------------- | ------ | ----------------------- |
| `rounded-none` | 0px    | Edges, dividers         |
| `rounded-sm`   | 4px    | Small elements, pills   |
| `rounded`      | 8px    | Default buttons, inputs |
| `rounded-md`   | 12px   | Cards, containers       |
| `rounded-lg`   | 16px   | Modals, large cards     |
| `rounded-full` | 9999px | Avatars, badges         |

---

## Z-Index Scale

| Token   | Value | Use Case              |
| ------- | ----- | --------------------- |
| `z-0`   | 0     | Base layer            |
| `z-10`  | 10    | Elevated cards        |
| `z-20`  | 20    | Sticky headers        |
| `z-30`  | 30    | Dropdowns             |
| `z-40`  | 40    | Overlays              |
| `z-50`  | 50    | Modals                |
| `z-100` | 100   | Toasts, notifications |

---

## Responsive Breakpoints

| Token | Width  | Target         |
| ----- | ------ | -------------- |
| `sm`  | 640px  | Large phones   |
| `md`  | 768px  | Tablets        |
| `lg`  | 1024px | Small laptops  |
| `xl`  | 1280px | Desktops       |
| `2xl` | 1536px | Large desktops |

### Mobile-First Approach

```css
/* Base styles for mobile */
.card {
  padding: var(--space-4);
  grid-column: span 4;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: var(--space-6);
    grid-column: span 6;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card {
    padding: var(--space-8);
    grid-column: span 4;
  }
}
```

---

_Visual foundation established following Sajid's methodology and modern accessibility standards._
