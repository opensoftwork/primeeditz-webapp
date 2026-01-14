import { MutationCtx } from "../_generated/server";

export async function seedQuotationSections(ctx: MutationCtx) {
  const sections = [
    { name: "Pre-Production", icon: "Calendar", color: "indigo" },
    { name: "Production Services", icon: "Camera", color: "blue" },
    { name: "Equipment & Gear", icon: "HardDrive", color: "slate" },
    { name: "Post-Production", icon: "Film", color: "purple" },
    { name: "Deliverables", icon: "Package", color: "green" },
    { name: "Travel & Logistics", icon: "Truck", color: "orange" },
    { name: "Add-ons & Misc", icon: "PlusCircle", color: "amber" },
  ];

  const sectionMap: Record<string, string> = {};

  const currentSections = await ctx.db.query("quotationSections").collect();

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const existing = currentSections.find(s => s.name === sec.name);

    if (existing) {
      sectionMap[sec.name] = existing._id;
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

  return sectionMap;
}
