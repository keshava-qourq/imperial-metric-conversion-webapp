/**
 * End-to-end coverage for US-002 "Pick a conversion category", exercised
 * through a real browser against the built app (converter_ui + unit_registry
 * working together, not mocked). There is no backend for this feature --
 * per the architecture notes the app makes no XHR/fetch calls at all -- so
 * every acceptance criterion here is a UI flow, not an API contract.
 */
import { expect, test } from "@playwright/test";

const CATEGORY_LABELS = ["Length", "Weight", "Temperature", "Volume", "Area"];
const LENGTH_UNIT_WORDS = ["inch", "foot", "yard", "mile", "millimetre", "centimetre", "metre", "kilometre"];

test.describe("US-002 — category picker", () => {
  test("AC-004: opening the category picker offers exactly five categories: length, weight/mass, temperature, volume and area", async ({
    page,
  }) => {
    await page.goto("/");

    // Desktop rail: exactly five category entries, no more, no fewer.
    const rail = page.getByRole("heading", { name: "Category", level: 2 }).locator("..");
    await expect(rail.locator("li")).toHaveCount(5);
    for (const label of CATEGORY_LABELS) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }

    // Mobile dropdown carries the same five categories, no more, no fewer.
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileSelect = page.locator("#category-select");
    await expect(mobileSelect.locator("option")).toHaveCount(5);
    const optionLabels = await mobileSelect.locator("option").allTextContents();
    expect(optionLabels).toEqual(CATEGORY_LABELS);
  });

  test("AC-005: switching from length to volume repopulates the unit pickers with volume units only and a valid default pair, with no length unit left selectable", async ({
    page,
  }) => {
    await page.goto("/");

    const fromSelect = page.getByLabel("Convert from");
    const toSelect = page.getByLabel("Convert to");

    // Starting point: length is selected with length units in the from/to pickers.
    await expect(fromSelect).toHaveValue("in");
    await expect(toSelect).toHaveValue("cm");

    await page.getByRole("button", { name: "Volume", exact: true }).click();

    // A valid default from/to pair for volume is selected automatically.
    await expect(fromSelect).toHaveValue("cup");
    await expect(toSelect).toHaveValue("ml");

    const fromOptionText = await fromSelect.locator("option").allTextContents();
    const toOptionText = await toSelect.locator("option").allTextContents();

    // Volume units only.
    expect(fromOptionText.some((t) => t.includes("cup"))).toBe(true);
    expect(toOptionText.some((t) => t.includes("millilitre"))).toBe(true);

    // No length unit remains selectable in either picker.
    for (const word of LENGTH_UNIT_WORDS) {
      expect(fromOptionText.some((t) => t.includes(word))).toBe(false);
      expect(toOptionText.some((t) => t.includes(word))).toBe(false);
    }
  });

  test("AC-006: the typed number survives a category switch and a result for the new category's default pair appears immediately", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("3");
    await expect(input).toHaveValue("3");

    await page.getByRole("button", { name: "Area", exact: true }).click();

    // The number the visitor typed is retained across the switch...
    await expect(input).toHaveValue("3");
    // ...and because it is a valid number, a result for area's default pair
    // (3 sq ft -> sq m) is shown immediately, with no extra action taken.
    await expect(page.getByText(/3 sq ft = 0\.2787 m²/)).toBeVisible();
  });

  test("AC-005 & AC-006 via the mobile category dropdown: repopulation and a retained, live result also work from the small-screen control", async ({
    page,
  }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 390, height: 844 });

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("98.6");

    await page.locator("#category-select").selectOption("temperature");

    const fromSelect = page.getByLabel("Convert from");
    const toSelect = page.getByLabel("Convert to");
    await expect(fromSelect).toHaveValue("f");
    await expect(toSelect).toHaveValue("c");

    const fromOptionText = await fromSelect.locator("option").allTextContents();
    expect(fromOptionText).toEqual(["degrees Fahrenheit (°F)", "degrees Celsius (°C)"]);

    await expect(input).toHaveValue("98.6");
    await expect(page.getByText(/98\.6 °F = 37 °C/)).toBeVisible();
  });
});
