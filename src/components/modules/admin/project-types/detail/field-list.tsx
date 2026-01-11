"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Edit2,
  Trash2,
  RefreshCcw,
  Check,
  X,
  Asterisk,
  Type,
  Hash,
  ListOrdered,
  CheckSquare,
  AlignLeft,
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Field {
  _id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  isActive: boolean;
  displayOrder: number;
  options?: string;
}

interface FieldListProps {
  fields: Field[];
  onEdit: (field: Field) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: boolean) => void;
  onReorder: (fields: Field[]) => void;
}

const TYPE_ICONS: Record<string, any> = {
  text: Type,
  number: Hash,
  select: ListOrdered,
  checkbox: CheckSquare,
  textarea: AlignLeft,
};

export function FieldList({
  fields,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
}: FieldListProps) {
  return (
    <div className="space-y-4">
      <Reorder.Group
        axis="y"
        values={fields}
        onReorder={onReorder}
        className="space-y-3"
      >
        {fields.map((field) => {
          const Icon = TYPE_ICONS[field.type] || Type;
          return (
            <Reorder.Item
              key={field._id}
              value={field}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileDrag={{
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
              }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                field.isActive
                  ? "bg-white/5 border-white/5 hover:bg-white/10"
                  : "bg-white/2 border-white/5 opacity-60 grayscale-[0.5]"
              )}
            >
              {!field.isActive && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-zinc-900 border-l border-b border-white/5 rounded-bl-xl">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                    Deactivated
                  </span>
                </div>
              )}

              <div className="cursor-grab active:cursor-grabbing p-1 text-white/20 group-hover:text-white/40 transition-colors">
                <GripVertical className="h-5 w-5" />
              </div>

              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  field.isActive ? "bg-white/5" : "bg-white/1"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    field.isActive ? "text-white/60" : "text-white/20"
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4
                    className={cn(
                      "font-bold truncate",
                      field.isActive ? "text-white" : "text-white/40"
                    )}
                  >
                    {field.label}
                  </h4>
                  {field.required && (
                    <div
                      className={cn(
                        field.isActive ? "text-primary" : "text-primary/30"
                      )}
                      title="Required Field"
                    >
                      <Asterisk className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white/40 font-mono border border-white/5">
                    {field.name}
                  </code>
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-none pt-0.5">
                    {field.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {field.isActive ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(field)}
                      className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10"
                      title="Edit Field"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(field._id, field.isActive)}
                      className="h-9 w-9 text-white/20 hover:text-red-500 hover:bg-red-500/10"
                      title="Deactivate Field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(field._id, field.isActive)}
                      className="h-9 w-9 text-white/20 hover:text-primary hover:bg-primary/10"
                      title="Reactivate Field"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(field._id)}
                      className="h-9 w-9 text-white/10 hover:text-red-600 hover:bg-red-600/10"
                      title="Delete Permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {fields.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2 backdrop-blur-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mb-4">
            <ListOrdered className="h-6 w-6 text-white/10" />
          </div>
          <p className="text-white/40 font-medium tracking-tight">
            No fields configured yet
          </p>
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
            Add your first field to start customizing the wizard
          </p>
        </div>
      )}
    </div>
  );
}
