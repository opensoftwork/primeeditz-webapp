# Story 13D.6: Clear Development Data

**Status**: backlog  
**Points**: 2  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: All previous 13D stories

---

## User Story

**As a** Developer,  
**I want** to clear old development data,  
**So that** only new service-package-based data exists.

---

## Acceptance Criteria

### AC1: Delete Old quotationTemplates Data

**Given** the `quotationTemplates` table exists  
**When** I run the cleanup  
**Then** all documents in `quotationTemplates` are deleted

### AC2: Delete Orphaned projectTypeFields Data

**Given** the `projectTypeFields` table exists  
**When** I run the cleanup  
**Then** all documents in `projectTypeFields` are deleted

### AC3: Delete Incompatible Quotations

**Given** quotations exist with old `templateId` field  
**When** I run the cleanup  
**Then** quotations without `selectedPackageIds` are deleted  
**And** related projects (if spawned) are also cleaned

### AC4: Verify New Seeds

**Given** the data is cleared  
**When** I run the seed function  
**Then** new service packages are created  
**And** new folder templates are created

### AC5: Admin Safety Prompt

**Given** this is destructive  
**When** running in development  
**Then** I add a confirmation step  
**And** logging of what will be deleted

---

## Technical Implementation

### Create Cleanup Script

```typescript
// convex/functions/admin/cleanup.ts

import { internalMutation } from "../_generated/server";

/**
 * ⚠️ DESTRUCTIVE: Clears legacy development data.
 * Only use in development environment!
 */
export const clearLegacyData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting legacy data cleanup...");

    const stats = {
      quotationTemplates: 0,
      projectTypeFields: 0,
      oldQuotations: 0,
      orphanedProjects: 0,
    };

    // 1. Clear quotationTemplates
    const oldTemplates = await ctx.db.query("quotationTemplates").collect();
    for (const template of oldTemplates) {
      await ctx.db.delete(template._id);
      stats.quotationTemplates++;
    }
    console.log(`  ✓ Deleted ${stats.quotationTemplates} quotation templates`);

    // 2. Clear projectTypeFields
    const oldFields = await ctx.db.query("projectTypeFields").collect();
    for (const field of oldFields) {
      await ctx.db.delete(field._id);
      stats.projectTypeFields++;
    }
    console.log(`  ✓ Deleted ${stats.projectTypeFields} project type fields`);

    // 3. Clear old quotations (those without selectedPackageIds)
    const quotations = await ctx.db.query("quotations").collect();
    for (const quotation of quotations) {
      // Check if it's old format (no selectedPackageIds or has templateId)
      if (
        !quotation.selectedPackageIds ||
        quotation.selectedPackageIds.length === 0
      ) {
        // Delete related projects first
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_quotationId", (q) =>
            q.eq("quotationId", quotation._id),
          )
          .collect();

        for (const project of projects) {
          // Delete folders for this project
          const folders = await ctx.db
            .query("folders")
            .filter((q) => q.eq(q.field("projectId"), project._id))
            .collect();
          for (const folder of folders) {
            await ctx.db.delete(folder._id);
          }

          await ctx.db.delete(project._id);
          stats.orphanedProjects++;
        }

        await ctx.db.delete(quotation._id);
        stats.oldQuotations++;
      }
    }
    console.log(`  ✓ Deleted ${stats.oldQuotations} old quotations`);
    console.log(`  ✓ Deleted ${stats.orphanedProjects} orphaned projects`);

    console.log("✅ Legacy data cleanup complete!");
    return stats;
  },
});
```

### Wrapper for Dashboard (with confirmation)

```typescript
// convex/functions/admin/mutations.ts

import { adminMutation } from "@/lib/customFunctions";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * ⚠️ DESTRUCTIVE: Clears all legacy data.
 * Requires explicit confirmation string.
 */
export const clearLegacyDataWithConfirmation = adminMutation({
  args: {
    confirmationText: v.string(),
  },
  handler: async (ctx, { confirmationText }) => {
    // Require exact confirmation text
    if (confirmationText !== "DELETE ALL LEGACY DATA") {
      throw new Error(
        "Invalid confirmation. Type 'DELETE ALL LEGACY DATA' exactly.",
      );
    }

    // Check if running in production
    const isProduction = process.env.CONVEX_CLOUD_URL?.includes("convex.cloud");
    if (isProduction) {
      throw new Error("This operation is not allowed in production!");
    }

    // Run the cleanup
    const result = await ctx.runMutation(
      internal.admin.cleanup.clearLegacyData,
    );

    return {
      success: true,
      ...result,
    };
  },
});
```

### Manual Execution Command

```bash
# Run from terminal (development only!)
npx convex run admin/cleanup:clearLegacyData
```

---

## ⚠️ SAFETY WARNINGS

This story is DESTRUCTIVE and irreversible!

**Before running:**

1. ✅ Verify you're in development environment
2. ✅ Backup any data you want to keep
3. ✅ Ensure new service packages are seeded
4. ✅ Test locally first

**After running:**

1. ✅ Run seed function to create new data
2. ✅ Verify application works
3. ✅ Check no broken references

---

## ❌ DO NOT

- ❌ Do NOT run in production without explicit approval
- ❌ Do NOT run without backing up important data
- ❌ Do NOT skip the confirmation prompt
- ❌ Do NOT delete profiles or user data

---

## Testing Requirements

- [ ] Run in development only
- [ ] Verify all old templates are deleted
- [ ] Verify old quotations are deleted
- [ ] Run seed after cleanup
- [ ] Verify new data works correctly

---

## Verification Checklist

After cleanup and reseed:

- [ ] `quotationTemplates` table is empty
- [ ] `projectTypeFields` table is empty
- [ ] Old quotations are gone
- [ ] New `servicePackages` are seeded
- [ ] New `folderTemplates` are seeded
- [ ] Application loads without errors

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
