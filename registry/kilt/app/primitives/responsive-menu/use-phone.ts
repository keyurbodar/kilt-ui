// Vendored from Kiki (primitives/responsive-menu/use-phone.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useSyncExternalStore } from "react";

const touchQuery = "(hover: none) and (pointer: coarse)";

const narrowQuery = () =>
  `(width < ${getComputedStyle(document.documentElement).getPropertyValue("--breakpoint-md").trim()})`;

function mediaQueryStore(query: () => string) {
  let list: MediaQueryList | null = null;
  const media = () => {
    list ??= window.matchMedia(query());
    return list;
  };
  return {
    subscribe: (onChange: () => void) => {
      const current = media();
      current.addEventListener("change", onChange);
      return () => current.removeEventListener("change", onChange);
    },
    getSnapshot: () => media().matches,
    getServerSnapshot: () => false,
  };
}

const narrow = mediaQueryStore(narrowQuery);
const touch = mediaQueryStore(() => touchQuery);

export function usePhone() {
  const isNarrow = useSyncExternalStore(
    narrow.subscribe,
    narrow.getSnapshot,
    narrow.getServerSnapshot,
  );
  const isTouch = useSyncExternalStore(
    touch.subscribe,
    touch.getSnapshot,
    touch.getServerSnapshot,
  );
  return isNarrow && isTouch;
}
