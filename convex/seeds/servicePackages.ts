import { MutationCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";

interface ServicePackageSeed {
  name: string;
  description: string;
  categoryName: string; // Using name for lookup
  projectTypeName: string; // Using name for lookup
  folderTemplateName: string; // Using name for lookup
  lineItems: Array<{
    id: string;
    description: string;
    unit: string;
    rate: number;
    quantity: number;
    subItems?: Array<{ description: string; amount?: number }>;
  }>;
  terms?: string;
  isActive: boolean;
}

const SERVICE_PACKAGES: ServicePackageSeed[] = [
  {
    name: "Wedding Photography Package",
    description:
      "Complete wedding photography editing service including color correction, retouching, and album layout",
    categoryName: "Photography Post-Production",
    projectTypeName: "Traditional Photo Color Correction",
    folderTemplateName: "South Indian Traditional Wedding",
    lineItems: [
      {
        id: "wpkg-1",
        description: "Photo Editing & Color Correction",
        unit: "per project",
        rate: 8500,
        quantity: 1,
        subItems: [
          { description: "Up to 500 photos" },
          { description: "Basic skin retouching" },
          { description: "Color grading to match preferences" },
        ],
      },
      {
        id: "wpkg-2",
        description: "Album Layout Design",
        unit: "per album",
        rate: 2500,
        quantity: 1,
      },
    ],
    terms:
      "Delivery within 15 business days. Unlimited revisions for 7 days after delivery.",
    isActive: true,
  },
  {
    name: "Wedding Cinema Package",
    description:
      "Cinematic wedding video editing with professional color grading and sound design",
    categoryName: "Videography Post-Production",
    projectTypeName: "Traditional Video Edit",
    folderTemplateName: "YouTube Content Template",
    lineItems: [
      {
        id: "wcpkg-1",
        description: "Full Video Editing",
        unit: "per project",
        rate: 15000,
        quantity: 1,
        subItems: [
          { description: "Up to 4 hours raw footage" },
          { description: "Trailer (2-3 min)" },
          { description: "Full film (15-20 min)" },
        ],
      },
      {
        id: "wcpkg-2",
        description: "Drone Footage Integration",
        unit: "per project",
        rate: 3000,
        quantity: 1,
      },
    ],
    terms: "Delivery within 30 business days. 2 revision rounds included.",
    isActive: true,
  },
  {
    name: "Premium Album Package",
    description:
      "High-end album design with premium templates and unlimited revisions",
    categoryName: "Photography Post-Production",
    projectTypeName: "Album Design - Traditional",
    folderTemplateName: "Album Design - Traditional",
    lineItems: [
      {
        id: "apkg-1",
        description: "Premium Album Design",
        unit: "per album",
        rate: 12000,
        quantity: 1,
        subItems: [
          { description: "40 spreads" },
          { description: "Premium templates" },
          { description: "Unlimited revisions" },
        ],
      },
    ],
    terms: "Delivery within 10 business days.",
    isActive: true,
  },
  {
    name: "Cinematic Film Package",
    description:
      "Feature-length cinematic wedding film editing for premium events",
    categoryName: "Videography Post-Production",
    projectTypeName: "Cinematic Film",
    folderTemplateName: "South Indian Traditional Wedding", // Fallback if no specific movie template
    lineItems: [
      {
        id: "cfpkg-1",
        description: "Cinematic Film Edit",
        unit: "per film",
        rate: 25000,
        quantity: 1,
        subItems: [
          { description: "Complete documentary edit" },
          { description: "Professional color grading" },
          { description: "Sound design and foley" },
        ],
      },
    ],
    terms: "Delivery within 45 business days. Premium support included.",
    isActive: true,
  },
];

export async function seedServicePackages(ctx: MutationCtx): Promise<void> {
  console.log("🌱 Seeding service packages...");

  const categories = await ctx.db.query("projectCategories").collect();
  const projectTypes = await ctx.db.query("projectTypes").collect();
  const folderTemplates = await ctx.db.query("folderTemplates").collect();

  for (const pkg of SERVICE_PACKAGES) {
    const category = categories.find((c) => c.name === pkg.categoryName);
    const projectType = projectTypes.find((t) => t.name === pkg.projectTypeName);
    const folderTemplate = folderTemplates.find((t) => t.name === pkg.folderTemplateName);

    if (!projectType) {
      console.warn(
        `⚠️ Project type not found: ${pkg.projectTypeName}, skipping ${pkg.name}`,
      );
      continue;
    }

    if (!folderTemplate) {
      console.warn(
        `⚠️ Folder template not found: ${pkg.folderTemplateName}, skipping ${pkg.name}`,
      );
      continue;
    }

    // Check if package already exists
    const existing = await ctx.db
      .query("servicePackages")
      .filter((q) => q.eq(q.field("name"), pkg.name))
      .first();

    const data = {
      name: pkg.name,
      description: pkg.description,
      categoryId: category?._id,
      projectTypeId: projectType._id,
      folderTemplateId: folderTemplate._id,
      lineItems: pkg.lineItems,
      terms: pkg.terms,
      isActive: pkg.isActive,
      updatedAt: Date.now(),
      createdBy: "SYSTEM_SEED",
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      console.log(`  ✓ ${pkg.name} (updated)`);
    } else {
      await ctx.db.insert("servicePackages", data);
      console.log(`  ✓ ${pkg.name} (inserted)`);
    }
  }

  console.log("✅ Service packages seeded");
}
