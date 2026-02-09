import { v } from "convex/values";
import { type QueryCtx } from "../../../_generated/server";
import { adminQuery } from "../../../lib/customFunctions";

/**
 * Get all available library items, merging individual segments and template line items
 */
export const getLibraryItems = adminQuery({
  args: {
    projectTypeHint: v.optional(v.id("projectTypes")),
  },
  handler: async (ctx: QueryCtx, args) => {
    // 1. Fetch individual library items
    const libraryItems = await ctx.db
      .query("quotationLibraryItems")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // 2. Fetch all service packages to extract their line items
    const packages = await ctx.db
      .query("servicePackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // 3. Process library items
    let filteredLibraryItems = libraryItems;
    if (args.projectTypeHint) {
      filteredLibraryItems = libraryItems.filter(
        (item) =>
          !item.projectTypeHint ||
          item.projectTypeHint === args.projectTypeHint,
      );
    }

    const processedLibraryItems = filteredLibraryItems.map((item) => ({
      ...item,
      source: "library" as const,
    }));

    // 4. Process service package line items
    const packageLineItems: any[] = [];
    packages.forEach((pkg) => {
      // If projectTypeHint is provided, only include line items from matching packages
      if (
        args.projectTypeHint &&
        pkg.projectTypeId !== args.projectTypeHint
      ) {
        return;
      }

      pkg.lineItems.forEach((li) => {
        packageLineItems.push({
          _id: `${pkg._id}_${li.sectionId}_${li.description}`,
          name: li.description,
          description: `From Package: ${pkg.name}`,
          sectionId: li.sectionId,
          unit: li.unit,
          unitPrice: li.rate, // Map rate to unitPrice for UI consistency until UI updated
          isActive: true,
          source: "package" as const,
          packageName: pkg.name,
        });
      });
    });

    // 5. Merge and deduplicate
    const allItems = [...processedLibraryItems, ...packageLineItems];

    // 6. Group by section
    const sections = await ctx.db.query("quotationSections").collect();

    return sections
      .map((section) => ({
        section,
        items: allItems.filter((item) => item.sectionId === section._id),
      }))
      .filter((group) => group.items.length > 0);
  },
});
