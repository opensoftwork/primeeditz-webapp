import {
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  FolderTree,
  HardDrive,
  LayoutDashboard,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Studio Navigation - Simple, focused on their projects
export const studioNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Projects",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: FileText,
  },
];

// Employee Navigation - Task and work focused
export const employeeNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assigned Work",
    url: "/assigned-work",
    icon: ClipboardList,
  },
];

// Admin Navigation - Structured into logical groups
export const adminNavGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "All Projects",
        url: "/projects",
        icon: FolderKanban,
      },
      {
        title: "Quotations",
        url: "/quotations",
        icon: FileText,
      },
    ],
  },
  {
    label: "Relationships",
    items: [
      {
        title: "Studios",
        url: "/clients",
        icon: Users,
      },
      {
        title: "Employees",
        url: "/employees",
        icon: Briefcase,
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        title: "General Settings",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Project Types",
        url: "/settings/project-types",
        icon: LayoutGrid,
      },
      {
        title: "Quotation Sections",
        url: "/settings/quotation-sections",
        icon: LayoutGrid,
      },
      {
        title: "Quotation Templates",
        url: "/settings/quotation-templates",
        icon: ClipboardCheck,
      },
      {
        title: "Storage Tiers",
        url: "/settings/storage-tiers",
        icon: HardDrive,
      },
      {
        title: "Folder Templates",
        url: "/settings/folder-templates",
        icon: FolderTree,
      },
    ],
  },
];

// Common items for all roles (now treated as a default group)
export const commonNavGroup: NavGroup = {
  label: "System",
  items: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

// Get navigation items based on role
export function getNavItemsForRole(
  role: "admin" | "employee" | "studio" | null,
): NavItem[] | NavGroup[] {
  switch (role) {
    case "admin":
      return adminNavGroups;
    case "employee":
      return employeeNavItems;
    case "studio":
      return studioNavItems;
    default:
      return [];
  }
}
