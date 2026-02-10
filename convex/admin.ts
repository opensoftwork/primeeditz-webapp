/**
 * Admin API Entry Point
 *
 * This file re-exports admin-related functions from modular files
 * in seeds/admin/ to maintain backwards compatibility while organizing the codebase.
 */

export * from "./functions/admin/dashboard";
export * from "./functions/admin/employees";
export * from "./functions/admin/maintenance";
export * from "./functions/admin/projects";
export * from "./functions/admin/projectTypes";
export * from "./functions/admin/quotations";
export * from "./functions/admin/squads";
export * from "./functions/admin/studios";
export * from "./functions/admin/wipeData";
export * from "./functions/admin/clearAllData";
// export * from "./functions/admin/seed";
