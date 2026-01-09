import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Briefcase,
  FileText,
  Settings,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

// Client Navigation - Simple, focused on their projects
export const clientNavItems: NavItem[] = [
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
    url: "/work",
    icon: ClipboardList,
  },
];

// Admin Navigation - Full access to all features
export const adminNavItems: NavItem[] = [
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
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Briefcase,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: FileText,
  },
  {
    title: "Project Types",
    url: "/settings/project-types",
    icon: Settings,
  },
];

// Common items for all roles
export const commonNavItems: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

// Get navigation items based on role
export function getNavItemsForRole(role: "admin" | "employee" | "client" | null): NavItem[] {
  switch (role) {
    case "admin":
      return adminNavItems;
    case "employee":
      return employeeNavItems;
    case "client":
      return clientNavItems;
    default:
      return [];
  }
}
