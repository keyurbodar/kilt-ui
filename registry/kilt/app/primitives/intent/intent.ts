// Vendored from Kiki (primitives/intent/intent.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export const intents = [
  "neutral",
  "accent",
  "danger",
  "warning",
  "success",
  "info",
  "purple",
  "pink",
  "orange",
  "lime",
] as const;

export type Intent = (typeof intents)[number];

const onFill = "[--intent-text-on-bg:light-dark(var(--fg),var(--bg))]";
const tinted = (color: string) =>
  `[--intent-text:var(--${color})] [--intent-text-hover:color-mix(in_oklch,var(--${color})_80%,transparent)] [--intent-bg:var(--${color})] ${onFill}`;

export const intentVariants: Record<Intent, string> = {
  neutral: "",
  accent:
    "[--intent-text:var(--primary-ink)] [--intent-text-hover:color-mix(in_oklch,var(--primary-ink)_80%,transparent)] [--intent-bg:var(--primary)] [--intent-text-on-bg:var(--primary-text)] [--intent-border-solid:color-mix(in_oklch,var(--primary)_80%,black)] [--intent-highlight:--alpha(var(--color-white)/12%)]",
  danger:
    "[--intent-text:var(--destructive)] [--intent-text-hover:color-mix(in_oklch,var(--destructive)_80%,transparent)] [--intent-bg:var(--destructive)] [--intent-text-on-bg:var(--destructive-text)] [--intent-border-solid:color-mix(in_oklch,var(--destructive)_80%,black)] [--intent-highlight:--alpha(var(--color-white)/12%)]",
  warning:
    "[--intent-text:var(--warning-fg)] [--intent-text-hover:color-mix(in_oklch,var(--warning-fg)_80%,transparent)] [--intent-bg:var(--warning)] " +
    onFill,
  success:
    "[--intent-text:light-dark(var(--success),color-mix(in_oklch,var(--success)_72%,white))] [--intent-text-hover:color-mix(in_oklch,var(--success)_80%,transparent)] [--intent-bg:var(--success)] " +
    onFill,
  info: tinted("info"),
  purple: tinted("purple"),
  pink: tinted("pink"),
  orange: tinted("orange"),
  lime: tinted("lime"),
};

export const buttonIntentVariants: Record<Intent, string> = {
  ...intentVariants,
  accent:
    "[--intent-bg:var(--primary)] [--intent-bg-soft:var(--primary-soft)] [--intent-bg-soft-hover:var(--primary-soft-hover)] [--intent-text:var(--primary-ink)] [--intent-text-on-bg:var(--primary-text)] [--intent-text-hover:var(--primary-ink)] [--intent-border:var(--border-2)] [--intent-border-solid:color-mix(in_oklch,var(--primary)_80%,black)] [--intent-highlight:--alpha(var(--color-white)/12%)] [--intent-bg-hover:var(--primary-soft)] [--intent-bg-solid-hover:color-mix(in_oklch,var(--primary)_92%,black)]",
  danger:
    "[--intent-bg:var(--destructive)] [--intent-bg-soft:var(--destructive-soft)] [--intent-bg-soft-hover:var(--destructive-soft-hover)] [--intent-text:var(--destructive)] [--intent-text-on-bg:var(--destructive-text)] [--intent-text-hover:var(--destructive)] [--intent-border:var(--border-2)] [--intent-border-solid:color-mix(in_oklch,var(--destructive)_80%,black)] [--intent-highlight:--alpha(var(--color-white)/12%)] [--intent-bg-hover:var(--destructive-soft)] [--intent-bg-solid-hover:color-mix(in_oklch,var(--destructive)_92%,white)]",
};
