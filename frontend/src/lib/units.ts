/**
 * Single source of truth for every unit conversion factor used by the app.
 *
 * Each unit carries exactly one definition relative to its category's base
 * unit: either a `factor` (base = value * factor) or, for temperature, a
 * `toBase`/`fromBase` formula pair. No screen may hand-roll a factor of its
 * own -- `convert()` here is the only conversion path.
 */

export type Unit = { id: string; name: string; symbol: string } & (
  | { factor: number }
  | { toBase: (v: number) => number; fromBase: (v: number) => number }
);

export type CategoryId = "length" | "weight" | "temperature" | "volume" | "area";

export type Category = {
  id: CategoryId;
  label: string;
  glyph: string;
  basis: string;
  baseUnitId: string;
  defaults: [string, string];
  units: Unit[];
};

export const CATEGORIES: Category[] = [
  {
    id: "length",
    label: "Length",
    glyph: "cm",
    basis: "Base unit: metre. Factors from the international yard and pound agreement (1959).",
    baseUnitId: "m",
    defaults: ["in", "cm"],
    units: [
      // 1 in = 0.0254 m exactly, international yard and pound agreement (1959)
      { id: "in", name: "inch", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "foot", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "yard", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "mile", symbol: "mi", factor: 1609.344 },
      { id: "mm", name: "millimetre", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "centimetre", symbol: "cm", factor: 0.01 },
      { id: "m", name: "metre", symbol: "m", factor: 1 },
      { id: "km", name: "kilometre", symbol: "km", factor: 1000 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    glyph: "kg",
    basis: "Base unit: kilogram. 1 lb = 0.45359237 kg exactly (1959 agreement).",
    baseUnitId: "kg",
    defaults: ["lb", "kg"],
    units: [
      { id: "oz", name: "ounce", symbol: "oz", factor: 0.028349523125 },
      // 1 lb = 0.45359237 kg exactly, international yard and pound agreement (1959)
      { id: "lb", name: "pound", symbol: "lb", factor: 0.45359237 },
      { id: "st", name: "stone", symbol: "st", factor: 6.35029318 },
      { id: "g", name: "gram", symbol: "g", factor: 0.001 },
      { id: "kg", name: "kilogram", symbol: "kg", factor: 1 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    glyph: "°",
    basis: "Base scale: Celsius. °C = (°F − 32) × 5/9; °F = °C × 9/5 + 32.",
    baseUnitId: "c",
    defaults: ["f", "c"],
    units: [
      {
        id: "f",
        name: "degrees Fahrenheit",
        symbol: "°F",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: "c",
        name: "degrees Celsius",
        symbol: "°C",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    glyph: "ml",
    basis: "Base unit: litre. US customary measures — 1 US gallon = 3.785411784 L exactly.",
    baseUnitId: "l",
    defaults: ["cup", "ml"],
    units: [
      { id: "floz", name: "fluid ounce (US)", symbol: "fl oz", factor: 0.0295735295625 },
      { id: "cup", name: "cup (US)", symbol: "cup", factor: 0.2365882365 },
      { id: "pt", name: "pint (US)", symbol: "pt", factor: 0.473176473 },
      // 1 US gallon = 3.785411784 L exactly
      { id: "gal", name: "gallon (US)", symbol: "gal", factor: 3.785411784 },
      { id: "ml", name: "millilitre", symbol: "ml", factor: 0.001 },
      { id: "l", name: "litre", symbol: "L", factor: 1 },
    ],
  },
  {
    id: "area",
    label: "Area",
    glyph: "m²",
    basis: "Base unit: square metre. 1 acre = 4046.8564224 m² exactly.",
    baseUnitId: "sqm",
    defaults: ["sqft", "sqm"],
    units: [
      { id: "sqft", name: "square foot", symbol: "sq ft", factor: 0.09290304 },
      { id: "sqyd", name: "square yard", symbol: "sq yd", factor: 0.83612736 },
      // 1 acre = 4046.8564224 m² exactly
      { id: "ac", name: "acre", symbol: "ac", factor: 4046.8564224 },
      { id: "sqm", name: "square metre", symbol: "m²", factor: 1 },
      { id: "ha", name: "hectare", symbol: "ha", factor: 10000 },
    ],
  },
];

export function findCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function convert(value: number, from: Unit, to: Unit): number {
  const base = "toBase" in from ? from.toBase(value) : value * from.factor;
  return "fromBase" in to ? to.fromBase(base) : base / to.factor;
}
