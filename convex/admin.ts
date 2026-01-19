/**
 * Admin API Entry Point
 * 
 * This file re-exports admin-related functions from modular files
 * in seeds/admin/ to maintain backwards compatibility while organizing the codebase.
 */

export * from "./seeds/admin/dashboard";
export * from "./seeds/admin/projects";
export * from "./seeds/admin/projectTypes";
export * from "./seeds/admin/clients";
export * from "./seeds/admin/quotations";
export * from "./seeds/admin/maintenance";
