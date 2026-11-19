// Vendored from Kiki (lib/cn.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export const cn = (
  ...parts: ReadonlyArray<string | false | null | undefined>
): string => parts.filter(Boolean).join(" ");
