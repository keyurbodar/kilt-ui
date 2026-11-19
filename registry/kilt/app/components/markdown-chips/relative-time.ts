// Vendored from Kiki (components/markdown-chips/relative-time.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const year = 365 * day;

/** Capy's relative time label: "just now", "5m ago", "in 2h". */
export function relativeTime(at: number, now: number): string {
  const delta = now - at;
  const size = Math.abs(delta);
  if (size < 5 * second) return "just now";
  const label =
    size < minute
      ? `${Math.floor(size / second)}s`
      : size < hour
        ? `${Math.floor(size / minute)}m`
        : size < day
          ? `${Math.floor(size / hour)}h`
          : size < week
            ? `${Math.floor(size / day)}d`
            : size < year
              ? `${Math.floor(size / week)}w`
              : `${Math.floor(size / year)}y`;
  return delta < 0 ? `in ${label}` : `${label} ago`;
}
