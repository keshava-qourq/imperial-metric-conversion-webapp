/**
 * Unit tests for the unit registry (unit_registry component).
 *
 * These cover the structural guarantees the converter UI depends on for
 * US-002: exactly five categories, and every category's default from/to
 * pair actually resolves to two distinct units within that category so a
 * result can always be shown immediately after a category switch.
 */
import { describe, expect, it } from "vitest";

import { CATEGORIES, convert, findCategory } from "./units";

describe("unit registry", () => {
  it("AC-004: offers exactly five categories: length, weight/mass, temperature, volume and area", () => {
    expect(CATEGORIES).toHaveLength(5);
    expect(CATEGORIES.map((c) => c.id).sort()).toEqual(
      ["area", "length", "temperature", "volume", "weight"].sort(),
    );
  });

  it("every category has a distinct, valid default from/to unit pair", () => {
    for (const category of CATEGORIES) {
      const [fromId, toId] = category.defaults;
      expect(fromId).not.toBe(toId);
      expect(category.units.some((u) => u.id === fromId)).toBe(true);
      expect(category.units.some((u) => u.id === toId)).toBe(true);
    }
  });

  it("no unit id is shared across two different categories (AC-005: switching category leaves no stale unit selectable)", () => {
    const seen = new Map<string, string>();
    for (const category of CATEGORIES) {
      for (const unit of category.units) {
        expect(seen.has(unit.id)).toBe(false);
        seen.set(unit.id, category.id);
      }
    }
  });

  it("findCategory falls back to the first category for an unknown id", () => {
    expect(findCategory("not-a-real-category").id).toBe(CATEGORIES[0].id);
  });

  it("convert() round-trips a value through a category's default pair and back", () => {
    for (const category of CATEGORIES) {
      const from = category.units.find((u) => u.id === category.defaults[0])!;
      const to = category.units.find((u) => u.id === category.defaults[1])!;
      const converted = convert(10, from, to);
      const back = convert(converted, to, from);
      expect(back).toBeCloseTo(10, 6);
    }
  });
});
