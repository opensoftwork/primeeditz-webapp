"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ProjectConfig } from "../builder-context";
import { NestedUnitSelector } from "@/components/ui/nested-unit-selector";

interface LineItemCardProps {
  form: any; // TanStack Form instance - complex generics not worth the overhead
  index: number;
  projectConfigs: ProjectConfig[];
  onRemove: () => void;
  canRemove: boolean;
}

export function LineItemCard({
  form,
  index,
  projectConfigs,
  onRemove,
  canRemove,
}: LineItemCardProps) {
  return (
    <Card className="relative group bg-zinc-900/30 border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/10 shadow-lg shadow-black/20">
      {/* Background effect */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      {/* Remove button */}
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all z-10"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <CardContent className="relative p-5 space-y-4">
        {/* Header Row: Project + Description */}
        <FieldGroup className="grid grid-cols-12 gap-4">
          {/* Project Field */}
          <form.Field name={`lineItems[${index}].projectConfigId`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field
                  className="col-span-12 md:col-span-4"
                  data-invalid={hasError}
                >
                  <FieldLabel
                    htmlFor={`project-${index}`}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2"
                  >
                    Project Configuration
                  </FieldLabel>
                  <Select
                    value={field.state.value || "__general__"}
                    onValueChange={(val) =>
                      field.handleChange(val === "__general__" ? "" : val)
                    }
                  >
                    <SelectTrigger
                      id={`project-${index}`}
                      className="h-10 bg-black/20 border-white/5 rounded-xl text-xs hover:bg-black/40 transition-colors"
                      aria-invalid={hasError}
                    >
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem
                        value="__general__"
                        className="focus:bg-white/5 rounded-lg mx-1 my-0.5 italic text-white/40 text-xs"
                      >
                        General / Shared Item
                      </SelectItem>
                      {projectConfigs.map((config) => (
                        <SelectItem
                          key={config.id}
                          value={config.id}
                          className="focus:bg-primary/20 rounded-lg mx-1 my-0.5 text-xs"
                        >
                          {config.label || "Untitled Config"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Description Field */}
          <form.Field name={`lineItems[${index}].description`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field
                  className="col-span-12 md:col-span-8"
                  data-invalid={hasError}
                >
                  <FieldLabel
                    htmlFor={`description-${index}`}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2"
                  >
                    Description
                  </FieldLabel>
                  <Input
                    id={`description-${index}`}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Briefly describe this service item..."
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-xs placeholder:text-white/10 focus:bg-black/40 transition-colors"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        {/* Details Row: Unit + Rate × Qty = Amount */}
        <FieldGroup className="grid grid-cols-12 gap-4 items-end">
          {/* Unit Field */}
          <form.Field name={`lineItems[${index}].unit`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field
                  className="col-span-12 md:col-span-3"
                  data-invalid={hasError}
                >
                  <FieldLabel
                    htmlFor={`unit-${index}`}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2"
                  >
                    Unit
                  </FieldLabel>
                  <NestedUnitSelector
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    triggerClassName="h-10 w-full"
                    placeholder="e.g. video"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Rate Field */}
          <form.Field name={`lineItems[${index}].rate`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field
                  className="col-span-4 md:col-span-2"
                  data-invalid={hasError}
                >
                  <FieldLabel
                    htmlFor={`rate-${index}`}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2"
                  >
                    Rate (₹)
                  </FieldLabel>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-xs font-black tabular-nums focus:bg-black/40 transition-colors"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Multiplication Symbol */}
          <div className="col-span-1 flex items-center justify-center text-white/20 font-black text-xs pb-3">
            ×
          </div>

          {/* Quantity Field */}
          <form.Field name={`lineItems[${index}].quantity`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Field
                  className="col-span-3 md:col-span-2"
                  data-invalid={hasError}
                >
                  <FieldLabel
                    htmlFor={`quantity-${index}`}
                    className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2"
                  >
                    Qty
                  </FieldLabel>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={hasError}
                    className="h-10 bg-black/20 border-white/5 rounded-xl text-xs font-black tabular-nums focus:bg-black/40 transition-colors"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          {/* Computed Amount (Read-only display) */}
          <div className="col-span-4 md:col-span-4">
            <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">
              Amount
            </FieldLabel>
            <form.Subscribe
              selector={(state: any) => {
                const item = state.values.lineItems[index];
                return (item?.rate || 0) * (item?.quantity || 1);
              }}
            >
              {(amount: number) => (
                <div className="h-10 flex items-center justify-end pr-3 bg-primary/5 rounded-xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]">
                  <span className="text-xs font-black text-white italic">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              )}
            </form.Subscribe>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
