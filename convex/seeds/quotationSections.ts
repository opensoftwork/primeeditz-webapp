import { MutationCtx } from "../_generated/server";

/**
 * SEED: Quotation Sections
 * 
 * Aligned with Prime Editz pricing document categories.
 */

export async function seedQuotationSections(ctx: MutationCtx) {
  const sections = [
    { 
      name: "Photo Color Correction", 
      icon: "Camera", 
      color: "blue",
      description: "Traditional and candid color correction services",
    },
    { 
      name: "Album Design", 
      icon: "BookOpen", 
      color: "purple",
      description: "Traditional, candid, and custom album layouts",
    },
    { 
      name: "Video Editing", 
      icon: "Film", 
      color: "indigo",
      description: "Full-length video editing services",
    },
    { 
      name: "Teasers & Highlights", 
      icon: "Sparkles", 
      color: "amber",
      description: "Short promotional videos and highlight reels",
    },
    { 
      name: "VFX & Effects", 
      icon: "Wand2", 
      color: "pink",
      description: "Visual effects, masking, compositing",
    },
    { 
      name: "Deliverables", 
      icon: "Package", 
      color: "green",
      description: "USB, prints, physical delivery items",
    },
    { 
      name: "Add-ons & Rush", 
      icon: "Zap", 
      color: "orange",
      description: "Express delivery, extra revisions, special requests",
    },
  ];

  const sectionMap: Record<string, string> = {};

  const currentSections = await ctx.db.query("quotationSections").collect();

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const existing = currentSections.find(s => s.name === sec.name);

    if (existing) {
      sectionMap[sec.name] = existing._id;
      // Update with new properties if needed
      await ctx.db.patch(existing._id, {
        icon: sec.icon,
        color: sec.color,
        displayOrder: i,
      });
    } else {
      const id = await ctx.db.insert("quotationSections", {
        name: sec.name,
        icon: sec.icon,
        color: sec.color,
        displayOrder: i,
        isActive: true,
      });
      sectionMap[sec.name] = id;
    }
  }

  console.log(`Seeded ${sections.length} quotation sections`);

  return sectionMap;
}
