// Vendored from Kiki (lib/motion/reduced-motion.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

/** Runs `setup` now and again whenever the reduced-motion preference flips. */
export function onReducedMotionChange(
  setup: (reduced: boolean) => void,
): () => void {
  const query = window.matchMedia(QUERY);
  const run = () => setup(query.matches);
  run();
  query.addEventListener("change", run);
  return () => query.removeEventListener("change", run);
}
