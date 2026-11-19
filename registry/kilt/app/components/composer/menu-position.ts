// Vendored from Kiki (components/composer/menu-position.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export const MENU_EDGE_GAP = 8;
export const MENU_ANCHOR_GAP = 6;
export const MENU_MIN_HEIGHT = 240;
export const MENU_VIEWPORT_INSET = 12;
export const MENU_WIDTH = 320;
export const MENTION_MENU_MAX_HEIGHT = 480;
export const COMMAND_MENU_MAX_HEIGHT = 320;

export type CaretRect = { left: number; top: number; bottom: number };

export type MenuPlacement = {
  left: number;
  top: number | undefined;
  bottom: number | undefined;
  maxHeight: number;
};

export function placeCaretMenu(
  caret: CaretRect,
  viewport: { width: number; height: number },
  bounds: { top: number; bottom: number } | undefined,
  size: { width: number; maxHeight: number },
): MenuPlacement {
  const minTop = Math.max(bounds?.top ?? 0, 0) + MENU_EDGE_GAP;
  const maxBottom =
    Math.min(bounds?.bottom ?? viewport.height, viewport.height) -
    MENU_EDGE_GAP;
  const left = Math.max(
    MENU_VIEWPORT_INSET,
    Math.min(caret.left, viewport.width - size.width - MENU_VIEWPORT_INSET),
  );
  const below = maxBottom - caret.bottom - MENU_ANCHOR_GAP;
  const above = caret.top - MENU_ANCHOR_GAP - minTop;
  const openBelow = below >= size.maxHeight || below > above;
  const maxHeight = Math.max(
    Math.min(MENU_MIN_HEIGHT, size.maxHeight),
    Math.min(size.maxHeight, openBelow ? below : above),
  );
  return openBelow
    ? {
        left,
        top: caret.bottom + MENU_ANCHOR_GAP,
        bottom: undefined,
        maxHeight,
      }
    : {
        left,
        top: undefined,
        bottom: viewport.height - caret.top + MENU_ANCHOR_GAP,
        maxHeight,
      };
}

export function placeMenuInWindow(
  caret: CaretRect,
  root: Element | null,
  size: { width: number; maxHeight: number },
) {
  return placeCaretMenu(
    caret,
    { width: window.innerWidth, height: window.innerHeight },
    root?.closest('[data-slot="sidebar-panel"]')?.getBoundingClientRect(),
    size,
  );
}
