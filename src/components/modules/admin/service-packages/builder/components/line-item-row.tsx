"use client";

import type { Doc } from "@convex/_generated/dataModel";
import { GripVertical, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SectionQuickCreate } from "./section-quick-create";

interface LineItemRowProps {
  form: any;
  index: number;
  sections: Doc<"quotationSections">[];
  onRemove: () => void;
  canRemove: boolean;
}

export function LineItemRow({
  form,
  index,
  sections,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  return (
    <div className="group flex items-start gap-4 p-4 hover:bg-white/2 transition-all">
      <div className="pt-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-white/20" />
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4">
        {/* Description */}
        <div className="col-span-12 md:col-span-4">
          <form.Field
            name={`lineItems[${index}].description`}
            children={(field: any) => (
              <div className="space-y-1">
                <Input
                  placeholder="Service description..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-lg text-sm transition-all"
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <p className="text-[9px] text-red-400 font-black uppercase tracking-widest ml-1">
                      {field.state.meta.errors[0]?.toString()}
                    </p>
                  )}
              </div>
            )}
          />
        </div>

        {/* Section */}
        <div className="col-span-6 md:col-span-2">
          <form.Field
            name={`lineItems[${index}].sectionId`}
            children={(field: any) => (
              <Select
                value={field.state.value || ""}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="bg-white/5 border-white/5 focus:ring-primary/20 h-10 rounded-lg text-sm transition-all">
                  <SelectValue placeholder="Phase..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                  {sections.map((section) => (
                    <SelectItem
                      key={section._id}
                      value={section._id}
                      className="focus:bg-primary/20 focus:text-primary rounded-lg mx-1 my-0.5"
                    >
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="mt-1.5 flex justify-end">
            <SectionQuickCreate
              onCreated={(id) =>
                form.setFieldValue(`lineItems[${index}].sectionId`, id)
              }
            />
          </div>
        </div>

        {/* Unit */}
        <div className="col-span-6 md:col-span-2">
          <form.Field name={`lineItems[${index}].unit`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <Input
                  placeholder="Unit (e.g. per project)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={hasError}
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-lg text-sm transition-all"
                />
              );
            }}
          </form.Field>
        </div>

        {/* Rate */}
        <div className="col-span-6 md:col-span-2">
          <form.Field name={`lineItems[${index}].rate`}>
            {(field: any) => {
              const hasError =
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched;
              return (
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Rate"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={hasError}
                    className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-lg text-sm transition-all pl-7"
                  />
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
                </div>
              );
            }}
          </form.Field>
        </div>

        {/* Quantity */}
        <div className="col-span-6 md:col-span-2">
          <form.Field
            name={`lineItems[${index}].quantity`}
            children={(field: any) => (
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-10 rounded-lg text-sm transition-all"
                />

                <div className="flex flex-col items-end min-w-[60px]">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                    Amount
                  </p>
                  <form.Subscribe
                    selector={(state: any) => {
                      const item = state.values.lineItems[index];
                      return (item?.rate || 0) * (item?.quantity || 1);
                    }}
                    children={(amount: number) => (
                      <p className="text-xs font-black text-white">
                        ₹{amount.toLocaleString()}
                      </p>
                    )}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div className="pt-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-8 w-8 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
