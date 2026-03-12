"use client";

import { useState } from "react";
import { Search, Plus, Check, Users } from "lucide-react";
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
      <SheetContent
        side="right"
        className="bg-zinc-950/95 border-l border-white/10 w-full sm:max-w-3xl p-0 flex flex-col backdrop-blur-3xl ring-1 ring-white/10"
      >
        <div className="absolute top-20 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />

        <SheetHeader className="text-left px-8 pt-12 pb-8 border-b border-white/5 space-y-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                Add Professionals
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-2">
                Expand the project squad
              </SheetDescription>
            </div>
          </div>

          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="SEARCH PROFESSIONALS BY NAME, EMAIL OR ROLE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-white/3 border-white/10 text-white placeholder:text-white/20 rounded-2xl h-14 text-xs font-black uppercase tracking-widest focus:ring-primary/20 transition-all shadow-2xl"
            />
          </div>
        </SheetHeader>

        {/* Employee Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {availableEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="p-8 rounded-full bg-white/3 border border-white/5 mb-6">
                <Search className="h-10 w-10 text-white/10" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white/30 mb-2">
                No Match Found
              </h3>
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest max-w-xs leading-relaxed">
                {search
                  ? `We couldn't find any professionals matching "${search}"`
                  : "All active professionals are already assigned to this project squad."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEmployees.map((employee) => (
                <button
                  key={employee._id}
                  onClick={() => {
                    onAddEmployee(employee);
                  }}
                  className="group relative flex flex-col p-6 rounded-3xl bg-white/2 border border-white/5 hover:bg-primary/3 hover:border-primary/20 transition-all duration-500 text-left overflow-hidden translate-y-0 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="flex items-center gap-4 relative z-10 w-full mb-6">
                    <Avatar className="h-12 w-12 border-2 border-white/5 bg-zinc-900 group-hover:border-primary/30 transition-all duration-500">
                      <AvatarImage
                        src={employee.image}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-white/5 text-[10px] font-black text-white/40">
                        {employee.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white group-hover:text-primary transition-colors truncate">
                        {employee.name}
                      </p>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">
                        {employee.designation || "Creative Staff"}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <Plus className="h-3 w-3 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5 relative z-10 w-full mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">
                        Contact Details
                      </span>
                      <p className="text-[10px] font-bold text-white/30 truncate">
                        {employee.email}
                      </p>
                    </div>

                    <HeatBar
                      current={employee.activeProjects}
                      max={employee.maxCapacity}
                      className="w-full"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
