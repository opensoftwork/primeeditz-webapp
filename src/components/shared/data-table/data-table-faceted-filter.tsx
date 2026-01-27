/**
 * DataTable Faceted Filter
 *
 * Multi-select filter popover with search and badge preview.
 * Supports faceted counts when available from TanStack Table.
 */

"use client";

import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const rawFilterValue = column?.getFilterValue();

  // Use local state for immediate visual feedback
  const [localSelectedValues, setLocalSelectedValues] = React.useState<
    Set<string>
  >(new Set());

  // Sync local state with TanStack state
  React.useEffect(() => {
    const normalizedValue = (() => {
      if (Array.isArray(rawFilterValue)) {
        return rawFilterValue;
      }
      if (
        typeof rawFilterValue === "string" ||
        typeof rawFilterValue === "boolean"
      ) {
        return [rawFilterValue.toString()];
      }
      return undefined;
    })();
    setLocalSelectedValues(new Set(normalizedValue || []));
  }, [rawFilterValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 border-white/10 border-dashed bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white gap-2 rounded-xl"
        >
          <PlusCircle className="h-4 w-4" />
          {title}
          {localSelectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-md px-1.5 font-normal lg:hidden bg-primary/20 text-primary border-0"
              >
                {localSelectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {localSelectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-md px-1.5 font-normal bg-primary/20 text-primary border-0"
                  >
                    {localSelectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => localSelectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-md px-1.5 font-normal bg-primary/20 text-primary border-0"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0 bg-zinc-950 border-white/10"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder={title}
            className="h-10 text-xs border-white/5"
          />
          <CommandList>
            <CommandEmpty className="text-[10px] font-bold uppercase tracking-widest text-white/30 py-6 text-center">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = localSelectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newSelectedValues = new Set(localSelectedValues);

                      if (isSelected) {
                        newSelectedValues.delete(option.value);
                      } else {
                        newSelectedValues.add(option.value);
                      }

                      setLocalSelectedValues(newSelectedValues);

                      const newFilterValue = Array.from(newSelectedValues);
                      column?.setFilterValue(
                        newFilterValue.length ? newFilterValue : undefined,
                      );
                    }}
                    className="text-xs focus:bg-white/10"
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border mr-2",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-white/20 [&_svg]:invisible",
                      )}
                    >
                      <Check className="text-primary-foreground size-3.5" />
                    </div>
                    {option.icon && (
                      <option.icon className="text-white/40 size-4 mr-2" />
                    )}
                    <span className="font-semibold">{option.label}</span>
                    {facets?.get(option.value) !== undefined && (
                      <span className="text-white/30 ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {localSelectedValues.size > 0 && (
              <>
                <CommandSeparator className="bg-white/5" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setLocalSelectedValues(new Set());
                      column?.setFilterValue(undefined);
                    }}
                    className="justify-center text-center text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white focus:bg-white/10"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
