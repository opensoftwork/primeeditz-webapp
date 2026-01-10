/**
 * Data Table Module
 *
 * Shared TanStack Table components for premium data display.
 * Supports server-side pagination, filtering, sorting, and dual views.
 */

// Core table component
export { DataTable, DataTableSkeleton } from "./data-table";

// Table sub-components
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTableFacetedFilter } from "./data-table-faceted-filter";
export { DataTablePagination } from "./data-table-pagination";
export {
  DataTableRowActions,
  type RowAction,
} from "./data-table-row-actions";
export { DataTableToolbar } from "./data-table-toolbar";
export { DataTableViewOptions } from "./data-table-view-options";
