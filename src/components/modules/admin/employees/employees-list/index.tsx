"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Briefcase, Building, Eye, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { NewEmployeeDrawer } from "./new-employee-drawer";
import { OnboardingBadge } from "./status-badge";
import type { AdminEmployee } from "./types";

// ============================================================================
// Employee Card Component (for card view)
// ============================================================================

function EmployeeCard({ employee }: { employee: AdminEmployee }) {
  return (
    <Link href={`/employees/${employee._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-indigo-500/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-indigo-500/10 transition-colors" />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                <User className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase">
                  {employee.name}
                </span>
                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  ID: {employee._id.slice(-6).toUpperCase()}
                </div>
              </div>
            </div>
            <OnboardingBadge isComplete={employee.onboardingComplete} />
          </div>

          <div className="space-y-2 pt-2">
            {employee.designation && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-3 w-3 text-indigo-400/50" />
                <span className="text-[10px] font-black text-indigo-400/70 uppercase tracking-widest">
                  {employee.designation}
                </span>
              </div>
            )}
            {employee.company && (
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 text-white/30" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                  {employee.company}
                </span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2 text-white/40">
                <Phone className="h-3 w-3" />
                <span className="text-xs font-mono">{employee.phone}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Joined {new Date(employee._creationTime).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg gap-1"
            >
              View <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Props Interface
// ============================================================================

interface EmployeeListProps {
  /** Whether to show the page header */
  showHeader?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function EmployeeList({ showHeader = true }: EmployeeListProps) {
  const [showNewEmployeeDrawer, setShowNewEmployeeDrawer] = useState(false);

  // Fetch employees
  const rawEmployees = useQuery(api.admin.getEmployees, {});

  // Transform the data to match AdminEmployee type
  const employees: AdminEmployee[] = useMemo(() => {
    if (!rawEmployees) return [];
    return rawEmployees.map((employee) => ({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      company: employee.company,
      phone: employee.phone,
      designation: employee.designation,
      onboardingComplete: employee.onboardingComplete ?? false,
      role: employee.role,
      _creationTime: employee._creationTime,
    }));
  }, [rawEmployees]);

  // Get unique companies for filtering
  const companyOptions = useMemo(() => {
    const companies = new Set<string>();
    employees.forEach((e) => {
      companies.add(e.company || "Individual");
    });
    return Array.from(companies).map((company) => ({
      label: company,
      value: company,
    }));
  }, [employees]);

  const onboardingOptions = [
    { label: "Active", value: "complete" },
    { label: "Pending", value: "pending" },
  ];

  if (rawEmployees === undefined) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        {showHeader && (
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/40">
                TEAM MANAGEMENT
              </span>
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                Employee Directory
              </h1>
            </motion.div>
          </div>
        )}
        <DataTableSkeleton rows={6} columns={6} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className={showHeader ? "flex-1 p-8 md:p-12 w-full" : "w-full"}>
      {showHeader && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/40">
              TEAM MANAGEMENT
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Employee Directory
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={() => setShowNewEmployeeDrawer(true)}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-indigo-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
            >
              ADD EMPLOYEE
            </Button>
          </motion.div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={employees}
        emptyTitle="No Employees Found"
        emptyDescription="No employees match your current filters. Click 'Add Employee' to add your first team member."
        renderCard={(employee) => <EmployeeCard employee={employee} />}
        defaultView="cards"
        showViewToggle={showHeader}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search by name, email or company...",
          },
          filters: [
            {
              column: "onboardingComplete",
              title: "Status",
              options: onboardingOptions,
            },
            ...(companyOptions.length > 1
              ? [
                  {
                    column: "company",
                    title: "Company",
                    options: companyOptions,
                  },
                ]
              : []),
          ],
        }}
      />

      <NewEmployeeDrawer
        open={showNewEmployeeDrawer}
        onOpenChange={setShowNewEmployeeDrawer}
      />
    </div>
  );
}

// Re-export for convenience
export { EmployeeCard };
export type { EmployeeListProps };
