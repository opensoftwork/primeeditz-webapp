/**
 * Units Configuration for Post-Production Company
 *
 * Organized by category with post-production relevant units prioritized.
 */

export const UNITS = {
  // Post-production primary
  time: ["hours", "minutes", "days", "shifts", "weeks", "months"],
  work: ["lumpsum", "ls", "package", "project", "session"],
  count: ["nos", "pcs", "each", "set", "Item", "deliverables", "versions"],

  // Secondary
  media: ["clips", "tracks", "frames", "scenes", "shots", "reels"],
  storage: ["GB", "TB", "files"],
  percentage: ["%"],
} as const;

export type UnitCategory = keyof typeof UNITS;

export const ALL_UNITS = Object.values(UNITS).flat();

export const UNIT_OPTIONS = Object.entries(UNITS).map(([category, units]) => ({
  category,
  units: units.map((unit) => ({
    value: unit,
    label: unit.toUpperCase(),
  })),
}));

export const FLAT_UNIT_OPTIONS = ALL_UNITS.map((unit) => ({
  value: unit,
  label: unit.toUpperCase(),
}));

/** Default unit for new line items */
export const DEFAULT_UNIT = "lumpsum";
