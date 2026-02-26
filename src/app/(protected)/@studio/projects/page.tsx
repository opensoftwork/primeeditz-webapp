import { GroupedStudioProjectList } from "@/components/modules/projects/project-details/grouped-studio-project-list";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <GroupedStudioProjectList />
    </div>
  );
}
