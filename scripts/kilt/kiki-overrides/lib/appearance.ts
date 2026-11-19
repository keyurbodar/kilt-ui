import { useSyncExternalStore } from "react";

export type ColorMode = "light" | "dark";

const read = (): ColorMode =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

/** The page's resolved colour mode, from the `.dark` class on <html>. */
export function useAppearance(): { mode: ColorMode } {
  return { mode: useSyncExternalStore(subscribe, read, () => "dark") };
}
