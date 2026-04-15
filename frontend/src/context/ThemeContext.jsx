import { createContext, useContext, useEffect, useState } from "react";

// ─── Available themes ──────────────────────────────────────────────────────────
// Add more themes here anytime — just add a key + CSS variable values below
export const THEMES = {
  dark: {
    label: "Dark",
    icon: "🌙",
    vars: {
      "--bg-root":          "#0c0f1a",
      "--bg-topbar":        "rgba(255,255,255,0.03)",
      "--bg-sidebar":       "rgba(255,255,255,0.02)",
      "--bg-input":         "rgba(255,255,255,0.04)",
      "--bg-input-focus":   "rgba(99,102,241,0.05)",
      "--bg-btn-logout":    "rgba(255,255,255,0.05)",
      "--bg-blank-icon":    "rgba(99,102,241,0.12)",
      "--bg-toast-success": "rgba(34,197,94,0.10)",
      "--bg-toast-error":   "rgba(239,68,68,0.10)",
      "--border-main":      "rgba(255,255,255,0.07)",
      "--border-input":     "rgba(255,255,255,0.10)",
      "--border-btn":       "rgba(255,255,255,0.10)",
      "--border-blank-icon":"rgba(99,102,241,0.20)",
      "--border-toast-ok":  "rgba(34,197,94,0.25)",
      "--border-toast-err": "rgba(239,68,68,0.25)",
      "--border-nav-active":"rgba(99,102,241,0.30)",
      "--text-primary":     "#f1f5f9",
      "--text-secondary":   "#94a3b8",
      "--text-muted":       "#64748b",
      "--text-label":       "#475569",
      "--text-placeholder": "#334155",
      "--text-input":       "#f1f5f9",
      "--text-accent":      "#818cf8",
      "--text-toast-ok":    "#86efac",
      "--text-toast-err":   "#fca5a5",
      "--nav-hover-bg":     "rgba(99,102,241,0.08)",
      "--nav-hover-color":  "#c7d2fe",
      "--nav-active-bg":    "rgba(99,102,241,0.15)",
      "--nav-active-color": "#a5b4fc",
      "--ring-focus":       "rgba(99,102,241,0.12)",
      "--option-bg":        "#1e293b",
    },
  },
  light: {
    label: "Light",
    icon: "☀️",
    vars: {
      "--bg-root":          "#f8fafc",
      "--bg-topbar":        "rgba(255,255,255,0.85)",
      "--bg-sidebar":       "rgba(241,245,249,0.8)",
      "--bg-input":         "#ffffff",
      "--bg-input-focus":   "rgba(99,102,241,0.04)",
      "--bg-btn-logout":    "rgba(0,0,0,0.04)",
      "--bg-blank-icon":    "rgba(99,102,241,0.08)",
      "--bg-toast-success": "rgba(34,197,94,0.08)",
      "--bg-toast-error":   "rgba(239,68,68,0.08)",
      "--border-main":      "rgba(0,0,0,0.08)",
      "--border-input":     "rgba(0,0,0,0.12)",
      "--border-btn":       "rgba(0,0,0,0.10)",
      "--border-blank-icon":"rgba(99,102,241,0.20)",
      "--border-toast-ok":  "rgba(34,197,94,0.30)",
      "--border-toast-err": "rgba(239,68,68,0.30)",
      "--border-nav-active":"rgba(99,102,241,0.30)",
      "--text-primary":     "#0f172a",
      "--text-secondary":   "#475569",
      "--text-muted":       "#94a3b8",
      "--text-label":       "#64748b",
      "--text-placeholder": "#94a3b8",
      "--text-input":       "#0f172a",
      "--text-accent":      "#6366f1",
      "--text-toast-ok":    "#166534",
      "--text-toast-err":   "#991b1b",
      "--nav-hover-bg":     "rgba(99,102,241,0.07)",
      "--nav-hover-color":  "#4338ca",
      "--nav-active-bg":    "rgba(99,102,241,0.12)",
      "--nav-active-color": "#4338ca",
      "--ring-focus":       "rgba(99,102,241,0.15)",
      "--option-bg":        "#ffffff",
    },
  },
  midnight: {
    label: "Midnight",
    icon: "🌌",
    vars: {
      "--bg-root":          "#050810",
      "--bg-topbar":        "rgba(5,8,16,0.95)",
      "--bg-sidebar":       "rgba(255,255,255,0.015)",
      "--bg-input":         "rgba(255,255,255,0.03)",
      "--bg-input-focus":   "rgba(139,92,246,0.06)",
      "--bg-btn-logout":    "rgba(255,255,255,0.04)",
      "--bg-blank-icon":    "rgba(139,92,246,0.10)",
      "--bg-toast-success": "rgba(16,185,129,0.10)",
      "--bg-toast-error":   "rgba(239,68,68,0.10)",
      "--border-main":      "rgba(255,255,255,0.05)",
      "--border-input":     "rgba(255,255,255,0.07)",
      "--border-btn":       "rgba(255,255,255,0.07)",
      "--border-blank-icon":"rgba(139,92,246,0.18)",
      "--border-toast-ok":  "rgba(16,185,129,0.25)",
      "--border-toast-err": "rgba(239,68,68,0.25)",
      "--border-nav-active":"rgba(139,92,246,0.30)",
      "--text-primary":     "#e2e8f0",
      "--text-secondary":   "#7c8a9e",
      "--text-muted":       "#4a5568",
      "--text-label":       "#3d4a5c",
      "--text-placeholder": "#2d3748",
      "--text-input":       "#e2e8f0",
      "--text-accent":      "#a78bfa",
      "--text-toast-ok":    "#6ee7b7",
      "--text-toast-err":   "#fca5a5",
      "--nav-hover-bg":     "rgba(139,92,246,0.08)",
      "--nav-hover-color":  "#c4b5fd",
      "--nav-active-bg":    "rgba(139,92,246,0.14)",
      "--nav-active-color": "#a78bfa",
      "--ring-focus":       "rgba(139,92,246,0.12)",
      "--option-bg":        "#0d1117",
    },
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("dash-theme") || "dark"
  );

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const vars = THEMES[theme]?.vars || THEMES.dark.vars;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
    localStorage.setItem("dash-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}