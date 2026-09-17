/**
 * Component tests for the Converter screen (converter_ui), covering US-002's
 * acceptance criteria: the category picker offers exactly the five expected
 * categories, switching category repopulates the unit pickers with that
 * category's units only, and the typed number plus a live result survive
 * the switch.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Screen from "./Converter";

describe("Converter screen — category picker", () => {
  it("AC-004: the category dropdown offers exactly five categories: length, weight/mass, temperature, volume and area", () => {
    render(<Screen />);
    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options.map((o) => o.textContent)).toEqual([
      "Length",
      "Weight",
      "Temperature",
      "Volume",
      "Area",
    ]);
  });

  it("AC-004: the category rail also offers exactly five categories", () => {
    render(<Screen />);
    const heading = screen.getByRole("heading", { name: "Category", level: 2 });
    const rail = heading.closest("aside") as HTMLElement;
    const buttons = within(rail).getAllByRole("button");
    expect(buttons).toHaveLength(5);
    for (const name of ["Length", "Weight", "Temperature", "Volume", "Area"]) {
      expect(buttons.some((b) => (b.textContent || "").includes(name))).toBe(true);
    }
  });

  it("AC-005: switching category to volume repopulates the unit pickers with volume units only and a valid default pair, with no length unit left selectable", async () => {
    const user = userEvent.setup();
    render(<Screen />);

    // Starting point: length is selected, with length units in the from/to pickers.
    const fromSelect = screen.getByLabelText("Convert from") as HTMLSelectElement;
    const toSelect = screen.getByLabelText("Convert to") as HTMLSelectElement;
    expect(fromSelect.value).toBe("in");
    expect(toSelect.value).toBe("cm");

    await user.selectOptions(screen.getByLabelText("Category"), "volume");

    // A valid default from/to pair for volume is selected.
    expect(fromSelect.value).toBe("cup");
    expect(toSelect.value).toBe("ml");

    const fromOptionValues = within(fromSelect)
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);
    const toOptionValues = within(toSelect)
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);

    // Volume units only.
    expect(fromOptionValues).toEqual(["floz", "cup", "pt", "gal", "ml", "l"]);
    expect(toOptionValues).toEqual(["floz", "cup", "pt", "gal", "ml", "l"]);

    // No length unit remains selectable.
    const lengthUnitIds = ["in", "ft", "yd", "mi", "mm", "cm", "m", "km"];
    for (const id of lengthUnitIds) {
      expect(fromOptionValues).not.toContain(id);
      expect(toOptionValues).not.toContain(id);
    }
  });

  it("AC-006: the typed number is retained across a category switch and a result for the new default pair shows immediately", async () => {
    const user = userEvent.setup();
    render(<Screen />);

    const input = screen.getByLabelText(/Value to convert/i) as HTMLInputElement;
    expect(input.value).toBe("12");

    await user.selectOptions(screen.getByLabelText("Category"), "volume");

    // The number the visitor typed is retained.
    expect(input.value).toBe("12");
    // ...and because it is a valid number, a result for volume's default
    // pair (12 cup -> ml) is shown immediately, without any extra action.
    expect(screen.getByText(/12 cup = 2,839 ml/)).toBeInTheDocument();
  });

  it("AC-006: a freshly typed number survives a category switch", async () => {
    const user = userEvent.setup();
    render(<Screen />);

    const input = screen.getByLabelText(/Value to convert/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "3");
    expect(input.value).toBe("3");

    await user.selectOptions(screen.getByLabelText("Category"), "area");

    expect(input.value).toBe("3");
    // area defaults are sqft -> sqm: 3 sq ft = 0.2787... sqm
    expect(screen.getByText(/3 sq ft = 0\.2787 m²/)).toBeInTheDocument();
  });
});
