import { redirect } from "next/navigation";

// DEPRECATED: Folder templates are now accessed through Project Types
// This redirect preserves bookmarks and existing links
export default function DeprecatedFolderTemplatesPage() {
  redirect("/settings/project-types");
}
