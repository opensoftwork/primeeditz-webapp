import type { GenericDatabaseWriter } from "convex/server";
import type { DataModel, Id, Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { now } from "../../lib/helpers";
import { getActorForState } from "../../lib/statusMachine";
import { setupFoldersInternal } from "../folders/mutations";

/**
 * Generate a unique project code
 * Format: PE-YY-NNNNN (e.g., PE-26-00001)
 */
async function generateProjectCode(
  db: GenericDatabaseWriter<DataModel>,
): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `PE-${year}-`;

  // Query last project code to get the next sequence number
  const lastProject = await db.query("projects").order("desc").first();

  let nextNum = 1;
  if (lastProject?.code && lastProject.code.startsWith(prefix)) {
    const match = lastProject.code.match(/\d+$/);
    if (match) {
      nextNum = parseInt(match[0], 10) + 1;
    }
  }

  const newSeq = String(nextNum).padStart(5, "0");
  return `${prefix}${newSeq}`;
}

/**
 * Get default storage tier or the first active one
 */
async function getDefaultStorageTier(
  db: GenericDatabaseWriter<DataModel>,
): Promise<Id<"storageTiers"> | null> {
  // First try to find one marked as isDefault
  const defaultTier = await db
    .query("storageTiers")
    .filter((q) =>
      q.and(q.eq(q.field("isActive"), true), q.eq(q.field("isDefault"), true)),
    )
    .first();

  if (defaultTier) return defaultTier._id;

  // Fallback to first active tier
  const firstActive = await db
    .query("storageTiers")
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();

  return firstActive?._id || null;
}

/**
 * Spawn projects from a quotation based on its selected service packages.
 * Called when a quotation is approved.
 * Each package can now define multiple project configurations.
 * Story 13F.4 Implementation
 */
export async function spawnProjectsFromQuotation(
  ctx: MutationCtx,
  args: {
    quotationId: Id<"quotations">;
    profileId: Id<"profiles">;
  },
): Promise<Id<"projects">[]> {
  const quotation = await ctx.db.get(args.quotationId);
  if (!quotation) throw new Error("Quotation not found");

  const createdProjectIds: Id<"projects">[] = [];
  const defaultStorageTierId = await getDefaultStorageTier(ctx.db);

  if (!quotation.selectedPackageIds || quotation.selectedPackageIds.length === 0) {
    console.warn(`Quotation ${quotation.code} has no selected packages. No projects spawned.`);
    return [];
  }

  for (const packageId of quotation.selectedPackageIds) {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) {
      console.warn(`Package ${packageId} not found. Skipping spawning.`);
      continue;
    }

    // MULTI-PROJECT SUPPORT (New behavior)
    if (pkg.projectConfigs && pkg.projectConfigs.length > 0) {
      for (const config of pkg.projectConfigs) {
        const projectId = await createProjectInternal(ctx, {
          quotation,
          pkg,
          projectTypeId: config.projectTypeId,
          folderTemplateId: config.folderTemplateId,
          storageTierId: config.defaultStorageTierId || pkg.defaultStorageTierId || defaultStorageTierId,
          label: config.label,
          profileId: args.profileId,
        });
        createdProjectIds.push(projectId);
      }
    } 
    // BACKWARD COMPAT (Legacy single-project packages)
    else if (pkg.projectTypeId) {
      const projectId = await createProjectInternal(ctx, {
        quotation,
        pkg,
        projectTypeId: pkg.projectTypeId,
        folderTemplateId: pkg.folderTemplateId,
        storageTierId: pkg.defaultStorageTierId || defaultStorageTierId,
        profileId: args.profileId,
      });
      createdProjectIds.push(projectId);
    } else {
      console.warn(`Package ${pkg.name} has no valid project configuration. Skipping.`);
    }
  }

  return createdProjectIds;
}

/**
 * Internal helper to create a project and its associated initial state
 */
async function createProjectInternal(
  ctx: MutationCtx,
  args: {
    quotation: Doc<"quotations">;
    pkg: Doc<"servicePackages">;
    projectTypeId: Id<"projectTypes">;
    folderTemplateId?: Id<"folderTemplates">;
    storageTierId: Id<"storageTiers"> | null;
    label?: string;
    profileId: Id<"profiles">;
  }
): Promise<Id<"projects">> {
  const { quotation, pkg, projectTypeId, folderTemplateId, storageTierId, label, profileId } = args;

  // 1. Generate unique code
  const code = await generateProjectCode(ctx.db);

  // 2. Insert new project
  const projectId = await ctx.db.insert("projects", {
    code,
    projectTypeId,
    studioId: quotation.studioId as Id<"profiles">,
    quotationId: quotation._id,
    source: "quotation_spawned",
    phase: "onboarding",
    actionState: "awaiting_onboarding",
    awaitingActorRole: getActorForState("awaiting_onboarding"),
    storageUsed: 0,
    lastStep: 3, // Start at step 3 for onboarding (Story 11C.5)
    updatedAt: now(),
    quotationApprovedAt: now(),
    endClientName: quotation.endClientName,
    eventName: quotation.eventName,
    eventDate: quotation.eventDate,
    assignedEmployeeId: quotation.assignedEmployeeId,
  });

  // 3. Log status history with package and config details
  const labelSuffix = label ? ` - ${label}` : "";
  await ctx.db.insert("statusHistory", {
    projectId,
    previousPhase: "setup",
    newPhase: "onboarding",
    previousActionState: "draft",
    newActionState: "awaiting_onboarding",
    previousAwaitingActorRole: "studio",
    newAwaitingActorRole: getActorForState("awaiting_onboarding"),
    changedBy: profileId,
    changedAt: now(),
    notes: `Spawned from package "${pkg.name}"${labelSuffix}. Approved quotation: ${quotation.code}`,
  });

  // 4. Automated Folder & Storage Setup
  if (folderTemplateId && storageTierId) {
    try {
      await setupFoldersInternal(ctx, {
        projectId,
        templateId: folderTemplateId,
        storageTierId: storageTierId,
        changedBy: profileId,
      });
    } catch (err) {
      console.error(`Failed to automount folders for project ${code}:`, err);
      // Fallback log in history
      await ctx.db.insert("statusHistory", {
        projectId,
        previousPhase: "setup",
        newPhase: "setup",
        previousActionState: "quotation_approved",
        newActionState: "quotation_approved",
        changedBy: profileId,
        changedAt: now(),
        notes: "Automatic folder setup failed. Storage tier might be missing.",
      });
    }
  }

  return projectId;
}
