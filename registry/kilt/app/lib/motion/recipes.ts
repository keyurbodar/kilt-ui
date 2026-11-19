// Vendored from Kiki (lib/motion/recipes.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
/**
 * Capy's interaction and enter/exit class strings, copied from its bundle with
 * its arbitrary timings mapped onto KIKI-10's duration tokens (exit, collapse,
 * preview delay). Compose them with cva/cx in primitives.
 */
export const motion = {
  /** Keyboard focus ring (Capy's outline-ring-inset, a hairline inset outline). */
  focusRing: "outline-none focus-visible:outline-ring-inset",
  /** Room for the focus ring around inline text controls. */
  focusGutter: "focus-gutter",
  /** Colour transition shared by hoverable rows and controls. */
  hover: "transition-colors duration-100",
  /** Press feedback used by every Button variant. */
  press: "active:brightness-97",
  disabled:
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
  /** 44x44 hit area on touch screens for small controls. */
  touchTarget:
    "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2",

  /** Menu, popover, select and combobox popups (Base UI Popup). */
  popup:
    "origin-(--transform-origin) outline-none transition-[opacity,scale] duration-fast ease-out-quint data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:duration-exit data-[instant]:transition-none",
  /** Dialog popup. */
  dialog:
    "transition-[opacity,scale] duration-base ease-out-quint data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-fast",
  /** Dialog, sheet and drawer backdrops. */
  backdrop:
    "transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-fast",
  /** Plain fade for small popups (preview cards, hints). */
  fade: "transition-opacity duration-fast ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-exit",
  /** Bottom sheet / drawer sliding up. */
  sheetUp:
    "transition-[translate,opacity] duration-base ease-out-quint data-[starting-style]:translate-y-full data-[starting-style]:opacity-0 data-[ending-style]:translate-y-full data-[ending-style]:opacity-0 data-[ending-style]:duration-fast",
  /** Tooltip popup (keyframe animations, instant when skipping delay). */
  tooltip:
    "data-[open]:animate-tooltip-in data-[closed]:animate-tooltip-out data-[instant]:animate-none",
  /** Collapsible panel height (Base UI --collapsible-panel-height). */
  collapsible:
    "transition-[height,opacity] duration-fast ease-out-quint motion-reduce:transition-none data-[starting-style]:h-0 data-[starting-style]:opacity-0 data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-exit",
  /** Nested menu / dialog page stack (data-nav="push" | "pop"). */
  navStack:
    "transition-[opacity,translate] duration-fast ease-out-quint data-[nav=push]:starting:translate-x-2 data-[nav=push]:starting:opacity-0 data-[nav=pop]:starting:-translate-x-2 data-[nav=pop]:starting:opacity-0",
  /** CSS-only mount fade for content that appears without Base UI. */
  enter:
    "motion-safe:transition-opacity motion-safe:duration-fast motion-safe:ease-out-quint motion-safe:starting:opacity-0",
  /** Mount fade that rises one spacing step (page bodies, onboarding steps). */
  enterRise:
    "transition-[opacity,translate] duration-base ease-out-quint starting:opacity-0 motion-safe:starting:translate-y-1",
  /** Delayed reveal for loading placeholders so fast loads never flash. */
  delayedReveal:
    "opacity-100 transition-opacity delay-preview duration-base ease-out-quint starting:opacity-0",
  /** Looping skeleton pulse. */
  skeletonPulse: "animate-skeleton-pulse h-full motion-reduce:animate-none",
} as const;

export type MotionRecipe = keyof typeof motion;
