import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function seedQuotationTemplates(
  ctx: MutationCtx, 
  sectionMap: Record<string, string>,
  typeMap: Record<string, Id<"projectTypes">>
) {
  const templates = [
    {
      name: "Premium Wedding Cinema Package",
      description: "Full coverage with Cinematic Highlight and Documentary Film",
      projectType: "Wedding Film",
      terms: "50% advance for booking. 40% on production date. 10% on final delivery.",
      lineItems: [
        {
          section: "Pre-Production",
          description: "Creative Consultation & Storyboarding",
          unit: "session",
          unitPrice: 5000,
          defaultQuantity: 1,
        },
        {
          section: "Production Services",
          description: "Cinematography (Lead & Second Op)",
          unit: "days",
          unitPrice: 45000,
          defaultQuantity: 2,
        },
        {
          section: "Equipment & Gear",
          description: "Premium Lighting Kit (Aputure/Godox)",
          unit: "days",
          unitPrice: 5000,
          defaultQuantity: 2,
        },
        {
          section: "Post-Production",
          description: "Cinematic Wedding Highlight (5-7 mins)",
          unit: "ls",
          unitPrice: 25000,
          defaultQuantity: 1,
        },
        {
          section: "Post-Production",
          description: "Instagram Teaser (60 seconds)",
          unit: "ls",
          unitPrice: 5000,
          defaultQuantity: 1,
        },
        {
          section: "Travel & Logistics",
          description: "Local Travel & Conveyance",
          unit: "ls",
          unitPrice: 3000,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Custom USB Drive with 4K Files",
          unit: "unit",
          unitPrice: 2500,
          defaultQuantity: 1,
        }
      ]
    },
    {
      name: "Professional YouTube Edit",
      description: "High-quality editing for YouTube creators with motion graphics",
      projectType: "YouTube Video Edit",
      terms: "Up to 2 rounds of revisions included.",
      lineItems: [
        {
          section: "Post-Production",
          description: "Initial Rough Cut & Sequence Assembly",
          unit: "min",
          unitPrice: 500,
          defaultQuantity: 15,
        },
        {
          section: "Post-Production",
          description: "Color Grading & Motion Graphics",
          unit: "min",
          unitPrice: 1000,
          defaultQuantity: 15,
        },
        {
          section: "Post-Production",
          description: "Audio Cleaning & SFX Mastering",
          unit: "ls",
          unitPrice: 2000,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Custom Thumbnail Design (3 variants)",
          unit: "unit",
          unitPrice: 1500,
          defaultQuantity: 1,
        }
      ]
    },
    {
      name: "12x18 Premium Flush Mount Album",
      description: "Artistic design and premium printing on non-tearable paper",
      projectType: "Premium Coffee Table Album",
      terms: "Design approval required before printing.",
      lineItems: [
        {
          section: "Post-Production",
          description: "Artistic Layout & Page Designing",
          unit: "page",
          unitPrice: 500,
          defaultQuantity: 40,
        },
        {
          section: "Post-Production",
          description: "Design Revisions & Final Proofing",
          unit: "ls",
          unitPrice: 2000,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Premium Non-Tearable Printing & Binding",
          unit: "unit",
          unitPrice: 12000,
          defaultQuantity: 1,
        },
        {
          section: "Deliverables",
          description: "Leatherette Box & Protective Sleeve",
          unit: "unit",
          unitPrice: 3500,
          defaultQuantity: 1,
        }
      ]
    }
  ];

  const currentTemplates = await ctx.db.query("quotationTemplates").collect();

  for (const temp of templates) {
    const existing = currentTemplates.find(t => t.name === temp.name);

    if (existing) {
      await ctx.db.patch(existing._id, {
        description: temp.description,
        terms: temp.terms,
        projectTypeHint: typeMap[temp.projectType] as string,
        lineItems: temp.lineItems.map(li => ({
          sectionId: sectionMap[li.section] as Id<"quotationSections">,
          description: li.description,
          unit: li.unit,
          unitPrice: li.unitPrice,
          defaultQuantity: li.defaultQuantity,
        }))
      });
    } else {
      await ctx.db.insert("quotationTemplates", {
        name: temp.name,
        description: temp.description,
        terms: temp.terms,
        projectTypeHint: typeMap[temp.projectType] as string,
        isActive: true,
        createdBy: "SYSTEM_SEED",
        lineItems: temp.lineItems.map(li => ({
          sectionId: sectionMap[li.section] as Id<"quotationSections">,
          description: li.description,
          unit: li.unit,
          unitPrice: li.unitPrice,
          defaultQuantity: li.defaultQuantity,
        }))
      });
    }
  }
}
