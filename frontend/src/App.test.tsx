import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the converter directly with no navigation shell", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /unit converter/i })).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Converter")).not.toBeInTheDocument();
  });

  it("pre-selects a default category and unit pair so typing a value converts immediately", () => {
    render(<App />);
    const fromSelect = screen.getByLabelText("Convert from") as HTMLSelectElement;
    const toSelect = screen.getByLabelText("Convert to") as HTMLSelectElement;
    expect(fromSelect.value).toBe("in");
    expect(toSelect.value).toBe("cm");
  });
});
