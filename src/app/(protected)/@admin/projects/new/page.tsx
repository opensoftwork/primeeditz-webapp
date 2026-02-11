/**
 * Admin New Project Wizard Page
 *
 * Route: /projects/new
 * 6-step wizard for admin-initiated project creation with client selection.
 */

"use client";

import { ProjectWizard } from "@/components/modules/projects";

export default function AdminNewProjectPage() {
  return <ProjectWizard mode="admin" />;
}
