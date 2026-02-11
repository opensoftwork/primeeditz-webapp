import { redirect } from "next/navigation";

// DEPRECATED: Folder templates are now accessed through Project Types
// Edit templates via /settings/project-types/{id}/folder-templates/{templateId}
export default function DeprecatedEditFolderTemplatePage() {
  redirect("/settings/project-types");
}
