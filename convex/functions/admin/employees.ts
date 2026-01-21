/**
 * Admin Employee Management
 * 
 * Queries for managing employees (users with role: 'employee').
 */

import { v } from "convex/values";
import { adminQuery, adminMutation } from "../../lib/customFunctions";
import { Doc } from "../../_generated/dataModel";

/**
 * Get all employees.
 */
export const getEmployees = adminQuery({
  args: {
    includeDeactivated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .filter((q) => args.includeDeactivated ? q.neq(q.field("deactivatedAt"), -1) : q.eq(q.field("deactivatedAt"), undefined))
      .collect();
  },
});

/**
 * Get employees for selection optimized for drawers.
 */
export const getEmployeesForSelection = adminQuery({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.search?.toLowerCase().trim();

    let employees = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .order("desc")
      .collect();

    if (searchTerm && searchTerm.length > 0) {
      employees = employees.filter((employee) => {
        const name = employee.name?.toLowerCase() ?? "";
        const email = employee.email?.toLowerCase() ?? "";
        const company = employee.company?.toLowerCase() ?? "";
        return name.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm);
      });
    }

    const enrichedEmployees = await Promise.all(
      employees.map(async (employee) => {
        const assignedProjects = await ctx.db
          .query("projects")
          .withIndex("by_assignedEmployeeId", (q) => q.eq("assignedEmployeeId", employee._id))
          .collect();

        const activeCount = assignedProjects.filter(
          (p) => p.phase !== 'completed' && p.phase !== 'archived' && p.actionState !== 'cancelled'
        ).length;
        const lastProjectActivity = assignedProjects.length > 0 
          ? Math.max(...assignedProjects.map((p) => p.updatedAt)) 
          : null;
        const lastActivityDate = lastProjectActivity ?? employee.updatedAt;

        return {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          company: employee.company,
          designation: employee.designation,
          onboardingComplete: employee.onboardingComplete,
          createdAt: employee._creationTime,
          projectCount: assignedProjects.length,
          activeProjectCount: activeCount,
          lastActivityDate,
        };
      })
    );

    enrichedEmployees.sort((a, b) => (b.lastActivityDate ?? 0) - (a.lastActivityDate ?? 0));
    return {
      employees: enrichedEmployees.slice(0, limit),
      hasMore: enrichedEmployees.length > limit,
      totalCount: enrichedEmployees.length,
    };
  },
});

/**
 * Get a single employee with their assigned projects.
 */
export const getEmployeeWithProjects = adminQuery({
  args: { employeeId: v.id("profiles") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.role !== "employee") return null;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_assignedEmployeeId", (q) => q.eq("assignedEmployeeId", args.employeeId))
      .order("desc")
      .collect();

    const projectTypes = await ctx.db.query("projectTypes").collect();
    const projectTypeMap = new Map(projectTypes.map((pt) => [pt._id, pt]));

    const enrichedProjects = projects.map((project) => ({
      _id: project._id,
      code: project.code,
      phase: project.phase,
      actionState: project.actionState,
      projectTypeName: projectTypeMap.get(project.projectTypeId)?.name ?? "Unknown",
      eventName: project.eventName,
      eventDate: project.eventDate,
      venue: project.venue,
      description: project.description,
      createdAt: project._creationTime,
      updatedAt: project.updatedAt,
    }));

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => !['completed', 'archived'].includes(p.phase) && p.actionState !== 'cancelled').length,
      completedProjects: projects.filter(p => p.phase === "completed").length,
      inProgressProjects: projects.filter(p => p.actionState === "work_in_progress").length,
    };

    return { employee, projects: enrichedProjects, stats };
  },
});

/**
 * Create a draft employee profile (admin-initiated).
 * Creates an employee who will receive an onboarding link to complete their profile.
 */
export const createDraftEmployeeProfile = adminMutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    designation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a unique identifier for this draft employee
    const draftId = `draft_emp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Create the draft employee profile
    const profileId = await ctx.db.insert("profiles", {
      userId: draftId, // Placeholder until employee completes onboarding
      email: `${draftId}@pending.primeeditz.com`, // Placeholder email
      name: args.name,
      phone: args.phone,
      company: args.company,
      designation: args.designation,
      role: "employee",
      onboardingComplete: false,
      updatedAt: Date.now(),
    });

    return {
      profileId,
      name: args.name,
      phone: args.phone,
      company: args.company,
      designation: args.designation,
    };
  },
});

/**
 * Update an employee profile (admin only).
 */
export const updateEmployeeProfile = adminMutation({
  args: {
    profileId: v.id("profiles"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    designation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profileId, ...updates } = args;

    const targetProfile = await ctx.db.get(profileId);
    if (!targetProfile) throw new Error("Employee profile not found");
    if (targetProfile.role !== "employee") throw new Error("Target profile is not an employee");

    const filteredUpdates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) filteredUpdates.name = updates.name;
    if (updates.phone !== undefined) filteredUpdates.phone = updates.phone;
    if (updates.company !== undefined) filteredUpdates.company = updates.company;
    if (updates.designation !== undefined) filteredUpdates.designation = updates.designation;

    await ctx.db.patch(profileId, filteredUpdates);

    return profileId;
  },
});

/**
 * Deactivate an employee profile (soft delete).
 */
export const deactivateEmployee = adminMutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) throw new Error("Employee profile not found");
    if (targetProfile.role !== "employee") throw new Error("Target profile is not an employee");

    await ctx.db.patch(args.profileId, {
      deactivatedAt: Date.now(),
      deactivatedBy: ctx.profile._id,
      updatedAt: Date.now(),
    });

    return args.profileId;
  },
});

/**
 * Reactivate a deactivated employee profile.
 */
export const reactivateEmployee = adminMutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) throw new Error("Employee profile not found");

    await ctx.db.patch(args.profileId, {
      deactivatedAt: undefined,
      deactivatedBy: undefined,
      updatedAt: Date.now(),
    });

    return args.profileId;
  },
});
