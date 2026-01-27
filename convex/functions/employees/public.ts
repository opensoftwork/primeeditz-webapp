/**
 * Public Employee Queries
 *
 * Unauthenticated queries for employee onboarding.
 * These are intentionally public for the onboarding flow.
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";

/**
 * Get employee info for onboarding page (public).
 * Only returns minimal info needed for the onboarding screen.
 */
export const getEmployeeForOnboarding = query({
  args: {
    employeeId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);

    // Return null if not found or not an employee
    if (!employee || employee.role !== "employee") {
      return null;
    }

    // Only return non-sensitive info needed for onboarding display
    return {
      employee: {
        _id: employee._id,
        name: employee.name,
        phone: employee.phone,
        company: employee.company,
        designation: employee.designation,
        onboardingComplete: employee.onboardingComplete,
      },
      // Empty projects/stats for consistency with admin query shape
      projects: [],
      stats: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
      },
    };
  },
});
