# INSTRUCTIONS FOR AGENT: Generic Data Table Implementation

> **CRITICAL CONTEXT FOR AI AGENT:** 
> The user has provided you with the `/src/components/shared/data-table` reference files. **DO NOT copy these files out of the box.** 
> The provided files represent a highly customized, premium-styled implementation of a data table meant for a specific project. 
> It is an *architectural upgrade* compared to standard `shadcn/ui` and TanStack Table. 
> Your task is to extract the **architectural patterns** and **upgraded features** from these files to build a **generic, reusable vanilla codebase** that can be dropped into any standard project.
> 
> **⚠️ CRITICAL DESIGN INSTRUCTION:** DO NOT take or copy the CSS/Tailwind classes as they are shown in the reference data-table. The reference uses a heavily customized, dark-glassmorphism aesthetic (`bg-white/5`, `border-white/10`, `text-white/40`) which will break a generic application. You must completely strip these out and rely solely on standard, semantic `shadcn/ui` and Tailwind default tokens (e.g., `bg-background`, `text-muted-foreground`, `border-border`).

## The Goal
Recreate the Data Table module in a generic, standard way while maintaining the 4 core upgrades from the reference implementation:
1. **Dual Render Modes (Card Grid vs Table)**
2. **Hybrid Pagination (Server-side Cursor vs Client-side)**
3. **Unified Faceted Toolbar**
4. **Resilient Row Actions**

---

## Breakdown & Implementation Strategy

### 1. Dual Mode Rendering (Table vs. Card View)
The reference implementation (`data-table.tsx`) supports switching seamlessly between a standard HTML table and a responsive grid of cards.
- **What to extract:** The `viewMode` state toggle logic. Notice how it accepts a `renderCard?: (row: TData) => React.ReactNode` prop.
- **How to genericize:** Implement a straightforward layout toggle. 
  - In `Table` mode: Map through `table.getRowModel().rows` to render a standard `<TableRow>`. 
  - In `Card` mode: Map through the same rows but simply return `renderCard(row.original)` wrapped inside a generic CSS grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).
  - *Instruction:* Drop the complex localized `motion/react` layout transitions and custom skeleton abstractions from the reference unless specifically requested.

### 2. Hybrid Pagination (Server vs. Client)
The reference (`data-table-pagination.tsx`) intelligently switches between managing internal TanStack state and relying on external server cursors.
- **What to extract:** The conditional logic intercepting the pagination controls. If a `serverPagination` prop is passed, the UI buttons map to server-specific `.loadNext()` and `.loadPrev()` methods. If not, it defaults to standard `table.nextPage()`.
- **How to genericize:** Build the pagination component to securely check `.getCanNextPage()` or the external `hasNextPage` boolean. 
  - *Instruction:* Remove the hardcoded teleportation (`createPortal` to `#layout-sticky-footer`) found in the reference. Keep the pagination strictly localized rendering immediately beneath the table structure.

### 3. Unified Toolbar & Faceted Filters
The reference (`data-table-toolbar.tsx` and `data-table-faceted-filter.tsx`) uses local React state alongside TanStack's filter state to provide performant, instant-feedback search bars and popover badges.
- **What to extract:** The synchronization approach in `data-table-faceted-filter.tsx` (using a local `Set` synced with `column.getFilterValue()`) and the unified visual toolbar layout.
- **How to genericize:** Build standard Shadcn `Command` menu filter drop-downs.
  - *Instruction:* Strip out the deep glassmorphism CSS (`bg-white/5`, `border-white/10`, `text-white/40`) entirely. Replace them with standard minimal Tailwind UI variables (`bg-background`, `border-border`, `text-muted-foreground`, `ring-offset-background`).

### 4. Interactive Row Operations
The reference handles row clicking separately from action dropdown menus (`data-table-row-actions.tsx`).
- **What to extract:** The crucial `e.stopPropagation()` guard on the action menu trigger and items.
- **How to genericize:** When wiring the generic `.map` for row rendering, ensure `onClick={onRowClick}` works but does NOT fire if the user is interacting with standard target tags (e.g., buttons, `a` tags, dropdown contents) inside the table cells.

---

## Step-by-Step Action Plan for the Agent

1. **Scaffold the core `DataTable` wrapper:** Implement standard `useReactTable` with state blocks for `sorting`, `columnVisibility`, `columnFilters`, and `pagination`. Add the custom `viewMode` state toggle. Ensure `manualPagination` correctly reflects whether `serverPagination` was provided.
2. **Implement Sub-components incrementally:** 
   - Build a cleanly-styled `DataTableToolbar`.
   - Build `DataTablePagination` with the hybrid conditional logic.
   - Build `DataTableViewOptions` for toggling columns.
   - Build `DataTableFacetedFilter` utilizing standard shadcn Popover/Command combinations.
3. **Wire together in `data-table.tsx`:** Combine the search bars, visual toggle buttons, table wrapper, empty state UI, and pagination block into a logical, generic component hierarchy.
4. **Styling Standard Enforcement:** Avoid aggressive hover backgrounds and transparency hacks. Stick to standard shadcn tokens (`border shadow-sm rounded-md overflow-hidden`).
