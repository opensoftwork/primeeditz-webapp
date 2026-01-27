"use client";

import { ProjectTypeCard } from "./project-type-card";

interface ProjectType {
  _id: string;
  name: string;
  categoryName: string;
  isActive: boolean;
  fieldCount?: number;
}

interface ListContentProps {
  projectTypes: ProjectType[];
  onEdit: (type: any) => void;
  onToggleStatus: (id: string, current: boolean) => void;
  onDeleteRequest: (id: string, name: string) => void;
}

export function ListContent({
  projectTypes,
  onEdit,
  onToggleStatus,
  onDeleteRequest,
}: ListContentProps) {
  const categorizedTypes = projectTypes.reduce(
    (acc, type) => {
      const cat = type.categoryName || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(type);
      return acc;
    },
    {} as Record<string, ProjectType[]>,
  );

  return (
    <div className="space-y-12">
      {Object.entries(categorizedTypes).map(([category, types]) => (
        <div key={category} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">
              {category} / {types.length}{" "}
              {types.length === 1 ? "Type" : "Types"}
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {types.map((type) => (
              <ProjectTypeCard
                key={type._id}
                type={type}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDeleteRequest}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
