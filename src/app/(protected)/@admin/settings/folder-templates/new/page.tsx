import { redirect } from "next/navigation";

// DEPRECATED: Folder templates are now accessed through Project Types
// New templates should be created via /settings/project-types/{id}/folder-templates/new
export default function DeprecatedNewFolderTemplatePage() {
  redirect("/settings/project-types");
}
