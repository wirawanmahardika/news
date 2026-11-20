"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribeTheme(callback: () => void) {
  window.addEventListener("abnews-theme-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("abnews-theme-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("abnews-theme", next);
    window.dispatchEvent(new Event("abnews-theme-changed"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost ${compact ? "btn-square btn-sm" : "btn-sm gap-2"}`}
      aria-label="Ganti tema Light / Dark"
      title={`Tema: ${theme === "dark" ? "Dark" : "Light"}`}
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-warning" />
      ) : (
        <Moon className="size-4" />
      )}
      {!compact && (
        <span className="hidden sm:inline text-xs font-medium">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
