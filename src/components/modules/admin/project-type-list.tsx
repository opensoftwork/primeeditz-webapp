"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Plus, Edit2, Settings2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export function ProjectTypeList() {
  const projectTypes = useQuery(api.admin.getProjectTypes);
  const createProjectType = useMutation(api.admin.createProjectType);
  const updateProjectType = useMutation(api.admin.updateProjectType);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("");

  const handleCreate = async () => {
    if (!newTypeName || !newTypeCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createProjectType({
        name: newTypeName,
        category: newTypeCategory,
        isActive: true,
      });
      toast.success("Project type created");
      setIsCreateOpen(false);
      setNewTypeName("");
      setNewTypeCategory("");
    } catch (error) {
      toast.error("Failed to create project type");
    }
  };

  const toggleStatus = async (id: any, currentStatus: boolean) => {
    try {
      await updateProjectType({
        id,
        isActive: !currentStatus,
      });
      toast.success(`Project type ${!currentStatus ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (projectTypes === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Types</h1>
          <p className="text-muted-foreground">
            Manage the categories and dynamic fields for all client projects.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project Type</DialogTitle>
              <DialogDescription>
                Add a new category like "Wedding Album" or "Corporate Video".
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g. Wedding Album"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g. Photography"
                  value={newTypeCategory}
                  onChange={(e) => setNewTypeCategory(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No project types found.
                  </TableCell>
                </TableRow>
              ) : (
                projectTypes.map((type) => (
                  <TableRow key={type._id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={type.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(type._id, type.isActive)}
                      >
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/settings/project-types/${type._id}`}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          Manage Fields
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
