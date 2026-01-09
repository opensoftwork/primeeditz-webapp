"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  GripVertical,
  Save,
  Type,
  Hash,
  ListOrdered,
  CheckSquare,
  AlignLeft,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";

const FIELD_TYPES = [
  { value: "text", label: "Text Input", icon: Type },
  { value: "number", label: "Number Input", icon: Hash },
  { value: "select", label: "Dropdown", icon: ListOrdered },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "textarea", label: "Text Area", icon: AlignLeft },
];

export function ProjectTypeFieldsManager() {
  const params = useParams();
  const id = params.id as Id<"projectTypes">;

  const fields = useQuery(api.admin.getProjectTypeFields, {
    projectTypeId: id,
  });
  const upsertField = useMutation(api.admin.upsertProjectTypeField);
  const deleteField = useMutation(api.admin.deleteProjectTypeField);

  const [isAdding, setIsAdding] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Field Form State
  const [formState, setFormState] = useState({
    name: "",
    label: "",
    type: "text" as any,
    required: false,
    placeholder: "",
    description: "",
    options: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormState({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      description: "",
      options: "",
      isActive: true,
    });
    setEditingFieldId(null);
    setIsAdding(false);
  };

  const startEdit = (field: any) => {
    setFormState({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || "",
      description: field.description || "",
      options: field.options || "",
      isActive: field.isActive,
    });
    setEditingFieldId(field._id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formState.name || !formState.label) {
      toast.error("Name and Label are required");
      return;
    }

    try {
      await upsertField({
        id: editingFieldId
          ? (editingFieldId as Id<"projectTypeFields">)
          : undefined,
        projectTypeId: id,
        ...formState,
        displayOrder: fields
          ? editingFieldId
            ? fields.find((f) => f._id === editingFieldId)?.displayOrder || 0
            : fields.length
          : 0,
      });
      toast.success(editingFieldId ? "Field updated" : "Field added");
      resetForm();
    } catch (error) {
      toast.error("Failed to save field");
    }
  };

  const handleDelete = async (fieldId: Id<"projectTypeFields">) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    try {
      await deleteField({ id: fieldId });
      toast.success("Field deleted");
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  if (fields === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/project-types">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Fields</h1>
          <p className="text-muted-foreground">
            Configure Step 2 of the project wizard for this project type.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fields List */}
        <Card className="md:order-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configured Fields</CardTitle>
              <CardDescription>Drag to reorder (Coming soon)</CardDescription>
            </div>
            {!isAdding && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                No fields defined. Start by adding one.
              </div>
            ) : (
              fields.map((field) => (
                <div
                  key={field._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.required && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Required
                        </Badge>
                      )}
                      {!field.isActive && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {field.type} • Key: {field.name}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(field)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(field._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Editor Form */}
        {isAdding && (
          <Card className="md:order-2">
            <CardHeader>
              <CardTitle>
                {editingFieldId ? "Edit Field" : "New Field"}
              </CardTitle>
              <CardDescription>
                Define how this data should be collected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Field Key (Internal Name)</Label>
                  <Input
                    placeholder="e.g. album_count"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Unique identifier used in database.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Display Label</Label>
                  <Input
                    placeholder="e.g. Number of Albums"
                    value={formState.label}
                    onChange={(e) =>
                      setFormState({ ...formState, label: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(v: any) =>
                    setFormState({ ...formState, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formState.type === "select" && (
                <div className="space-y-2">
                  <Label>Options (JSON Format)</Label>
                  <Textarea
                    placeholder='[{"label": "10 Pages", "value": "10"}, {"label": "20 Pages", "value": "20"}]'
                    value={formState.options}
                    onChange={(e) =>
                      setFormState({ ...formState, options: e.target.value })
                    }
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Provide an array of objects with label and value.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label
                    className="flex flex-col gap-1 cursor-pointer"
                    htmlFor="required-toggle"
                  >
                    <span>Required Field</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Client must fill this out.
                    </span>
                  </Label>
                  <Switch
                    id="required-toggle"
                    checked={formState.required}
                    onCheckedChange={(v: boolean) =>
                      setFormState({ ...formState, required: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    className="flex flex-col gap-1 cursor-pointer"
                    htmlFor="active-toggle"
                  >
                    <span>Active Field</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Visible to the client.
                    </span>
                  </Label>
                  <Switch
                    id="active-toggle"
                    checked={formState.isActive}
                    onCheckedChange={(v: boolean) =>
                      setFormState({ ...formState, isActive: v })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description / Help Text (Optional)</Label>
                <Input
                  placeholder="e.g. Please specify if you need extra gloss finish."
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSave}>
                  {editingFieldId ? "Update Field" : "Create Field"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
