/**
 * End-to-end coverage for US-002 "Pick a conversion category", driven
 * through the browser the way a visitor would.
 *
 * This app has no application API (see architecture notes: no XHR/fetch to
 * any backend, only the initial static-asset download), so every criterion
 * here is proven through the UI rather than through Playwright's `request`
 * API — there is no backend contract to hit.
 */
import { expect, test } from "@playwright/test";

test.describe("US-002: pick a conversion category", () => {
  test("AC-004: the category picker offers exactly five categories: length, weight/mass, temperature, volume and area", async ({
    page,
  }) => {
    await page.goto("/converter");

    const categoryPicker = page.locator("#category-select");
    const options = categoryPicker.locator("option");
    await expect(options).toHaveCount(5);
    await expect(options).toHaveText(["Length", "Weight", "Temperature", "Volume", "Area"]);
  });

  test("AC-005: switching from length to volume repopulates the from/to pickers with volume units only and a valid default pair", async ({
    page,
  }) => {
    await page.goto("/converter");

    const fromUnit = page.getByLabel("Convert from");
    const toUnit = page.getByLabel("Convert to");

    // Starting state: length units.
    await expect(fromUnit).toHaveValue("in");
    await expect(toUnit).toHaveValue("cm");

    await page.getByLabel("Category").selectOption("volume");

    // A valid default volume pair is selected automatically.
    await expect(fromUnit).toHaveValue("cup");
    await expect(toUnit).toHaveValue("ml");

    // No length unit remains selectable in either picker.
    const fromOptionText = await fromUnit.locator("option").allTextContents();
    const toOptionText = await toUnit.locator("option").allTextContents();
    for (const lengthWord of ["inch", "foot", "yard", "mile", "millimetre", "kilometre"]) {
      expect(fromOptionText.join(" ")).not.toContain(lengthWord);
      expect(toOptionText.join(" ")).not.toContain(lengthWord);
    }
    // ...and only volume units are on offer.
    for (const text of fromOptionText) {
      expect(text).toMatch(/fluid ounce|cup|pint|gallon|millilitre|litre/i);
    }
  });

  test("AC-006: the typed number is retained and a result for the new category shows immediately after switching category", async ({
    page,
  }) => {
    await page.goto("/converter");

    const valueInput = page.getByLabel("Value to convert");
    await valueInput.fill("25");

    await page.getByLabel("Category").selectOption("area");

    // The number the visitor typed survives the switch.
    await expect(valueInput).toHaveValue("25");

    // A result for area's default pair (square foot -> square metre) is
    // shown immediately, with no further action from the visitor.
    // 25 sq ft = 25 * 0.09290304 m^2 = 2.322576, rounded to 4 sig figs = 2.323
    await expect(page.getByText(/25 sq ft = 2\.323 m²/)).toBeVisible();
  });
});
