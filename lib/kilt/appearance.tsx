"use client";

import { useCallback, useEffect, useState } from "react";
import type { BackdropEffect } from "@/registry/kilt/dither";
import { kiltThemes, type KiltThemeId } from "@/registry/kilt/themes";

export interface KiltAppearance {
  theme: KiltThemeId;
  effect: BackdropEffect;
  density: "default" | "touch";
}

const KEY = "kilt:appearance";
const DEFAULTS: KiltAppearance = { theme: "cds", effect: "dither", density: "default" };
const EVENT = "kilt:appearance";

function read(): KiltAppearance {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

/** Apply to <html>: data-color-theme (none for the CDS default) and data-density. */
function apply({ theme, density }: KiltAppearance) {
  const root = document.documentElement;
  if (theme === "cds") root.removeAttribute("data-color-theme");
  else root.setAttribute("data-color-theme", theme);
  if (density === "touch") root.setAttribute("data-density", "touch");
  else root.removeAttribute("data-density");
}

/** The site's kilt appearance: colour theme, backdrop effect and density, persisted and shared across hooks. */
export function useKiltAppearance() {
  const [state, setState] = useState<KiltAppearance>(DEFAULTS);
  useEffect(() => {
    const sync = () => {
      const next = read();
      setState(next);
      apply(next);
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const update = useCallback((patch: Partial<KiltAppearance>) => {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const theme = kiltThemes.find((t) => t.id === state.theme) ?? kiltThemes[0];
  return { ...state, themeEntry: theme, update };
}
