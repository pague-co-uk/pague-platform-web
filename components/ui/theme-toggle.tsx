"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Theme = "blue" | "pague";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "blue", toggle: () => {} });

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  const [theme, setTheme] = useState(initialTheme);
  function toggle() {
    const next = theme === "blue" ? "pague" : "blue";
    document.documentElement.dataset.theme = next;
    document.cookie = `pague-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setTheme(next);
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button type="button" onClick={toggle} aria-pressed={theme === "pague"}
      aria-label={`Switch to ${theme === "blue" ? "Pague rose" : "Blue"} theme`}
      title={`Current theme: ${theme === "blue" ? "Blue" : "Pague rose"}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500">
      <span aria-hidden="true" className="flex -space-x-1">
        <span className="size-3 rounded-full bg-[#e94f87] ring-1 ring-white" />
        <span className="size-3 rounded-full bg-[#ffc2a0] ring-1 ring-white" />
      </span>
      <span className="hidden sm:inline">{theme === "blue" ? "Blue" : "Pague rose"}</span>
    </button>
  );
}
