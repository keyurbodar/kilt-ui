// Vendored from Kiki (components/composer/drop-targets.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { RefObject } from "react";

/*
 * Several composers can be mounted at once (thread, side thread, pane). A drop
 * goes to the composer under the pointer, else the one mounted last. Same
 * bookkeeping as Capy's composer.
 */

const roots = new Map<string, RefObject<HTMLElement | null>>();
let active: string | undefined;

export const registerDropTarget = (
  id: string,
  root: RefObject<HTMLElement | null>,
) => {
  roots.set(id, root);
  active = id;
  return () => {
    roots.delete(id);
    if (active === id) active = Array.from(roots.keys()).at(-1);
  };
};

export const dropTargetFor = (target: EventTarget | null) => {
  if (!(target instanceof Node)) return active;
  const visible = Array.from(roots).flatMap(([id, root]) =>
    root.current?.checkVisibility() === true
      ? [{ id, root: root.current }]
      : [],
  );
  for (let node: Node | null = target; node !== null; node = node.parentNode) {
    const container = node;
    const inside = visible.filter((entry) => container.contains(entry.root));
    if (inside.length > 0)
      return (
        inside.find((entry) => entry.id === active)?.id ?? inside.at(-1)?.id
      );
  }
  return active;
};
