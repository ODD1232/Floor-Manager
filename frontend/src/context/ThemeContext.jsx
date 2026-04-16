import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = {
  dark: {
    label: "Dark",
    icon: "🌙",
    vars: {
      "--bg-root": "#0b1220",
      "--bg-topbar": "#111827",
      "--bg-sidebar": "#0f172a",
      "--bg-card": "#111827",
      "--bg-card-soft": "#172033",
      "--bg-input": "#0f172a",
      "--bg-input-focus": "#111c33",
      "--bg-btn-logout": "#182235",
      "--bg-blank-icon": "rgba(99,102,241,0.16)",
      "--bg-toast-success": "rgba(34,197,94,0.12)",
      "--bg-toast-error": "rgba(239,68,68,0.12)",
      "--border-main": "rgba(148,163,184,0.18)",
      "--border-input": "rgba(148,163,184,0.22)",
      "--border-btn": "rgba(148,163,184,0.22)",
      "--border-blank-icon": "rgba(99,102,241,0.28)",
      "--border-toast-ok": "rgba(34,197,94,0.28)",
      "--border-toast-err": "rgba(239,68,68,0.28)",
      "--border-nav-active": "rgba(99,102,241,0.36)",
      "--text-primary": "#f8fafc",
      "--text-secondary": "#cbd5e1",
      "--text-muted": "#94a3b8",
      "--text-label": "#e2e8f0",
      "--text-placeholder": "#64748b",
      "--text-input": "#f8fafc",
      "--text-accent": "#a5b4fc",
      "--text-toast-ok": "#bbf7d0",
      "--text-toast-err": "#fecaca",
      "--nav-hover-bg": "rgba(99,102,241,0.14)",
      "--nav-hover-color": "#eef2ff",
      "--nav-active-bg": "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.18))",
      "--nav-active-color": "#ffffff",
      "--ring-focus": "rgba(99,102,241,0.22)",
      "--option-bg": "#0f172a",
      "--shadow-card": "0 18px 40px rgba(2, 6, 23, 0.35)",
      "--shadow-soft": "0 10px 26px rgba(2, 6, 23, 0.22)",
    },
  },

  light: {
    label: "Light",
    icon: "☀️",
    vars: {
      "--bg-root": "#f3f6fb",
      "--bg-topbar": "rgba(255,255,255,0.92)",
      "--bg-sidebar": "#ffffff",
      "--bg-card": "#ffffff",
      "--bg-card-soft": "#f8fafc",
      "--bg-input": "#ffffff",
      "--bg-input-focus": "#f5f7ff",
      "--bg-btn-logout": "#ffffff",
      "--bg-blank-icon": "rgba(99,102,241,0.10)",
      "--bg-toast-success": "rgba(34,197,94,0.10)",
      "--bg-toast-error": "rgba(239,68,68,0.10)",
      "--border-main": "rgba(15,23,42,0.10)",
      "--border-input": "rgba(15,23,42,0.14)",
      "--border-btn": "rgba(15,23,42,0.12)",
      "--border-blank-icon": "rgba(99,102,241,0.22)",
      "--border-toast-ok": "rgba(34,197,94,0.26)",
      "--border-toast-err": "rgba(239,68,68,0.26)",
      "--border-nav-active": "rgba(99,102,241,0.22)",
      "--text-primary": "#0f172a",
      "--text-secondary": "#334155",
      "--text-muted": "#475569",
      "--text-label": "#1e293b",
      "--text-placeholder": "#64748b",
      "--text-input": "#0f172a",
      "--text-accent": "#4f46e5",
      "--text-toast-ok": "#166534",
      "--text-toast-err": "#991b1b",
      "--nav-hover-bg": "#eef2ff",
      "--nav-hover-color": "#312e81",
      "--nav-active-bg": "linear-gradient(135deg, #111827, #1f2937)",
      "--nav-active-color": "#ffffff",
      "--ring-focus": "rgba(79,70,229,0.16)",
      "--option-bg": "#ffffff",
      "--shadow-card": "0 16px 38px rgba(15, 23, 42, 0.08)",
      "--shadow-soft": "0 8px 24px rgba(15, 23, 42, 0.06)",
    },
  },

  midnight: {
    label: "Midnight",
    icon: "🌌",
    vars: {
      "--bg-root": "#050816",
      "--bg-topbar": "#0b1020",
      "--bg-sidebar": "#08101d",
      "--bg-card": "#0f172a",
      "--bg-card-soft": "#131e35",
      "--bg-input": "#0d1529",
      "--bg-input-focus": "#18213b",
      "--bg-btn-logout": "#162033",
      "--bg-blank-icon": "rgba(139,92,246,0.14)",
      "--bg-toast-success": "rgba(16,185,129,0.12)",
      "--bg-toast-error": "rgba(239,68,68,0.12)",
      "--border-main": "rgba(148,163,184,0.16)",
      "--border-input": "rgba(148,163,184,0.20)",
      "--border-btn": "rgba(148,163,184,0.18)",
      "--border-blank-icon": "rgba(139,92,246,0.24)",
      "--border-toast-ok": "rgba(16,185,129,0.28)",
      "--border-toast-err": "rgba(239,68,68,0.28)",
      "--border-nav-active": "rgba(139,92,246,0.34)",
      "--text-primary": "#eef2ff",
      "--text-secondary": "#cbd5e1",
      "--text-muted": "#94a3b8",
      "--text-label": "#e2e8f0",
      "--text-placeholder": "#64748b",
      "--text-input": "#eef2ff",
      "--text-accent": "#c4b5fd",
      "--text-toast-ok": "#a7f3d0",
      "--text-toast-err": "#fecaca",
      "--nav-hover-bg": "rgba(139,92,246,0.14)",
      "--nav-hover-color": "#f5f3ff",
      "--nav-active-bg": "linear-gradient(135deg, rgba(139,92,246,0.24), rgba(79,70,229,0.20))",
      "--nav-active-color": "#ffffff",
      "--ring-focus": "rgba(139,92,246,0.22)",
      "--option-bg": "#0b1020",
      "--shadow-card": "0 20px 44px rgba(0, 0, 0, 0.40)",
      "--shadow-soft": "0 12px 28px rgba(0, 0, 0, 0.24)",
    },
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("dash-theme") || "light");

  useEffect(() => {
    const vars = THEMES[theme]?.vars || THEMES.light.vars;
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