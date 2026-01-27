import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * SEED: Project Type Dynamic Fields
 *
 * Defines the dynamic form fields that appear in the project wizard
 * based on the selected project type.
 */

export async function seedProjectTypeFields(
  ctx: MutationCtx,
  typeMap: Record<string, Id<"projectTypes">>,
) {
  // Field definitions organized by project type
  const fieldsByType: Record<
    string,
    Array<{
      name: string;
      label: string;
      type: "text" | "number" | "select" | "checkbox" | "textarea";
      required: boolean;
      placeholder?: string;
      description?: string;
      options?: string; // JSON string for select options
      min?: number;
      max?: number;
      displayOrder: number;
    }>
  > = {
    // ==========================================================================
    // PHOTOGRAPHY POST-PRODUCTION FIELDS
    // ==========================================================================
    "Traditional Photo Color Correction": [
      {
        name: "imageCount",
        label: "Number of Images",
        type: "number",
        required: true,
        placeholder: "e.g., 500",
        description: "Total images to be color corrected",
        min: 1,
        displayOrder: 1,
      },
      {
        name: "turnaroundDays",
        label: "Turnaround Time",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "standard", label: "Standard (5-7 days)" },
          { value: "express", label: "Express (2-3 days) +25%" },
          { value: "rush", label: "Rush (24-48 hrs) +50%" },
        ]),
        displayOrder: 2,
      },
      {
        name: "colorStyle",
        label: "Color Style Preference",
        type: "select",
        required: false,
        options: JSON.stringify([
          { value: "natural", label: "Natural" },
          { value: "warm", label: "Warm Tones" },
          { value: "cool", label: "Cool Tones" },
          { value: "custom", label: "Custom (Reference Provided)" },
        ]),
        displayOrder: 3,
      },
    ],

    "Candid Photo Grading": [
      {
        name: "imageCount",
        label: "Number of Images",
        type: "number",
        required: true,
        placeholder: "e.g., 100",
        description: "Total candid images to grade (₹50/image, ₹35 bulk 100+)",
        min: 5,
        displayOrder: 1,
      },
      {
        name: "gradingStyle",
        label: "Grading Style",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "cinematic", label: "Cinematic" },
          { value: "moody", label: "Moody/Dark" },
          { value: "bright_airy", label: "Bright & Airy" },
          { value: "vintage", label: "Vintage Film" },
          { value: "custom", label: "Match Reference" },
        ]),
        displayOrder: 2,
      },
      {
        name: "includeRetouching",
        label: "Include Heavy Retouching",
        type: "checkbox",
        required: false,
        description: "Skin smoothing, blemish removal on key shots",
        displayOrder: 3,
      },
    ],

    "Album Design - Traditional": [
      {
        name: "sheetCount",
        label: "Number of Sheets",
        type: "number",
        required: true,
        placeholder: "e.g., 20",
        description: "Each sheet = 2 pages (₹60/sheet standard, ₹50 bulk 200+)",
        min: 10,
        max: 60,
        displayOrder: 1,
      },
      {
        name: "albumSize",
        label: "Album Size",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "12x18", label: "12×18 inches" },
          { value: "12x30", label: "12×30 inches" },
          { value: "12x36", label: "12×36 inches" },
        ]),
        displayOrder: 2,
      },
      {
        name: "coverType",
        label: "Cover Type",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "leatherette", label: "Leatherette" },
          { value: "acrylic", label: "Acrylic" },
          { value: "wood", label: "Wooden" },
          { value: "padded", label: "Padded Leather" },
        ]),
        displayOrder: 3,
      },
    ],

    "Album Design - Candid": [
      {
        name: "sheetCount",
        label: "Number of Sheets",
        type: "number",
        required: true,
        placeholder: "e.g., 25",
        description: "Candid album sheets (₹70/sheet standard, ₹60 bulk)",
        min: 10,
        max: 50,
        displayOrder: 1,
      },
      {
        name: "albumSize",
        label: "Album Size",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "12x30", label: "12×30 inches" },
          { value: "12x36", label: "12×36 inches" },
        ]),
        displayOrder: 2,
      },
      {
        name: "designStyle",
        label: "Design Style",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "minimal", label: "Minimal/Clean" },
          { value: "magazine", label: "Magazine Style" },
          { value: "artistic", label: "Artistic/Collage" },
        ]),
        displayOrder: 3,
      },
    ],

    // ==========================================================================
    // VIDEOGRAPHY POST-PRODUCTION FIELDS
    // ==========================================================================
    "Traditional Video Edit": [
      {
        name: "footageDurationMinutes",
        label: "Raw Footage Duration (Minutes)",
        type: "number",
        required: true,
        placeholder: "e.g., 90",
        description: "Total raw footage to edit",
        min: 5,
        displayOrder: 1,
      },
      {
        name: "outputDuration",
        label: "Expected Output Duration",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "5-10", label: "5-10 minutes (₹500)" },
          { value: "10-60", label: "10-60 minutes (₹900)" },
          { value: "60-90", label: "60-90 minutes (₹1,200)" },
          { value: "per_hour", label: "Per Hour (₹900/hr)" },
        ]),
        displayOrder: 2,
      },
      {
        name: "includeSubtitles",
        label: "Include Subtitles",
        type: "checkbox",
        required: false,
        displayOrder: 3,
      },
    ],

    "Pre-Wedding Teaser": [
      {
        name: "packageType",
        label: "Package Type",
        type: "select",
        required: true,
        options: JSON.stringify([
          {
            value: "basic_34",
            label: "Basic: 1min Teaser + 3-4min Video (₹4,500)",
          },
          {
            value: "standard_48",
            label: "Standard: 1min Teaser + 4-8min Video (₹6,000)",
          },
        ]),
        displayOrder: 1,
      },
      {
        name: "songChoice",
        label: "Song/Music Preference",
        type: "textarea",
        required: false,
        placeholder: "Provide song name/link or leave for our recommendation",
        displayOrder: 2,
      },
      {
        name: "includeDroneClips",
        label: "Include Drone Clips",
        type: "checkbox",
        required: false,
        description: "Aerial shots integration",
        displayOrder: 3,
      },
    ],

    "Pre-Wedding with VFX": [
      {
        name: "packageType",
        label: "VFX Package",
        type: "select",
        required: true,
        options: JSON.stringify([
          {
            value: "vfx_34",
            label: "With VFX: 1min Teaser + 3-4min Video (₹6,000)",
          },
          {
            value: "vfx_48",
            label: "With VFX: 1min Teaser + 4-8min Video (₹9,000)",
          },
        ]),
        displayOrder: 1,
      },
      {
        name: "vfxType",
        label: "VFX Style",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "romantic", label: "Romantic/Dreamy Effects" },
          { value: "cinematic", label: "Cinematic/Film Look" },
          { value: "fantasy", label: "Fantasy/Magical" },
          { value: "custom", label: "Custom (Reference Provided)" },
        ]),
        displayOrder: 2,
      },
      {
        name: "vfxNotes",
        label: "VFX Instructions",
        type: "textarea",
        required: false,
        placeholder:
          "Describe specific effects, scenes, or provide reference links",
        displayOrder: 3,
      },
    ],

    "VFX Work": [
      {
        name: "vfxMinutes",
        label: "VFX Duration (Minutes)",
        type: "number",
        required: true,
        placeholder: "e.g., 3",
        description: "₹2,000 per minute",
        min: 1,
        max: 10,
        displayOrder: 1,
      },
      {
        name: "vfxType",
        label: "VFX Type Required",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "mask_removal", label: "Mask/Object Removal" },
          { value: "effects", label: "Visual Effects" },
          { value: "compositing", label: "Compositing" },
          { value: "motion_graphics", label: "Motion Graphics" },
          { value: "all", label: "Complex/Multiple" },
        ]),
        displayOrder: 2,
      },
    ],

    "Highlight/Teaser Edit": [
      {
        name: "highlightDuration",
        label: "Highlight Duration",
        type: "select",
        required: true,
        options: JSON.stringify([
          { value: "1min", label: "1 Minute Teaser" },
          { value: "3-4min", label: "3-4 Minutes Highlight" },
          { value: "4-6min", label: "4-6 Minutes Highlight" },
          { value: "6-8min", label: "6-8 Minutes Highlight" },
        ]),
        displayOrder: 1,
      },
      {
        name: "includeVFX",
        label: "Include VFX",
        type: "checkbox",
        required: false,
        displayOrder: 2,
      },
      {
        name: "includeDroneClips",
        label: "Include Drone Clips",
        type: "checkbox",
        required: false,
        displayOrder: 3,
      },
    ],

    // ==========================================================================
    // PACKAGE PROJECT FIELDS
    // ==========================================================================
    "Wedding Package - Silver": [
      {
        name: "traditionalPhotos",
        label: "Traditional Photos Count",
        type: "number",
        required: true,
        placeholder: "Up to 500",
        description: "Included: Up to 500 images",
        min: 1,
        max: 500,
        displayOrder: 1,
      },
      {
        name: "albumSheets",
        label: "Album Sheets",
        type: "number",
        required: true,
        placeholder: "15 sheets (12×30)",
        min: 10,
        max: 20,
        displayOrder: 2,
      },
      {
        name: "videoDuration",
        label: "Video Duration (Minutes)",
        type: "number",
        required: true,
        placeholder: "Up to 60 min",
        max: 60,
        displayOrder: 3,
      },
    ],

    "Wedding Package - Gold": [
      {
        name: "traditionalPhotos",
        label: "Traditional Photos Count",
        type: "number",
        required: true,
        description: "Included: Up to 1000 images",
        max: 1000,
        displayOrder: 1,
      },
      {
        name: "candidPhotos",
        label: "Candid Photos to Grade",
        type: "number",
        required: false,
        description: "Included: Up to 50 images",
        max: 50,
        displayOrder: 2,
      },
      {
        name: "includeTeaser",
        label: "Include 1-min Teaser",
        type: "checkbox",
        required: false,
        displayOrder: 3,
      },
    ],
  };

  // Clear existing fields for types we're seeding
  const existingFields = await ctx.db.query("projectTypeFields").collect();

  let insertedCount = 0;
  let updatedCount = 0;

  for (const [typeName, fields] of Object.entries(fieldsByType)) {
    const typeId = typeMap[typeName];
    if (!typeId) {
      console.warn(
        `Project type "${typeName}" not found in typeMap, skipping fields`,
      );
      continue;
    }

    for (const field of fields) {
      const existing = existingFields.find(
        (f) => f.projectTypeId === typeId && f.name === field.name,
      );

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...field,
          projectTypeId: typeId,
          isActive: true,
        });
        updatedCount++;
      } else {
        await ctx.db.insert("projectTypeFields", {
          ...field,
          projectTypeId: typeId,
          isActive: true,
        });
        insertedCount++;
      }
    }
  }

  console.log(
    `Project type fields: ${insertedCount} inserted, ${updatedCount} updated`,
  );
}
