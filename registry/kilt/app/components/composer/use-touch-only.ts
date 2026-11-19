// Vendored from Kiki (components/composer/use-touch-only.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useSyncExternalStore } from "react";

const TOUCH_ONLY_QUERY = "(hover: none) and (pointer: coarse)";
let query: MediaQueryList | undefined;
const media = () => {
  query ??= window.matchMedia(TOUCH_ONLY_QUERY);
  return query;
};

const subscribe = (listener: () => void) => {
  const list = media();
  list.addEventListener("change", listener);
  return () => list.removeEventListener("change", listener);
};

export const useTouchOnly = () =>
  useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false,
  );
