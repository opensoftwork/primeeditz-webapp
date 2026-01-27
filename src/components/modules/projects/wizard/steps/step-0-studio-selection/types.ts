/**
 * Types and Constants for Step 0: Studio Selection
 */

import { LucideIcon, Users, UserPlus, FolderOpen } from "lucide-react";
import type { StudioSelectionMode } from "../../types";

export interface SelectionOption {
    id: StudioSelectionMode;
    icon: LucideIcon;
    title: string;
    description: string;
}

export const SELECTION_OPTIONS: SelectionOption[] = [
    {
        id: "existing",
        icon: Users,
        title: "Select Existing",
        description: "Browse your studio list",
    },
    {
        id: "new",
        icon: UserPlus,
        title: "Create New Studio",
        description: "Add a new studio now",
    },
    {
        id: "none",
        icon: FolderOpen,
        title: "No Studio",
        description: "Create without association",
    },
];
