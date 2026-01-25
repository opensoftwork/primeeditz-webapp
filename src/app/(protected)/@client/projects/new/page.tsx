/**
 * New Project Wizard Page
 *
 * Route: /client/projects/new
 * 5-step wizard for creating a new project request.
 */

"use client";

import QuoteRequestWizard from "@/components/modules/client/quotations/request-flow";

export default function NewProjectPage() {
  return <QuoteRequestWizard />;
}
