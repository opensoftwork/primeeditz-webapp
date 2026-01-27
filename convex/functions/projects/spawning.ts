import type { GenericDatabaseWriter } from "convex/server";
import type { DataModel, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { now } from "../../lib/helpers";
import { getActorForState } from "../../lib/statusMachine";
import { setupFoldersInternal } from "../folders/mutations";

/**
 * Generate a unique project code
 */
async function generateProjectCode(db: GenericDatabaseWriter<DataModel>): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `PE-${year}${month}`;

  const allProjects = await db.query("projects").collect();

  let maxSeq = 0;
  for (const project of allProjects) {
    if (project.code.startsWith(prefix)) {
      const parts = project.code.split("-");
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10);
        if (!Number.isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }

  const newSeq = String(maxSeq + 1).padStart(3, "0");
  return `${prefix}-${newSeq}`;
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
 * Spawn projects from a quotation based on its line items.
 * Called when a quotation is approved.
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

  for (const item of quotation.lineItems) {
    if (item.spawnsProject && item.projectTypeId) {
      // 1. Generate unique code
      const code = await generateProjectCode(ctx.db);

      // 2. Insert new project
      const projectId = await ctx.db.insert("projects", {
        code,
        projectTypeId: item.projectTypeId as Id<"projectTypes">,
        studioId: quotation.studioId as Id<"profiles">,
        quotationId: quotation._id,
        source: "quotation_spawned",
        phase: "onboarding",
        actionState: "awaiting_uploads",
        awaitingActorRole: getActorForState("awaiting_uploads"),
        storageUsed: 0,
        lastStep: 3, // Start at step 3 for onboarding (Story 11C.5)
        updatedAt: now(),
        quotationApprovedAt: now(),
        endClientName: quotation.endClientName,
        eventName: item.description,
        eventDate: quotation.eventDate,
      });

      createdProjectIds.push(projectId);

      // 3. Log status history
      await ctx.db.insert("statusHistory", {
        projectId,
        previousPhase: "setup",
        newPhase: "onboarding",
        previousActionState: "draft",
        newActionState: "awaiting_uploads",
        previousAwaitingActorRole: "studio",
        newAwaitingActorRole: getActorForState("awaiting_uploads"),
        changedBy: args.profileId,
        changedAt: now(),
        notes: `Project automatically spawned from approved quotation ${quotation.code}`,
      });

      // 4. Automated Folder Setup (Story 11B.2 / 11B.3)
      if (item.selectedFolderTemplateId && defaultStorageTierId) {
        try {
          await setupFoldersInternal(ctx, {
            projectId,
            templateId: item.selectedFolderTemplateId as Id<"folderTemplates">,
            storageTierId: defaultStorageTierId,
            changedBy: args.profileId,
          });
        } catch (err) {
          console.error(
            `Failed to automount folders for project ${code}:`,
            err,
          );
          // Don't fail the whole transaction, just log it
          // We might want to add a note to status history too
          await ctx.db.insert("statusHistory", {
            projectId,
            previousPhase: "setup",
            newPhase: "setup",
            previousActionState: "quotation_approved",
            newActionState: "quotation_approved",
            changedBy: args.profileId,
            changedAt: now(),
            notes:
              "Automatic folder setup failed. Storage tier might be missing.",
          });
        }
      }
    }
  }

  return createdProjectIds;
}
