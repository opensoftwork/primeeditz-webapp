import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function seedQuotationLibraryItems(
  ctx: MutationCtx, 
  sectionMap: Record<string, string>,
  typeMap?: Record<string, Id<"projectTypes">>
) {
  const libraryItems = [
    {
      name: "Cinematography (2 Senior Ops)",
      description: "Full day coverage with two experienced cinematographers",
      section: "Production Services",
      unit: "days",
      unitPrice: 45000,
      projectTypeHint: "Wedding Film",
    },
    {
      name: "Candid Photography",
      description: "Artistic candid shots of the event",
      section: "Production Services",
      unit: "days",
      unitPrice: 35000,
      projectTypeHint: "Wedding Film",
    },
    {
      name: "Rough Cut Assembly",
      description: "Initial sequencing of raw footage",
      section: "Post-Production",
      unit: "min",
      unitPrice: 500,
    },
    {
      name: "Color Grading (Premium)",
      description: "Professional color correction and cinematic lookup",
      section: "Post-Production",
      unit: "min",
      unitPrice: 1500,
    },
    {
      name: "Custom USB Box",
      description: "Engraved wooden box with 64GB USB",
      section: "Deliverables",
      unit: "unit",
      unitPrice: 2000,
    },
    {
      name: "Aputure 600d Pro Rental",
      description: "Premium high-output LED light",
      section: "Equipment & Gear",
      unit: "days",
      unitPrice: 3500,
    },
    {
      name: "Storyboarding Session",
      description: "2-hour creative planning session",
      section: "Pre-Production",
      unit: "session",
      unitPrice: 5000,
    },
    {
      name: "Outstation Travel (Airfare)",
      description: "Domestic flights for team",
      section: "Travel & Logistics",
      unit: "ls",
      unitPrice: 15000,
    }
  ];

  const currentItems = await ctx.db.query("quotationLibraryItems").collect();

  for (const item of libraryItems) {
    const existing = currentItems.find(i => i.name === item.name);

    if (existing) {
      await ctx.db.patch(existing._id, {
        description: item.description,
        unit: item.unit,
        unitPrice: item.unitPrice,
        sectionId: sectionMap[item.section] as Id<"quotationSections">,
        projectTypeHint: item.projectTypeHint && typeMap ? typeMap[item.projectTypeHint] : undefined,
      });
    } else {
      await ctx.db.insert("quotationLibraryItems", {
        name: item.name,
        description: item.description,
        unit: item.unit,
        unitPrice: item.unitPrice,
        isActive: true,
        sectionId: sectionMap[item.section] as Id<"quotationSections">,
        projectTypeHint: item.projectTypeHint && typeMap ? typeMap[item.projectTypeHint] : undefined,
      });
    }
  }
}
