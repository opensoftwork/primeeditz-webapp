# 06 — Design System

**shadcn/ui + Sajid Methodology + OKLCH Tokens — PrimeEditz**

---

## Design System Choice

**Selected:** shadcn/ui + Radix UI + Tailwind CSS v4

**Design Methodology:** Sajid's Two-Step Depth System ([youtube.com/@whosajid](https://www.youtube.com/@whosajid))

**Color Model:** OKLCH (Tailwind CSS v4 default for perceptual uniformity)

**Component Strategy:** shadcn/ui baseline + migrated custom components from existing project

---

## Rationale for Selection

| Decision Factor            | How This Choice Addresses It                                |
| -------------------------- | ----------------------------------------------------------- |
| **Premium Aesthetic**      | Sajid's depth methodology + OKLCH creates premium feel      |
| **Mathematical Precision** | Lightness increments (5-10%) create consistent hierarchy    |
| **Dark + Light Mode**      | OKLCH inversion formula + manual adjustment                 |
| **Realistic Depth**        | Multi-layered shadows simulating physical light             |
| **Efficient Development**  | "Good tier" philosophy — impactful without over-engineering |
| **Modern Standards**       | OKLCH is Tailwind v4 default, future-proof                  |

---

## Sajid's Methodology Integration

### The Three-Category Color System

| Category           | Purpose                    | PrimeEditz Application            |
| ------------------ | -------------------------- | --------------------------------- |
| **Neutral Colors** | Backgrounds, text, borders | Page BG, cards, surfaces, text    |
| **Brand/Primary**  | CTAs, key actions          | Approve, Create, Download buttons |
| **Semantic**       | System states              | Success, Warning, Error, Info     |

### Two-Step Depth Process

**Step 1: Color Layers (Lightness Increments)**

| Layer           | Dark Mode (Lightness) | Light Mode (Lightness) | Application            |
| --------------- | --------------------- | ---------------------- | ---------------------- |
| **Base**        | 0%                    | 95%                    | Page background        |
| **Surface**     | 5%                    | 100%                   | Cards, panels          |
| **Raised**      | 10%                   | 100% + shadow          | Elevated cards, modals |
| **Interactive** | 15%                   | 100% + hover shadow    | Buttons, selections    |

**Step 2: Realistic Shadows**

Combining soft and dark shadows simulates physical light behavior:

| Level       | Technique                          | Use Case                        |
| ----------- | ---------------------------------- | ------------------------------- |
| **Level 1** | Light glow top + short dark bottom | Default cards                   |
| **Level 2** | Wider shadow spread                | Hover states, important items   |
| **Level 3** | Maximum depth                      | Modals, dropdowns, primary CTAs |
| **Inset**   | Dark top + light bottom inset      | Inputs, progress bar tracks     |

> _"Always mix a darker and shorter shadow with a lighter and longer one to achieve a more realistic effect."_ — Sajid

---

## OKLCH Color Tokens

```css
/* Dark Mode (Default) */
:root {
  /* Neutral Backgrounds */
  --bg-base: oklch(0% 0 0);
  --bg-surface: oklch(5% 0 0);
  --bg-raised: oklch(10% 0 0);
  --bg-interactive: oklch(15% 0 0);

  /* Text */
  --text-primary: oklch(90% 0 0); /* Not pure white */
  --text-secondary: oklch(70% 0 0); /* Muted */
  --text-muted: oklch(50% 0 0); /* Very subtle */

  /* Primary (Indigo) */
  --primary: oklch(65% 0.2 265);
  --primary-hover: oklch(70% 0.22 265);
  --primary-text: oklch(98% 0 0);

  /* Semantic */
  --success: oklch(70% 0.2 150);
  --warning: oklch(75% 0.15 80);
  --error: oklch(65% 0.25 25);
  --info: oklch(70% 0.15 230);

  /* Borders */
  --border: oklch(20% 0 0);
  --border-subtle: oklch(15% 0 0);
}

/* Light Mode */
[data-theme="light"] {
  --bg-base: oklch(95% 0 0); /* Warm off-white */
  --bg-surface: oklch(100% 0 0); /* Pure white */
  --bg-raised: oklch(100% 0 0); /* Differentiated by shadow */
  --bg-interactive: oklch(100% 0 0);

  --text-primary: oklch(15% 0 0);
  --text-secondary: oklch(40% 0 0);
  --text-muted: oklch(60% 0 0);

  --primary: oklch(55% 0.25 265); /* Deeper for contrast */
  --primary-hover: oklch(50% 0.27 265);

  --border: oklch(90% 0 0);
  --border-subtle: oklch(92% 0 0);
}
```

