// Vendored from Kiki (components/markdown-chips/classes.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
/** Class strings from Capy's shared/markdown/chips.tsx, verbatim. */
export const chipTextClass =
  "text-(--text-link) [-webkit-text-fill-color:currentColor]";

export const chipLinkClass = `${chipTextClass} focus-gutter cursor-pointer rounded-sm outline-none hover:underline underline-offset-2 focus-visible:outline-ring-inset`;

export const chipAmbiguousClass =
  "focus-gutter cursor-default rounded-sm underline decoration-muted-foreground-3 decoration-dotted underline-offset-2 outline-none focus-visible:outline-ring-inset";

export const chipIconClass = "mr-1 inline size-3 shrink-0 align-[-0.115em]";

export const chipFileTextClass = `${chipTextClass} break-all`;

export const chipDashedClass = "underline decoration-dashed underline-offset-2";

export const chipCaptainAvatarClass =
  "mr-1 inline-flex shrink-0 align-baseline";

export const chipSlackClass = `${chipLinkClass} relative whitespace-nowrap pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2`;

/** ui/preview-card PreviewCardContent: popup surface, motion and default size. */
export const chipPreviewCardClass =
  "rounded-(--radius-overlay) border-hairline border-border-2 bg-popover text-foreground shadow-overlay origin-(--transform-origin) outline-none transition-[opacity,scale] duration-fast ease-out-quint data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:duration-(--duration-exit) data-[instant]:transition-none flex max-h-(--available-height) w-72 flex-col overflow-hidden p-3";

/** ui/tooltip TooltipContent popup. */
export const chipTooltipClass =
  "w-fit max-w-xs rounded bg-popover border-hairline border-border-2 shadow-overlay px-2 py-1 text-xs font-medium text-balance text-foreground data-[open]:animate-tooltip-in data-[closed]:animate-tooltip-out data-[instant]:animate-none";

export const chipPositionerClass = "z-(--z-overlay-content) outline-none";
