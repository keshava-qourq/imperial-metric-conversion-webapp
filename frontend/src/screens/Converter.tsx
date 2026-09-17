import React from "react";

import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { CATEGORIES, findCategory, convert } from "@/lib/units";

const SURFACE = "#11263A";
const WELL = "#0A1725";
const LINE = "rgba(161,186,211,0.18)";
const LINE_STRONG = "rgba(161,186,211,0.30)";
const TEXT = "#E6EEF6";
const MUTED = "#A1BAD3";

const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function toSuperscript(n: number): string {
  return String(n)
    .split("")
    .map((ch) => SUPERSCRIPTS[ch] || ch)
    .join("");
}

function parseValue(raw: string): number | null {
  const t = String(raw).trim();
  if (!t) return null;
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function formatResult(n: number | null): string | null {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-4) {
    const parts = n.toExponential(3).split("e");
    const mantissa = String(parseFloat(parts[0]));
    const exponent = Number(parts[1]);
    return mantissa + " × 10" + toSuperscript(exponent);
  }
  return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 }).format(n);
}

export default function Screen() {
  const [categoryId, setCategoryId] = React.useState("length");
  const [fromId, setFromId] = React.useState("in");
  const [toId, setToId] = React.useState("cm");
  const [raw, setRaw] = React.useState("12");

  const category = findCategory(categoryId);
  const from = category.units.find((u) => u.id === fromId) || category.units[0];
  const to = category.units.find((u) => u.id === toId) || category.units[1] || category.units[0];

  const parsed = parseValue(raw);
  const result = parsed === null ? null : convert(parsed, from, to);
  const formatted = formatResult(result);

  function pickCategory(id: string) {
    const next = findCategory(id);
    setCategoryId(next.id);
    setFromId(next.defaults[0]);
    setToId(next.defaults[1]);
  }

  function swapUnits() {
    setFromId(to.id);
    setToId(from.id);
  }

  const others = category.units.filter((u) => u.id !== from.id && u.id !== to.id);

  const selectStyle = {
    backgroundColor: WELL,
    borderColor: LINE_STRONG,
    color: TEXT,
    borderRadius: brand.radius,
  };

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: brand.backgroundColor, color: TEXT, fontFamily: brand.fontBody }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-8">
        <header>
          <h1
            className="text-xl font-semibold tracking-tight sm:text-3xl"
            style={{ fontFamily: brand.fontHeading }}
          >
            Unit converter
          </h1>
          <p className="mt-1.5 hidden text-sm leading-relaxed sm:block" style={{ color: MUTED }}>
            Pick a category and the two units, type a number — the result updates as you type. There
            is nothing to submit.
          </p>
        </header>

        <div className="mt-4 flex flex-col gap-5 sm:mt-6 md:flex-row md:gap-6">
          {/* Category rail — desktop */}
          <aside className="hidden md:block md:w-44 md:shrink-0">
            <h2
              className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: MUTED }}
            >
              Category
            </h2>
            <ul className="mt-2 space-y-1">
              {CATEGORIES.map((c) => {
                const active = c.id === category.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickCategory(c.id)}
                      aria-pressed={active}
                      className={
                        "flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition-colors " +
                        FOCUS
                      }
                      style={{
                        borderRadius: brand.radius,
                        borderColor: active ? "rgba(197,98,27,0.55)" : LINE,
                        backgroundColor: active ? "rgba(197,98,27,0.14)" : "transparent",
                        color: active ? TEXT : MUTED,
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex h-7 w-8 shrink-0 items-center justify-center font-mono text-xs"
                        style={{
                          borderRadius: "0.35rem",
                          backgroundColor: active ? brand.accentColor : "rgba(161,186,211,0.10)",
                          color: active ? "#12100D" : MUTED,
                        }}
                      >
                        {c.glyph}
                      </span>
                      <span className="flex-1">{c.label}</span>
                      {active ? <Icons.Check className="h-4 w-4" aria-hidden="true" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p
              className="mt-4 px-1 text-[11px] leading-relaxed"
              style={{ color: "rgba(161,186,211,0.75)" }}
            >
              Free, anonymous, and runs entirely in your browser. Nothing is saved.
            </p>
          </aside>

          <main className="min-w-0 flex-1">
            {/* Category dropdown — mobile */}
            <div className="md:hidden">
              <label
                htmlFor="category-select"
                className="block text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: MUTED }}
              >
                Category
              </label>
              <select
                id="category-select"
                value={category.id}
                onChange={(e) => pickCategory(e.target.value)}
                className={"mt-1 h-10 w-full border px-3 text-sm sm:mt-1.5 sm:h-11 " + FOCUS}
                style={selectStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: WELL }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <section
              aria-labelledby="converter-heading"
              className="mt-3 border p-3 sm:mt-4 sm:p-5 md:mt-0"
              style={{ backgroundColor: SURFACE, borderColor: LINE, borderRadius: brand.radius }}
            >
              <h2
                id="converter-heading"
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: MUTED }}
              >
                {category.label} conversion
              </h2>

              {/* Value entry */}
              <div className="mt-2 sm:mt-3">
                <label htmlFor="value-input" className="block text-xs font-medium sm:text-sm">
                  Value to convert
                </label>
                <input
                  id="value-input"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck="false"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  aria-describedby="value-hint"
                  className={
                    "mt-1 w-full border px-3 py-2 text-xl font-semibold tabular-nums sm:mt-1.5 sm:py-3 sm:text-3xl " +
                    FOCUS
                  }
                  style={{
                    backgroundColor: WELL,
                    borderColor: LINE_STRONG,
                    color: TEXT,
                    borderRadius: brand.radius,
                  }}
                />
                <p
                  id="value-hint"
                  className="mt-1.5 hidden text-xs sm:block"
                  style={{ color: MUTED }}
                >
                  Decimals and negative numbers are fine. Use a point, e.g. 1.75
                </p>
              </div>

              {/* Unit pair */}
              <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-end sm:gap-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor="from-unit" className="block text-xs font-medium sm:text-sm">
                    Convert from
                  </label>
                  <select
                    id="from-unit"
                    value={from.id}
                    onChange={(e) => setFromId(e.target.value)}
                    className={"mt-1 h-10 w-full border px-3 text-sm sm:mt-1.5 sm:h-11 " + FOCUS}
                    style={selectStyle}
                  >
                    {category.units.map((u) => (
                      <option key={u.id} value={u.id} style={{ backgroundColor: WELL }}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center sm:pb-0">
                  <button
                    type="button"
                    onClick={swapUnits}
                    aria-label={"Swap units — currently " + from.name + " to " + to.name}
                    className={
                      "inline-flex h-10 w-10 items-center justify-center border transition-colors sm:h-11 sm:w-11 " +
                      FOCUS
                    }
                    style={{
                      borderRadius: brand.radius,
                      borderColor: LINE_STRONG,
                      backgroundColor: "rgba(58,109,131,0.28)",
                      color: TEXT,
                    }}
                  >
                    <span aria-hidden="true" className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                      <Icons.ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                      <Icons.ArrowLeft className="h-4 w-4 rotate-90 sm:rotate-0" />
                    </span>
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <label htmlFor="to-unit" className="block text-xs font-medium sm:text-sm">
                    Convert to
                  </label>
                  <select
                    id="to-unit"
                    value={to.id}
                    onChange={(e) => setToId(e.target.value)}
                    className={"mt-1 h-10 w-full border px-3 text-sm sm:mt-1.5 sm:h-11 " + FOCUS}
                    style={selectStyle}
                  >
                    {category.units.map((u) => (
                      <option key={u.id} value={u.id} style={{ backgroundColor: WELL }}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div
                className="mt-4 border p-4"
                style={{
                  backgroundColor: WELL,
                  borderColor: LINE,
                  borderRadius: brand.radius,
                  borderLeft: "3px solid " + brand.accentColor,
                }}
              >
                <h3
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: MUTED }}
                >
                  Result
                </h3>
                <div aria-live="polite" aria-atomic="true" className="mt-1">
                  {formatted !== null ? (
                    <React.Fragment>
                      <p className="flex flex-wrap items-baseline gap-2">
                        <span
                          className="break-all text-3xl font-semibold tabular-nums sm:text-4xl"
                          style={{ color: "#F0A35F" }}
                        >
                          {formatted}
                        </span>
                        <span className="text-base font-medium" style={{ color: TEXT }}>
                          {to.symbol}
                        </span>
                      </p>
                      <p className="mt-1.5 text-sm" style={{ color: MUTED }}>
                        {raw.trim()} {from.symbol} = {formatted} {to.symbol}
                        {from.id === to.id ? " (same unit)" : ""}
                      </p>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <p
                        className="text-3xl font-semibold tabular-nums sm:text-4xl"
                        style={{ color: LINE_STRONG }}
                      >
                        &mdash;
                      </p>
                      <p className="mt-1.5 text-sm" style={{ color: MUTED }}>
                        Type a number above and the result appears here.
                      </p>
                    </React.Fragment>
                  )}
                </div>
                <p className="mt-3 text-xs" style={{ color: "rgba(161,186,211,0.75)" }}>
                  Rounded to 4 significant figures.
                </p>
              </div>
            </section>

            {/* Other units in this category */}
            <section
              aria-labelledby="others-heading"
              className="mt-4 border p-4 sm:p-5"
              style={{ backgroundColor: SURFACE, borderColor: LINE, borderRadius: brand.radius }}
            >
              <h3
                id="others-heading"
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: MUTED }}
              >
                The same value in other {category.label.toLowerCase()} units
              </h3>

              {others.length === 0 ? (
                <p className="mt-2.5 text-sm" style={{ color: MUTED }}>
                  This category has only two units, and both are already in use above.
                </p>
              ) : (
                <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {others.map((u) => {
                    const v = parsed === null ? null : formatResult(convert(parsed, from, u));
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setToId(u.id)}
                          className={
                            "flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition-colors " +
                            FOCUS
                          }
                          style={{
                            borderRadius: brand.radius,
                            borderColor: LINE,
                            backgroundColor: "rgba(10,23,37,0.6)",
                          }}
                        >
                          <span className="min-w-0 truncate text-sm" style={{ color: MUTED }}>
                            {u.name}
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {v === null ? (
                              <span style={{ color: LINE_STRONG }}>&mdash;</span>
                            ) : (
                              <React.Fragment>
                                {v}{" "}
                                <span className="font-normal" style={{ color: MUTED }}>
                                  {u.symbol}
                                </span>
                              </React.Fragment>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {others.length > 0 ? (
                <p className="mt-2.5 text-xs" style={{ color: "rgba(161,186,211,0.75)" }}>
                  Select any row to make it the &ldquo;convert to&rdquo; unit.
                </p>
              ) : null}
            </section>

            {/* How to use */}
            <section
              aria-labelledby="how-heading"
              className="mt-4 border p-4 sm:p-5"
              style={{ borderColor: LINE, borderRadius: brand.radius }}
            >
              <h2 id="how-heading" className="text-sm font-semibold">
                How to use this converter
              </h2>
              <ol className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                <li>1. Choose a category — length, weight, temperature, volume or area.</li>
                <li>2. Choose the unit you are converting from and the unit you want.</li>
                <li>
                  3. Type your number. The result updates on every keystroke — there is no convert
                  button. If what you type is not a number, no result is shown and nothing breaks.
                </li>
                <li>
                  4. Picked them the wrong way round? Use the swap control between the two unit
                  pickers.
                </li>
              </ol>
              <p
                className="mt-3 text-xs leading-relaxed"
                style={{ color: "rgba(161,186,211,0.75)" }}
              >
                {category.basis} Volume uses US customary measures, which differ from UK imperial.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