---

## Shadow System

```css
:root {
  /* Highlight (simulates light from above) */
  --glow-top: inset 0 1px 0 0 oklch(100% 0 0 / 5%);

  /* Level 1: Subtle */
  --shadow-sm: var(--glow-top), 0 1px 2px oklch(0% 0 0 / 10%), 0 1px 1px oklch(0%
          0 0 / 6%);

  /* Level 2: Medium */
  --shadow-md: var(--glow-top), 0 4px 6px oklch(0% 0 0 / 10%), 0 2px 4px oklch(0%
          0 0 / 6%);

  /* Level 3: Large */
  --shadow-lg: var(--glow-top), 0 10px 15px oklch(0% 0 0 / 10%), 0 4px 6px oklch(0%
          0 0 / 5%);

  /* Inset (recessed) */
  --shadow-inset: inset 0 2px 4px oklch(0% 0 0 / 6%), inset 0 -1px 0 oklch(100%
          0 0 / 5%);
}

/* Dark mode: prefer borders over shadows */
[data-theme="dark"] {
  --shadow-sm: none;
  --shadow-md: 0 0 0 1px oklch(20% 0 0);
  --shadow-lg: 0 0 0 1px oklch(25% 0 0);
}
```

---

## Typography & Spacing

### Font Stack

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

### Type Scale

| Token       | Size | Use Case         |
| ----------- | ---- | ---------------- |
| `text-xs`   | 12px | Captions, labels |
| `text-sm`   | 14px | Secondary text   |
| `text-base` | 16px | Body text        |
| `text-lg`   | 18px | Large body       |
| `text-xl`   | 20px | Section headings |
| `text-2xl`  | 24px | Page headings    |
| `text-3xl`  | 30px | Hero titles      |

### Spacing Scale (4px grid)

| Token | Value | Use Case        |
| ----- | ----- | --------------- |
| `xs`  | 4px   | Tight gaps      |
| `sm`  | 8px   | Icon gaps       |
| `md`  | 16px  | Default padding |
| `lg`  | 24px  | Section spacing |
| `xl`  | 32px  | Card padding    |
| `2xl` | 48px  | Large gaps      |

### Animation

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 200ms;
}
```

---

## Component Strategy

| Category       | Source                   | Customization                |
| -------------- | ------------------------ | ---------------------------- |
| **Primitives** | shadcn/ui                | Token styling + Sajid depth  |
| **Forms**      | React Hook Form + shadcn | Inset shadows for inputs     |
| **Navigation** | Radix + custom           | Linear-style sidebar         |
| **Command**    | cmdk                     | ⌘K palette                   |
| **Domain**     | Custom (migrated)        | Project cards, status badges |

---

## Component Migration Plan

When migrating existing components from the previous project:

1. **Extract** current component styles
2. **Map** old color values → new OKLCH tokens
3. **Apply** Sajid depth system (color layers + shadows)
4. **Test** in both dark and light modes
5. **Document** any deviations from standard patterns

---

_Design system methodology inspired by [Sajid (@whosajid)](https://www.youtube.com/@whosajid) — practical UI design focusing on depth, hierarchy, and the "good tier" sweet spot._
