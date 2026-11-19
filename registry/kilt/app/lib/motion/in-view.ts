// Vendored from Kiki (lib/motion/in-view.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
/**
 * One shared IntersectionObserver plus page visibility, as Capy uses to pause
 * looping animations (shimmer text, dot grids) that are off screen or hidden.
 */
type Entry = { inView: boolean; listeners: Set<(active: boolean) => void> };

const entries = new Map<Element, Entry>();
let observer: IntersectionObserver | null = null;

const pageVisible = () => document.visibilityState === "visible";

const notifyAll = () => {
  for (const entry of entries.values())
    for (const listener of entry.listeners)
      listener(entry.inView && pageVisible());
};

const onIntersect = (records: IntersectionObserverEntry[]) => {
  for (const record of records) {
    const entry = entries.get(record.target);
    if (entry === undefined) continue;
    entry.inView = record.isIntersecting;
    for (const listener of entry.listeners)
      listener(entry.inView && pageVisible());
  }
};

/** Calls `listener(active)` whenever `el` enters/leaves the viewport or the tab hides. */
export function observeActive(
  el: Element,
  listener: (active: boolean) => void,
): () => void {
  if (observer === null) {
    observer = new IntersectionObserver(onIntersect);
    document.addEventListener("visibilitychange", notifyAll);
  }
  const entry = entries.get(el) ?? { inView: false, listeners: new Set() };
  if (entry.listeners.size === 0) {
    entries.set(el, entry);
    observer.observe(el);
  }
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size > 0) return;
    entries.delete(el);
    observer?.unobserve(el);
    if (entries.size > 0) return;
    observer?.disconnect();
    observer = null;
    document.removeEventListener("visibilitychange", notifyAll);
  };
}
