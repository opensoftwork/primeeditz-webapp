import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * SEED: Quotation Templates
 *
 * Package templates from B2B Rate Card:
 * - 5 Main Wedding Packages (Silver → Royal Elite)
 * - Pre-Wedding Special Packages
 * - Album Only Packages
 * - Video Only Packages
 */

export async function seedQuotationTemplates(
  ctx: MutationCtx,
  sectionMap: Record<string, string>,
  typeMap: Record<string, Id<"projectTypes">>,
) {
  const templates = [
    // ==========================================================================
    // MAIN WEDDING PACKAGES
    // ==========================================================================
    {
      name: "Silver Package",
      description: "Small Traditional Weddings - ₹8,500",
      projectType: "Wedding Package - Silver",
      terms: `PAYMENT TERMS
• 50% advance before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

TURNAROUND
• 15-20 working days
• 1 round of revisions included

DELIVERABLES
• Edited Photos on Google Drive
• Album Design File (PDF)
• Video File (MP4)`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Traditional Photo Color Correction (Up to 500 Images)",
          unit: "lot",
          unitPrice: 2500,
          defaultQuantity: 1,
          spawnsProject: true,
          projectType: "Wedding Photography",
        },
        {
          section: "Album Design",
          description: "Album Design - Traditional (15 Sheets, 12×30)",
          unit: "lot",
          unitPrice: 900,
          defaultQuantity: 1,
          spawnsProject: true,
          projectType: "Album Design - Traditional",
        },
        {
          section: "Video Editing",
          description: "Traditional Video Edit (Up to 60 min)",
          unit: "lot",
          unitPrice: 5100,
          defaultQuantity: 1,
          spawnsProject: true,
          projectType: "Traditional Video Edit",
        },
      ],
    },

    {
      name: "Gold Package",
      description: "Standard Weddings - ₹18,000",
      projectType: "Wedding Package - Gold",
      terms: `PAYMENT TERMS
• 50% advance before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

TURNAROUND
• 12-15 working days
• 2 rounds of revisions included

DELIVERABLES
• All Edited Files on Google Drive
• Album Designs (PDF + Working Files)
• All Videos (MP4 + Shareable Links)`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Traditional Photo Color Correction (Up to 1000 Images)",
          unit: "lot",
          unitPrice: 5000,
          defaultQuantity: 1,
        },
        {
          section: "Photo Color Correction",
          description: "Candid Photo Grading (Up to 50 Images)",
          unit: "lot",
          unitPrice: 2500,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Traditional (20 Sheets, 12×30)",
          unit: "lot",
          unitPrice: 1200,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Candid (10 Sheets, 12×30)",
          unit: "lot",
          unitPrice: 700,
          defaultQuantity: 1,
        },
        {
          section: "Video Editing",
          description: "Traditional Video Edit (Up to 90 min)",
          unit: "lot",
          unitPrice: 6900,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Teaser (1 min Basic)",
          unit: "lot",
          unitPrice: 1700,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Platinum Package",
      description: "Premium Weddings - ₹35,000",
      projectType: "Wedding Package - Platinum",
      terms: `PAYMENT TERMS
• 50% advance before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

TURNAROUND
• 10-12 working days (Priority)
• 3 rounds of revisions included

DELIVERABLES
• All Edited Files on Google Drive
• All Album Designs
• All Videos with Drone Clips
• Priority Support`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Traditional Photo Color Correction (Up to 2000 Images)",
          unit: "lot",
          unitPrice: 6000,
          defaultQuantity: 1,
        },
        {
          section: "Photo Color Correction",
          description: "Candid/Pre-Wedding Photo Grading (Up to 100 Images)",
          unit: "lot",
          unitPrice: 5000,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Traditional (25 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 1500,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Candid (20 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 1400,
          defaultQuantity: 1,
        },
        {
          section: "Video Editing",
          description: "Traditional Video Edit (Up to 2 Hours)",
          unit: "lot",
          unitPrice: 10800,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Teaser (1 min) + Highlight (3-4 min) with Drone",
          unit: "lot",
          unitPrice: 7500,
          defaultQuantity: 1,
        },
        {
          section: "Add-ons & Rush",
          description: "Drone Clip Integration",
          unit: "lot",
          unitPrice: 2800,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Diamond Package",
      description: "Luxury Weddings - ₹55,000",
      projectType: "Wedding Package - Diamond",
      terms: `PAYMENT TERMS
• 50% advance before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

TURNAROUND
• 8-10 working days (Priority)
• 4 rounds of revisions included

DELIVERABLES
• All Edited Files on Google Drive
• All Album Designs + Parent Albums
• All Videos including Pre-Wedding
• VFX Work Included
• Priority Support

Note: Includes custom branding for candid album`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Traditional Photo Color Correction (Up to 3000 Images)",
          unit: "lot",
          unitPrice: 9000,
          defaultQuantity: 1,
        },
        {
          section: "Photo Color Correction",
          description: "Candid/Pre-Wedding Photo Grading (Up to 200 Images)",
          unit: "lot",
          unitPrice: 10000,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Traditional (30 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 1800,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description:
            "Album Design - Candid + Custom Branding (25 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 2875,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Parent Album Design (15 Sheets × 2)",
          unit: "lot",
          unitPrice: 8000,
          defaultQuantity: 1,
        },
        {
          section: "Video Editing",
          description: "Traditional Video Edit (Up to 3 Hours)",
          unit: "lot",
          unitPrice: 10800,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Teaser (1 min) + Highlight (4-6 min) with Drone + VFX",
          unit: "lot",
          unitPrice: 10000,
          defaultQuantity: 1,
        },
        {
          section: "VFX & Effects",
          description: "Pre-Wedding Video Edit (1 min Teaser + 4 min Video)",
          unit: "lot",
          unitPrice: 2527,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Royal Elite Package",
      description: "Destination/Celebrity Weddings - ₹85,000",
      projectType: "Wedding Package - Royal Elite",
      terms: `PAYMENT TERMS
• 50% advance before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

TURNAROUND
• 7-10 working days (Top Priority)
• Unlimited revisions

DELIVERABLES
• All Edited Files
• All Album Designs + 4 Parent Albums
• All Videos + Cinematic Film
• VFX Work (Up to 3 min)
• Raw Backups Included
• Dedicated Account Manager`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Traditional Photo Color Correction (Unlimited Images)",
          unit: "lot",
          unitPrice: 12000,
          defaultQuantity: 1,
        },
        {
          section: "Photo Color Correction",
          description: "Candid/Pre-Wedding Photo Grading (Up to 300 Images)",
          unit: "lot",
          unitPrice: 15000,
          defaultQuantity: 1,
        },
        {
          section: "Photo Color Correction",
          description: "Heavy Retouching (50 Images)",
          unit: "lot",
          unitPrice: 7500,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Album Design - Traditional (40 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 2400,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description:
            "Album Design - Candid + Custom Branding (30 Sheets, 12×36)",
          unit: "lot",
          unitPrice: 3450,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Parent Album Design (20 Sheets × 4)",
          unit: "lot",
          unitPrice: 22000,
          defaultQuantity: 1,
        },
        {
          section: "Video Editing",
          description: "Traditional Video Edit (Up to 5 Hours)",
          unit: "lot",
          unitPrice: 4500,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Teaser (1 min) + Highlight (6-8 min) with Drone + VFX",
          unit: "lot",
          unitPrice: 12000,
          defaultQuantity: 1,
        },
        {
          section: "VFX & Effects",
          description:
            "Pre-Wedding Video Edit with VFX (1 min Teaser + 6 min Video)",
          unit: "lot",
          unitPrice: 9000,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Cinematic Film (15-20 min)",
          unit: "lot",
          unitPrice: 25000,
          defaultQuantity: 1,
        },
        {
          section: "VFX & Effects",
          description: "VFX Work (Up to 3 min)",
          unit: "lot",
          unitPrice: 6000,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Raw Backups Delivery",
          unit: "lot",
          unitPrice: 3500,
          defaultQuantity: 1,
        },
      ],
    },

    // ==========================================================================
    // PRE-WEDDING SPECIAL PACKAGES
    // ==========================================================================
    {
      name: "Pre-Wedding Basic",
      description: "Basic Pre-Wedding Package - ₹6,000",
      projectType: "Pre-Wedding Teaser",
      terms: `• 50 Photo Grading
• Teaser (1 min)
• Video (3-4 min)
• 2 rounds of revisions
• 7-10 days turnaround`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Pre-Wedding Photo Grading (50 Images)",
          unit: "lot",
          unitPrice: 1750,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Pre-Wedding Teaser (1 min) + Video (3-4 min)",
          unit: "lot",
          unitPrice: 4250,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Pre-Wedding Standard",
      description: "Standard Pre-Wedding Package - ₹8,500",
      projectType: "Pre-Wedding Teaser",
      terms: `• 75 Photo Grading
• Teaser (1 min)
• Video (4-6 min)
• 2 rounds of revisions
• 7 days turnaround`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Pre-Wedding Photo Grading (75 Images)",
          unit: "lot",
          unitPrice: 2625,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Pre-Wedding Teaser (1 min) + Video (4-6 min)",
          unit: "lot",
          unitPrice: 5875,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Pre-Wedding Premium",
      description: "Premium Pre-Wedding Package - ₹12,000",
      projectType: "Pre-Wedding with VFX",
      terms: `• 100 Photo Grading
• Teaser (1 min)
• Video (6-8 min)
• VFX Included
• 3 rounds of revisions
• 5-7 days turnaround`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Pre-Wedding Photo Grading (100 Images)",
          unit: "lot",
          unitPrice: 3500,
          defaultQuantity: 1,
        },
        {
          section: "VFX & Effects",
          description: "Pre-Wedding Teaser (1 min) + Video (6-8 min) with VFX",
          unit: "lot",
          unitPrice: 8500,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Pre-Wedding Cinematic",
      description: "Cinematic Pre-Wedding Package - ₹18,000",
      projectType: "Pre-Wedding with VFX",
      terms: `• 150 Photo Grading
• Teaser (1 min)
• Video (6-8 min)
• Heavy VFX
• Unlimited revisions
• 5 days priority turnaround`,
      lineItems: [
        {
          section: "Photo Color Correction",
          description: "Pre-Wedding Photo Grading (150 Images)",
          unit: "lot",
          unitPrice: 5250,
          defaultQuantity: 1,
        },
        {
          section: "VFX & Effects",
          description:
            "Pre-Wedding Teaser (1 min) + Video (6-8 min) with Heavy VFX",
          unit: "lot",
          unitPrice: 12750,
          defaultQuantity: 1,
        },
      ],
    },

    // ==========================================================================
    // ALBUM ONLY PACKAGES
    // ==========================================================================
    {
      name: "Album Starter",
      description: "Album Only - ₹1,200",
      projectType: "Album Design - Traditional",
      terms: `• 20 Sheets Traditional Album Design
• 2 rounds of revisions
• 10 days turnaround`,
      lineItems: [
        {
          section: "Album Design",
          description: "Traditional Album Design (20 Sheets)",
          unit: "lot",
          unitPrice: 1200,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Album Standard",
      description: "Album Only - ₹2,500",
      projectType: "Album Design - Traditional",
      terms: `• 25 Sheets Traditional Album
• 15 Sheets Candid Album
• 2 rounds of revisions
• 7-10 days turnaround`,
      lineItems: [
        {
          section: "Album Design",
          description: "Traditional Album Design (25 Sheets)",
          unit: "lot",
          unitPrice: 1500,
          defaultQuantity: 1,
        },
        {
          section: "Album Design",
          description: "Candid Album Design (15 Sheets)",
          unit: "lot",
          unitPrice: 1000,
          defaultQuantity: 1,
        },
      ],
    },

    // ==========================================================================
    // VIDEO ONLY PACKAGES
    // ==========================================================================
    {
      name: "Video Basic",
      description: "Video Only - ₹900",
      projectType: "Traditional Video Edit",
      terms: `• 60 min Traditional Edit
• 1 round of revisions
• 10 days turnaround`,
      lineItems: [
        {
          section: "Video Editing",
          description: "Traditional Video Edit (60 min)",
          unit: "lot",
          unitPrice: 900,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Video Standard",
      description: "Video Only - ₹2,000",
      projectType: "Traditional Video Edit",
      terms: `• 90 min Traditional Edit
• 1 min Teaser
• 2 rounds of revisions
• 7-10 days turnaround`,
      lineItems: [
        {
          section: "Video Editing",
          description: "Traditional Video Edit (90 min)",
          unit: "lot",
          unitPrice: 1200,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "1 Minute Teaser",
          unit: "lot",
          unitPrice: 800,
          defaultQuantity: 1,
        },
      ],
    },

    {
      name: "Video Premium",
      description: "Video Only - ₹5,500",
      projectType: "Traditional Video Edit",
      terms: `• 2 Hour Traditional Edit
• Teaser + 4 min Highlight
• 3 rounds of revisions
• 7 days turnaround`,
      lineItems: [
        {
          section: "Video Editing",
          description: "Traditional Video Edit (2 Hours)",
          unit: "lot",
          unitPrice: 1800,
          defaultQuantity: 1,
        },
        {
          section: "Teasers & Highlights",
          description: "Teaser (1 min) + Highlight (4 min)",
          unit: "lot",
          unitPrice: 3700,
          defaultQuantity: 1,
        },
      ],
    },
  ];

  const currentTemplates = await ctx.db.query("quotationTemplates").collect();

  for (const temp of templates) {
    const existing = currentTemplates.find((t) => t.name === temp.name);

    const lineItemsData = temp.lineItems
      .map((li) => {
        const sectionId = sectionMap[li.section];
        if (!sectionId) {
          console.warn(
            `Section "${li.section}" not found for template ${temp.name}`,
          );
        }
        return {
          sectionId: sectionId as Id<"quotationSections">,
          description: li.description,
          unit: li.unit,
          unitPrice: li.unitPrice,
          defaultQuantity: li.defaultQuantity,
          spawnsProject: (li as any).spawnsProject,
          projectTypeId: (li as any).projectType
            ? typeMap[(li as any).projectType]
            : undefined,
        };
      })
      .filter((li) => li.sectionId);

    const data = {
      name: temp.name,
      description: temp.description,
      terms: temp.terms,
      projectTypeHint: typeMap[temp.projectType]
        ? String(typeMap[temp.projectType])
        : undefined,
      isActive: true,
      createdBy: "SYSTEM_SEED",
      lineItems: lineItemsData,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("quotationTemplates", data);
    }
  }

  console.log(`Seeded ${templates.length} quotation templates`);
}
