"use client";

import { useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HeatBar } from "./heat-bar";
import type { EmployeeWithWorkload } from "./columns";

interface AddEmployeeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeWithWorkload[];
  /** IDs of employees already on the team */
  existingMemberIds: string[];
  onAddEmployee: (employee: EmployeeWithWorkload) => void;
}

export function AddEmployeeDrawer({
  open,
  onOpenChange,
  employees,
  existingMemberIds,
  onAddEmployee,
}: AddEmployeeDrawerProps) {
  const [search, setSearch] = useState("");

  // Filter out already assigned employees and apply search
  const availableEmployees = employees.filter((emp) => {
    const isAlreadyAssigned = existingMemberIds.includes(emp._id);
    const matchesSearch =
      !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.designation || "").toLowerCase().includes(search.toLowerCase());
    return !isAlreadyAssigned && matchesSearch;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950 border-white/5 w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-xl font-black uppercase tracking-tight text-white">
            Add Employee
          </SheetTitle>
          <SheetDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Select a professional to add to the project team
          </SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search professionals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11 text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {availableEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/5 mb-4">
                <Check className="h-6 w-6 text-white/20" />
              </div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                {search
                  ? "No matching employees found"
                  : "All employees are already assigned"}
              </p>
            </div>
          ) : (
            availableEmployees.map((employee) => (
              <button
                key={employee._id}
                onClick={() => {
                  onAddEmployee(employee);
                  // Don't close drawer—let admin add multiple
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group cursor-pointer"
              >
                <Avatar className="h-11 w-11 border border-white/5 bg-zinc-900 group-hover:border-primary/30 transition-colors">
                  <AvatarImage src={employee.image} />
                  <AvatarFallback className="bg-white/5 text-[10px] font-black text-white/40">
                    {employee.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                    {employee.name}
                  </p>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                    {employee.designation || "Creative Staff"}
                  </p>
                  <p className="text-[10px] font-medium text-white/20 lowercase mt-0.5">
                    {employee.email}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <HeatBar
                    current={employee.activeProjects}
                    max={employee.maxCapacity}
                    className="w-24"
                  />
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
