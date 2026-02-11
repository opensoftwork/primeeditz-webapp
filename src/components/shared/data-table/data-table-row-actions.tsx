/**
 * DataTable Row Actions
 *
 * Reusable dropdown menu for row-level actions.
 * Premium styling with icons and keyboard shortcuts support.
 */

"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction<TData> {
  label: string;
  onClick?: (row: TData) => void;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface DataTableRowActionsProps<TData> {
  row: TData;
  actions: RowAction<TData>[];
  label?: string;
}

export function DataTableRowActions<TData>({
  row,
  actions,
  label = "Actions",
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 p-0 data-[state=open]:bg-white/10 hover:bg-white/5 rounded-xl"
        >
          <MoreHorizontal className="h-4 w-4 text-white/40" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] bg-zinc-950 border-white/10"
      >
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-white/30">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <React.Fragment key={`${action.label}-${index}`}>
              {action.separator && index > 0 && (
                <DropdownMenuSeparator className="bg-white/5" />
              )}
              <DropdownMenuItem
                onClick={() => {
                  if (action.onClick) action.onClick(row);
                }}
                asChild={!!action.href}
                className={`text-xs font-semibold focus:bg-white/10 ${
                  action.variant === "destructive"
                    ? "text-red-400 focus:text-red-300"
                    : "text-white/70 focus:text-white"
                }`}
              >
                {action.href ? (
                  <Link href={action.href} className="flex items-center w-full">
                    {Icon && <Icon className="mr-2 h-4 w-4 opacity-60" />}
                    {action.label}
                  </Link>
                ) : (
                  <>
                    {Icon && <Icon className="mr-2 h-4 w-4 opacity-60" />}
                    {action.label}
                  </>
                )}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
