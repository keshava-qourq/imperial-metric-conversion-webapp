/**
 * End-to-end coverage for US-002-1: live, bidirectional, button-free
 * conversion across the five categories. Complements
 * e2e/us-002-category-picker.spec.ts (which covers AC-004/005/006) with the
 * remaining acceptance criteria for this story: live typing (AC-009),
 * absence of any submit control (AC-010), clearing the input (AC-011),
 * a second category's numbers (AC-012), full unit lists (AC-013), and
 * recalculation on unit-picker change (AC-014).
 */
import { expect, test } from "@playwright/test";

test.describe("US-002-1 — converter interaction surface", () => {
  test("AC-009: typing digits into the length value field updates the result live, with no button press", async ({
    page,
  }) => {
    await page.goto("/");

    // Defaults are inch -> centimetre.
    await expect(page.getByLabel("Convert from")).toHaveValue("in");
    await expect(page.getByLabel("Convert to")).toHaveValue("cm");

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("");
    await input.pressSequentially("1");
    await expect(page.getByText(/1 in = 2\.54 cm/)).toBeVisible();

    await input.pressSequentially("2");
    await expect(input).toHaveValue("12");
    await expect(page.getByText(/12 in = 30\.48 cm/)).toBeVisible();
  });

  test("AC-010: no submit, convert, or calculate button exists anywhere on the page", async ({
    page,
  }) => {
    await page.goto("/");

    const submitInputs = page.locator('input[type="submit"], button[type="submit"]');
    await expect(submitInputs).toHaveCount(0);

    const buttons = page.getByRole("button");
    const names = await buttons.evaluateAll((els) =>
      els.map((el) => (el.textContent || "").trim() + " " + (el.getAttribute("aria-label") || "")),
    );
    for (const name of names) {
      expect(name).not.toMatch(/\bsubmit\b/i);
      expect(name).not.toMatch(/\bconvert\b/i);
      expect(name).not.toMatch(/\bcalculate\b/i);
    }
  });

  test("AC-011: clearing the value input leaves the result area empty with no error message", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("");

    await expect(page.getByText("Type a number above and the result appears here.")).toBeVisible();
    await expect(page.getByText(/error/i)).toHaveCount(0);
  });

  test("AC-012: weight category, kilogram to pound, 10 kg is approximately 22.05 lb", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Weight", exact: true }).click();

    await page.getByLabel("Convert from").selectOption("kg");
    await page.getByLabel("Convert to").selectOption("lb");

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("10");

    await expect(page.getByText(/10 kg = 22\.05 lb/)).toBeVisible();
  });

  test("AC-013: both unit pickers offer the full length unit list, covering imperial-to-imperial and metric-to-metric pairs", async ({
    page,
  }) => {
    await page.goto("/");

    const fromSelect = page.getByLabel("Convert from");
    const toSelect = page.getByLabel("Convert to");

    const expectedValues = ["in", "ft", "yd", "mi", "mm", "cm", "m", "km"];
    const fromValues = await fromSelect.locator("option").evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value),
    );
    const toValues = await toSelect.locator("option").evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value),
    );
    expect(fromValues).toEqual(expectedValues);
    expect(toValues).toEqual(expectedValues);

    // Imperial-to-imperial: foot -> inch.
    await fromSelect.selectOption("ft");
    await toSelect.selectOption("in");
    const input = page.getByLabel(/Value to convert/i);
    await input.fill("1");
    await expect(page.getByText(/1 ft = 12 in/)).toBeVisible();

    // Metric-to-metric: centimetre -> metre.
    await fromSelect.selectOption("cm");
    await toSelect.selectOption("m");
    await input.fill("250");
    await expect(page.getByText(/250 cm = 2\.5 m/)).toBeVisible();
  });

  test("AC-014: changing either unit picker recalculates the result immediately without re-entering the number", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.getByLabel(/Value to convert/i);
    await input.fill("5");
    await expect(page.getByText(/5 in = 12\.7 cm/)).toBeVisible();

    // Change the "from" unit only; the number stays put.
    await page.getByLabel("Convert from").selectOption("ft");
    await expect(input).toHaveValue("5");
    await expect(page.getByText(/5 ft = 152\.4 cm/)).toBeVisible();

    // Change the "to" unit only; the number stays put.
    await page.getByLabel("Convert to").selectOption("m");
    await expect(input).toHaveValue("5");
    await expect(page.getByText(/5 ft = 1\.524 m/)).toBeVisible();
  });
});
