import { ConvexError, v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";
import {
  adminMutation,
  adminQuery,
  authenticatedWithProfileMutation,
} from "../../lib/customFunctions";
import { now } from "../../lib/helpers";
import {
  canTransition,
  getActorForState,
  getPhaseForState,
} from "../../lib/statusMachine";
import { projectActionStateValidator } from "../../schema";

/**
 * List all employees with their current workload for the assignment table.
 */
export const listEmployeesWithWorkload = adminQuery({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();

    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const activeSquads = await ctx.db
          .query("projectSquads")
          .withIndex("by_profileId", (q) => q.eq("profileId", emp._id))
          .collect();

        const activeProjectIds = activeSquads
          .filter((s) => !s.dissolvedAt)
          .map((s) => s.projectId);

        let activeCount = 0;
        for (const projectId of activeProjectIds) {
          const project = await ctx.db.get(projectId);
          if (
            project &&
            project.phase !== "completed" &&
            project.phase !== "archived"
          ) {
            activeCount++;
          }
        }

        return {
          ...emp,
          activeProjects: activeCount,
          maxCapacity: 5,
        };
      }),
    );

    return enrichedEmployees;
  },
});

/**
 * Assign a squad of employees to a project.
 */
export const assignSquad = adminMutation({
  args: {
    projectId: v.id("projects"),
    members: v.array(
      v.object({
        profileId: v.id("profiles"),
        role: v.string(),
        isLead: v.boolean(),
      }),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    const existingSquads = await ctx.db
      .query("projectSquads")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .collect();

    for (const s of existingSquads) {
      await ctx.db.patch(s._id, { dissolvedAt: now() });
    }

    for (const member of args.members) {
      const profile = await ctx.db.get(member.profileId);
      if (!profile || profile.role !== "employee") {
        throw new ConvexError(`Invalid employee: ${member.profileId}`);
      }

      await ctx.db.insert("projectSquads", {
        projectId: args.projectId,
        profileId: member.profileId,
        role: member.role,
        isLead: member.isLead,
        assignedAt: now(),
      });
    }

    const lead = args.members.find((m) => m.isLead) || args.members[0];

    if (canTransition(project.actionState, "assigned")) {
      const newPhase = getPhaseForState("assigned");
      const newActor = getActorForState("assigned");

      await ctx.db.patch(args.projectId, {
        assignedEmployeeId: lead.profileId,
        phase: newPhase,
        actionState: "assigned",
        awaitingActorRole: newActor,
        assignedAt: now(),
        updatedAt: now(),
      });

      await ctx.db.insert("statusHistory", {
        projectId: args.projectId,
        previousPhase: project.phase,
        newPhase: newPhase,
        previousActionState: project.actionState,
        newActionState: "assigned",
        changedBy: ctx.profile._id,
        changedAt: now(),
        notes: args.notes || `Squad assigned via Admin Command Center.`,
      });
    } else {
      await ctx.db.patch(args.projectId, {
        assignedEmployeeId: lead.profileId,
        updatedAt: now(),
      });
    }

    return { success: true };
  },
});

/**
 * Record a formal handoff (Baton Pass) between squad members.
 */
export const recordHandoff = authenticatedWithProfileMutation({
  args: {
    projectId: v.id("projects"),
    toProfileId: v.optional(v.id("profiles")),
    toState: projectActionStateValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (!canTransition(project.actionState, args.toState)) {
      throw new ConvexError(
        `Invalid transition: ${project.actionState} -> ${args.toState}`,
      );
    }

    const newPhase = getPhaseForState(args.toState);
    const newActor = getActorForState(args.toState);

    await ctx.db.insert("handoffLogs", {
      projectId: args.projectId,
      fromProfileId: ctx.profile._id,
      toProfileId: args.toProfileId,
      fromActionState: project.actionState,
      toActionState: args.toState,
      notes: args.notes,
      createdAt: now(),
    });

    await ctx.db.patch(args.projectId, {
      phase: newPhase,
      actionState: args.toState,
      awaitingActorRole: newActor,
      awaitingActorId: args.toProfileId,
      updatedAt: now(),
    });

    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: newPhase,
      previousActionState: project.actionState,
      newActionState: args.toState,
      changedBy: ctx.profile._id,
      changedAt: now(),
      notes: args.notes || `Handoff to state: ${args.toState}`,
    });

    return { success: true };
  },
});

/**
 * Get the current squad for a project.
 */
export const getProjectSquad = adminQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    const squadMembers = await ctx.db
      .query("projectSquads")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("dissolvedAt"), undefined))
      .collect();

    const membersWithProfiles = await Promise.all(
      squadMembers.map(async (member) => {
        const profile = await ctx.db.get(member.profileId);
        return {
          ...member,
          profile,
        };
      }),
    );

    return membersWithProfiles;
  },
});
