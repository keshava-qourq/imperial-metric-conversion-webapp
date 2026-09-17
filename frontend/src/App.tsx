import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import Converter from "@/screens/Converter";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

export default function App() {
  return (
    <div className="flex min-h-screen">
      <aside
        className="w-56 shrink-0 border-r p-4"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <p
          className="mb-4 px-3 text-sm font-semibold"
          style={{ fontFamily: "var(--brand-font-heading)" }}
        >
          {"Imperial metric conversion webapp"}
        </p>
        <nav className="flex flex-col gap-1">
          <NavLink to="/converter" className={navLinkClass}>
            {"Converter"}
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/converter" element={<Converter />} />
          <Route path="*" element={<Navigate to="/converter" replace />} />
        </Routes>
      </main>
    </div>
  );
}
