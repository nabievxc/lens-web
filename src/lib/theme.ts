"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "lens-theme";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

const read = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark");

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "light");
}

/** The theme the head script applies: day mode unless the visitor picked dark. */
export function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function setTheme(t: Theme) {
  document.documentElement.classList.toggle("light", t === "light");
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
}
