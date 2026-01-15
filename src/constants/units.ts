export const UNITS = {
  area: ["sqft", "sqm", "sqmm"],
  length: ["mm", "cm", "in", "ft", "meter", "yard", "yd", "km", "RFT", "RMT"],
  volume: ["cum", "cft", "Litre", "KL", "CKM", "Brass"],
  weight: ["kg", "quintal", "tonne"],
  count: [
    "numbers",
    "nos",
    "pcs",
    "each",
    "set",
    "pair",
    "Item",
    "Bundle",
    "Lot",
    "bags",
    "points",
    "unit",
  ],
  time: ["hours", "Day", "Monthly", "shift", "manday"],
  work: ["Trips", "Stage", "lumpsum", "ls"],
  power: ["KW", "TR"],
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
