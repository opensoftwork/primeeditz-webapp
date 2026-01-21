import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * SEED: Quotation Library Items
 * 
 * Individual line items from the B2B Rate Card for building quotations.
 * Includes all base rates from the pricing strategy document.
 */

export async function seedQuotationLibraryItems(
  ctx: MutationCtx, 
  sectionMap: Record<string, string>,
  typeMap?: Record<string, Id<"projectTypes">>
) {
  const libraryItems = [
    // ==========================================================================
    // PHOTO COLOR CORRECTION SECTION
    // ==========================================================================
    {
      name: "Traditional Color Correction (Per Image)",
      description: "Basic color correction for traditional photos. Bulk: ₹2/image for 2000+",
      section: "Photo Color Correction",
      unit: "per image",
      unitPrice: 5,
      projectTypeHint: "Traditional Photo Color Correction",
    },
    {
      name: "Pre-Wedding/Candid Grading (Per Image)",
      description: "Artistic grading for candid shots. Bulk: ₹35/image for 100+",
      section: "Photo Color Correction",
      unit: "per image",
      unitPrice: 50,
      projectTypeHint: "Candid Photo Grading",
    },
    {
      name: "Heavy Retouching (Per Image)",
      description: "Skin smoothing, blemish removal, advanced editing",
      section: "Photo Color Correction",
      unit: "per image",
      unitPrice: 150,
    },

    // ==========================================================================
    // ALBUM DESIGN SECTION
    // ==========================================================================
    {
      name: "Album Design - Traditional (Per Sheet)",
      description: "Color correction per sheet. Bulk: ₹50/sheet for 200+",
      section: "Album Design",
      unit: "per sheet",
      unitPrice: 60,
      projectTypeHint: "Album Design - Traditional",
    },
    {
      name: "Album Design - Candid (Per Sheet)",
      description: "Candid photo album layout. Bulk: ₹60/sheet for 200+",
      section: "Album Design",
      unit: "per sheet",
      unitPrice: 70,
      projectTypeHint: "Album Design - Candid",
    },
    {
      name: "Candid Album - Custom + Branding (Per Sheet)",
      description: "Premium candid album with custom branding",
      section: "Album Design",
      unit: "per sheet",
      unitPrice: 115,
      projectTypeHint: "Album Design - Custom Branding",
    },
    {
      name: "Design Revisions & Final Proofing",
      description: "Up to 2 rounds of revisions included",
      section: "Album Design",
      unit: "ls",
      unitPrice: 2000,
    },

    // ==========================================================================
    // VIDEO EDITING SECTION
    // ==========================================================================
    {
      name: "Traditional Full Length Video (5-10 min)",
      description: "Basic traditional video editing",
      section: "Video Editing",
      unit: "project",
      unitPrice: 500,
      projectTypeHint: "Traditional Video Edit",
    },
    {
      name: "Traditional Full Length Video (10-60 min)",
      description: "Standard traditional video editing",
      section: "Video Editing",
      unit: "project",
      unitPrice: 900,
      projectTypeHint: "Traditional Video Edit",
    },
    {
      name: "Traditional Full Length Video (60-90 min)",
      description: "Extended traditional video editing",
      section: "Video Editing",
      unit: "project",
      unitPrice: 1200,
      projectTypeHint: "Traditional Video Edit",
    },
    {
      name: "Traditional Full Length Video (Per Hour)",
      description: "For videos exceeding 90 minutes",
      section: "Video Editing",
      unit: "per hour",
      unitPrice: 900,
      projectTypeHint: "Traditional Video Edit",
    },
    {
      name: "Color Grading (Premium)",
      description: "Professional color correction and cinematic lookup",
      section: "Video Editing",
      unit: "per minute",
      unitPrice: 1500,
    },
    {
      name: "Audio Cleaning & SFX Mastering",
      description: "Professional audio enhancement",
      section: "Video Editing",
      unit: "ls",
      unitPrice: 2000,
    },

    // ==========================================================================
    // TEASERS & HIGHLIGHTS SECTION
    // ==========================================================================
    {
      name: "Pre-Wedding Teaser (1min + 3-4min Video)",
      description: "Basic pre-wedding package",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 4500,
      projectTypeHint: "Pre-Wedding Teaser",
    },
    {
      name: "Pre-Wedding Teaser (1min + 4-8min Video)",
      description: "Standard pre-wedding package",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 6000,
      projectTypeHint: "Pre-Wedding Teaser",
    },
    {
      name: "Instagram Teaser (60 seconds)",
      description: "Social media optimized short video",
      section: "Teasers & Highlights",
      unit: "ls",
      unitPrice: 2500,
    },
    {
      name: "Highlight Reel (3-4 min)",
      description: "Wedding highlight video",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 5000,
      projectTypeHint: "Highlight/Teaser Edit",
    },
    {
      name: "Highlight Reel (4-6 min)",
      description: "Extended wedding highlight",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 8000,
      projectTypeHint: "Highlight/Teaser Edit",
    },
    {
      name: "Highlight Reel (6-8 min)",
      description: "Premium wedding highlight",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 12000,
      projectTypeHint: "Highlight/Teaser Edit",
    },
    {
      name: "Cinematic Film (15-20 min)",
      description: "Full cinematic wedding film",
      section: "Teasers & Highlights",
      unit: "project",
      unitPrice: 25000,
      projectTypeHint: "Cinematic Film",
    },

    // ==========================================================================
    // VFX & EFFECTS SECTION
    // ==========================================================================
    {
      name: "Pre-Wedding with VFX (1min + 3-4min)",
      description: "Pre-wedding with visual effects",
      section: "VFX & Effects",
      unit: "project",
      unitPrice: 6000,
      projectTypeHint: "Pre-Wedding with VFX",
    },
    {
      name: "Pre-Wedding with VFX (1min + 4-8min)",
      description: "Extended pre-wedding with VFX",
      section: "VFX & Effects",
      unit: "project",
      unitPrice: 9000,
      projectTypeHint: "Pre-Wedding with VFX",
    },
    {
      name: "VFX Only - Mask/Removal/Effects (Per Minute)",
      description: "Standalone VFX work",
      section: "VFX & Effects",
      unit: "per minute",
      unitPrice: 2000,
      projectTypeHint: "VFX Work",
    },
    {
      name: "VFX Lite Package (1 min)",
      description: "Basic mask/object removal",
      section: "VFX & Effects",
      unit: "package",
      unitPrice: 2000,
      projectTypeHint: "VFX Work",
    },
    {
      name: "VFX Standard Package (2 min)",
      description: "Mask + visual effects",
      section: "VFX & Effects",
      unit: "package",
      unitPrice: 3500,
      projectTypeHint: "VFX Work",
    },
    {
      name: "VFX Pro Package (3 min)",
      description: "Heavy VFX and effects",
      section: "VFX & Effects",
      unit: "package",
      unitPrice: 5000,
      projectTypeHint: "VFX Work",
    },
    {
      name: "VFX Premium Package (5 min)",
      description: "Complex VFX/Compositing",
      section: "VFX & Effects",
      unit: "package",
      unitPrice: 8000,
      projectTypeHint: "VFX Work",
    },

    // ==========================================================================
    // DELIVERABLES SECTION
    // ==========================================================================
    {
      name: "Custom USB Drive with 4K Files",
      description: "Premium USB with all video files",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 2500,
    },
    {
      name: "Engraved Wooden USB Box",
      description: "Premium presentation box with 64GB USB",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 2000,
    },
    {
      name: "Custom Thumbnail Design (3 variants)",
      description: "For YouTube/social media",
      section: "Deliverables",
      unit: "set",
      unitPrice: 1500,
    },
    {
      name: "Leatherette Album Box & Sleeve",
      description: "Premium album packaging",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 3500,
    },
    {
      name: "Parent Album (15 Sheets)",
      description: "Smaller version for parents",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 4000,
    },
    {
      name: "Parent Album (20 Sheets)",
      description: "Extended parent album",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 5500,
    },

    // ==========================================================================
    // ADD-ONS & RUSH SECTION
    // ==========================================================================
    {
      name: "Express Delivery (50% Faster)",
      description: "25% surcharge",
      section: "Add-ons & Rush",
      unit: "surcharge",
      unitPrice: 0, // Calculated as percentage
    },
    {
      name: "Rush Delivery (24-48 Hours)",
      description: "50% surcharge",
      section: "Add-ons & Rush",
      unit: "surcharge",
      unitPrice: 0,
    },
    {
      name: "Same Day Delivery (Limited)",
      description: "100% surcharge",
      section: "Add-ons & Rush",
      unit: "surcharge",
      unitPrice: 0,
    },
    {
      name: "Additional Revision Round",
      description: "Beyond included revisions",
      section: "Add-ons & Rush",
      unit: "round",
      unitPrice: 1000,
    },
    {
      name: "Drone Clip Integration",
      description: "Aerial footage editing",
      section: "Add-ons & Rush",
      unit: "ls",
      unitPrice: 3000,
    },
  ];

  const currentItems = await ctx.db.query("quotationLibraryItems").collect();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of libraryItems) {
    const existing = currentItems.find(i => i.name === item.name);

    const sectionId = sectionMap[item.section];
    if (!sectionId) {
      console.warn(`Section "${item.section}" not found, skipping ${item.name}`);
      continue;
    }

    const data = {
      name: item.name,
      description: item.description,
      unit: item.unit,
      unitPrice: item.unitPrice,
      isActive: true,
      sectionId: sectionId as Id<"quotationSections">,
      projectTypeHint: item.projectTypeHint && typeMap 
        ? typeMap[item.projectTypeHint] 
        : undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      updatedCount++;
    } else {
      await ctx.db.insert("quotationLibraryItems", data);
      insertedCount++;
    }
  }

  console.log(`Library items: ${insertedCount} inserted, ${updatedCount} updated`);
}
