# Dynamic Icon Rendering System

This project uses a dynamic icon rendering system based on **Lucide React**.

## Core Concepts

1. **Storage**: Icons are stored in the database as **PascalCase strings** (e.g., `"Camera"`, `"Video"`, `"Boxes"`). This corresponds directly to the named exports in the `lucide-react` library.
2. **Dynamic Resolution**: At runtime, these strings are mapped to the actual Lucide React component using the `DynamicIcon` utility.

## Components

### 1. `DynamicIcon`

Located at: `@/components/ui/dynamic-icon.tsx`

This component safely resolves a string to an icon component. It handles normalization (e.g., lowercase names from legacy data) and provides a fallback mechanism.

**Usage:**

```tsx
import { DynamicIcon } from "@/components/ui/dynamic-icon";

// Standard usage
<DynamicIcon name="Camera" className="h-5 w-5" />

// With fallback
<DynamicIcon name={data.icon} fallback="Boxes" />
```

### 2. `IconPicker`

Located at: `@/components/ui/icon-picker.tsx`

A premium, drawer-based selection interface that allows users to search the entire Lucide library (~1500+ icons).

**Usage:**

```tsx
import { IconPicker } from "@/components/ui/icon-picker";

<IconPicker
  value={field.state.value}
  onChange={(iconName) => field.handleChange(iconName)}
/>;
```

## How it works (Technical Architecture)

### Backend Storage

When a user selects an icon in the `IconPicker`, the component receives the key name from the Lucide `icons` object.

- **Database Entry**: `{ icon: "Camera" }`

### Frontend Rendering

The `DynamicIcon` component performs the following logic:

1. Imports the `icons` object from `lucide-react`.
2. Accesses the icon component: `const Icon = icons["Camera"]`.
3. Renders `<Icon />` with any passed props.

### Performance Considerations

- **Bundle Size**: `lucide-react` uses tree-shaking by default. However, when we import the `icons` object (as done in the picker and dynamic icon), we are effectively disabling tree-shaking for all icons. This is necessary for a dynamic system but adds to the initial JS bundle.
- **Optimization**: The `DynamicIcon` is memoized to prevent unnecessary re-renders.

## Adding New Icons

Since it uses the full Lucide library, any icon listed on [lucide.dev](https://lucide.dev) is automatically available by its name.
