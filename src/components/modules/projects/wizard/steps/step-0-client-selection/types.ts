/**
 * Types and Constants for Step 0: Client Selection
 */

import { LucideIcon, Users, UserPlus, FolderOpen } from "lucide-react";
import type { ClientSelectionMode } from "../../types";

export interface SelectionOption {
    id: ClientSelectionMode;
    icon: LucideIcon;
    title: string;
    description: string;
}

export const SELECTION_OPTIONS: SelectionOption[] = [
    {
        id: "existing",
        icon: Users,
        title: "Select Existing",
        description: "Browse your client list",
    },
    {
        id: "new",
        icon: UserPlus,
        title: "Create New Client",
        description: "Add a new client now",
    },
    {
        id: "none",
        icon: FolderOpen,
        title: "No Client",
        description: "Create without association",
    },
];
