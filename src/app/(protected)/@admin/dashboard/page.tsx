"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Settings,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const dashboardStats = useQuery(api.admin.getAdminDashboardStats);
  const pendingProjects = useQuery(api.admin.getPendingProjects);

  // Loading state
  if (!dashboardStats || !pendingProjects) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pending Requests */}
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.pendingRequestsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review and quotation
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.activeProjectsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress or active
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalEmployeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Employees and admins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/projects?status=pending_review">
                <AlertCircle className="mr-2 h-4 w-4" />
                View Pending Requests
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              asChild
              disabled
            >
              <Link href="/settings/project-types">
                <Settings className="mr-2 h-4 w-4" />
                Manage Project Types
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              asChild
              disabled
            >
              <Link href="/settings/employees">
                <UserCog className="mr-2 h-4 w-4" />
                Manage Employees
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Note: These features will be available in upcoming stories
          </p>
        </CardContent>
      </Card>

      {/* Pending Requests List */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Recent Pending Requests</CardTitle>
          <CardDescription>
            Projects awaiting review and quotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProjects.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No pending requests at the moment
              </h3>
              <p className="text-sm text-muted-foreground">
                All caught up! Check back later for new project requests.
              </p>
            </div>
          ) : (
            // Pending projects table
            <div className="space-y-3">
              {pendingProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">
                        {project.code}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project.projectTypeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Client: {project.clientName}</span>
                      {project.eventName && (
                        <span>Event: {project.eventName}</span>
                      )}
                      {project.eventDate && (
                        <span>
                          Date:{" "}
                          {new Date(project.eventDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted{" "}
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild disabled>
                    <Link href={`/projects/${project._id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
