// Vendored from Kiki (components/markdown-chips/delay.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useEffect, useState } from "react";

/**
 * A motion token's value in milliseconds, read from the document once it is in
 * the browser. Open delays are token-driven (motion.css), never literals; until
 * the token resolves (or where there is no document) the trigger opens at once.
 */
export function useMotionDelayMs(token: string): number {
  const [delay, setDelay] = useState(0);
  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      token,
    );
    const seconds = Number.parseFloat(value);
    if (Number.isFinite(seconds)) setDelay(seconds * 1000);
  }, [token]);
  return delay;
}
