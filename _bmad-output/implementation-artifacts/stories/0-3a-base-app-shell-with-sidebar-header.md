# Story 0.3a: Base App Shell with Sidebar & Header (Next.js 16)

Status: ready-for-dev

## Story

As a **User**,
I want a responsive application shell with a sidebar and header in Next.js 16,
so that I can navigate the platform consistently across mobile and desktop.

## Acceptance Criteria

1. **AC-1:** Root layout in `app/layout.tsx` includes global providers and dark mode styling.
2. **AC-2:** Persistent Sidebar component using shadcn/ui Sidebar, collapsible on mobile.
3. **AC-3:** Header component includes sidebar trigger and user context placeholder.
4. **AC-4:** Navigation items use `next/link` for routing.
5. **AC-5:** Mobile drawer behavior implemented using shadcn/ui Sheet.

## Tasks / Subtasks

- [ ] **Task 1: Next.js Layout Structure** (AC: #1)

  - [ ] Implement `src/app/layout.tsx` with font initialization and globals.css
  - [ ] Add `ConvexClientProvider` to root layout
  - [ ] Apply `dark` class for default dark mode theming

- [ ] **Task 2: Sidebar Migration** (AC: #2, #4)

  - [ ] Migrate `src/components/layout/app-sidebar.tsx`
  - [ ] Replace TanStack Router `Link` and `useNavigate` with `next/link` and `usePathname`
  - [ ] Implement `SidebarProvider` in the layout

- [ ] **Task 3: Header Implementation** (AC: #3, #5)

  - [ ] Migrate `src/components/layout/header.tsx`
  - [ ] Add `SidebarTrigger` for mobile responsiveness
  - [ ] Ensure layout is responsive via `SidebarInset`

- [ ] **Task 4: Component Integration**
  - [ ] Create `src/components/layout/app-layout.tsx` as a reusable shell
  - [ ] verify responsive breakpoints (mobile vs desktop)

## Dev Notes

### Next.js 16 Layout Pattern

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
```

The sidebar state is managed by `SidebarProvider` from shadcn/ui. Navigation must use `next/link` to avoid full page reloads.

### Portable from TanStack Project

- All shadcn/ui components (`sidebar.tsx`, `button.tsx`, etc.) are 100% portable.
- Tailwind v4 styles in `globals.css` are 100% portable.

## Dependencies

- **Story 0.1** (Infrastructure)

## Definition of Done

- [ ] App shell renders correctly in localhost:3000.
- [ ] Sidebar collapses on toggle.
- [ ] Navigation works between placeholder routes.
