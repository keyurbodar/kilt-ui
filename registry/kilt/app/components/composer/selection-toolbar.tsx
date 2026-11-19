// Vendored from Kiki (components/composer/selection-toolbar.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/registry/kilt/app/primitives/button";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { toast } from "@/registry/kilt/app/primitives/toaster";
import { ShortcutTooltip } from "./shortcut-tooltip";

const TOOLBAR_BASE_WIDTH = 72;
const TOOLBAR_HEIGHT = 38;
const TOOLBAR_GAP = 6;
const TOOLBAR_EDGE = 8;
const ACTIONS_WIDTH = 30;

export type TextSelectionInfo = {
  text: string;
  rect: { top: number; height: number };
  focus: { x: number };
};

export type SelectionToolbarProps = Omit<ComponentProps<"div">, "children"> & {
  selection?: TextSelectionInfo;
  onComment?: () => void;
  commentShortcut?: string | null;
  onCopy?: () => void;
  copy?: { label: string; run: () => void };
  actions?: ReactNode;
  actionsWidth?: number;
  side?: "above" | "below";
  align?: "start" | "center" | "end";
  bottom?: number;
  container?: HTMLElement | null;
};

export function placeSelectionToolbar(
  selection: TextSelectionInfo,
  viewport: { width: number; height: number },
  options: {
    width: number;
    side: "above" | "below";
    align: "start" | "center" | "end";
    bottom?: number;
  },
) {
  const above = selection.rect.top - TOOLBAR_GAP - TOOLBAR_HEIGHT;
  const below = selection.rect.top + selection.rect.height + TOOLBAR_GAP;
  const limit =
    Math.min(options.bottom ?? viewport.height, viewport.height) -
    TOOLBAR_EDGE -
    TOOLBAR_HEIGHT;
  const top = Math.min(
    Math.max(
      TOOLBAR_EDGE,
      options.side === "below"
        ? below <= limit
          ? below
          : above
        : above >= TOOLBAR_EDGE
          ? above
          : below,
    ),
    limit,
  );
  if (options.align === "end")
    return {
      top,
      right: Math.max(
        TOOLBAR_EDGE,
        Math.min(
          viewport.width - selection.focus.x,
          viewport.width - options.width - TOOLBAR_EDGE,
        ),
      ),
    };
  const start =
    options.align === "start"
      ? selection.focus.x
      : selection.focus.x - options.width / 2;
  return {
    top,
    left: Math.min(
      Math.max(TOOLBAR_EDGE, start),
      viewport.width - options.width - TOOLBAR_EDGE,
    ),
  };
}

export function SelectionToolbar({
  selection,
  onComment,
  commentShortcut,
  onCopy,
  copy,
  actions,
  actionsWidth = ACTIONS_WIDTH,
  side = "above",
  align = "center",
  bottom,
  container,
  style,
  ...rest
}: SelectionToolbarProps) {
  if (selection === undefined) return null;
  const place = placeSelectionToolbar(
    selection,
    { width: window.innerWidth, height: window.innerHeight },
    {
      width: TOOLBAR_BASE_WIDTH + (actions === undefined ? 0 : actionsWidth),
      side,
      align,
      bottom,
    },
  );
  const copySelection = () => {
    navigator.clipboard.writeText(selection.text).then(
      () => toast.success("Copied"),
      () => toast.error("Could not copy"),
    );
    onCopy?.();
  };
  const comment = (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Comment"
      onClick={onComment}
    >
      <Icon name="bubble-wide" size="sm" />
    </Button>
  );
  return createPortal(
    <div
      data-slot="selection-toolbar"
      {...rest}
      className="fixed z-(--z-overlay-content) flex items-center gap-0.5 rounded-(--radius-overlay) border-(length:--border-width-hairline) border-border-2 bg-popover p-1 shadow-overlay"
      style={{ ...style, ...place }}
      onPointerUp={(event) => event.stopPropagation()}
    >
      {commentShortcut === undefined ? (
        comment
      ) : (
        <ShortcutTooltip
          label="Comment"
          shortcut={commentShortcut}
          side={place.top < selection.rect.top ? "top" : "bottom"}
        >
          {comment}
        </ShortcutTooltip>
      )}
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={copy?.label ?? "Copy"}
        onClick={copy?.run ?? copySelection}
      >
        <Icon name="square-behind-square-2" size="sm" />
      </Button>
      {actions}
    </div>,
    container ?? document.body,
  );
}
