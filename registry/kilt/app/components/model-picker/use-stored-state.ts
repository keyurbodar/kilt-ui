// Vendored from Kiki (components/model-picker/use-stored-state.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const read = (key: string) => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export function useStoredState<T>(
  key: string,
  fallback: T,
  accept: (value: unknown) => value is T,
): readonly [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  let value = fallback;
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (accept(parsed)) value = parsed;
    } catch {}
  }
  const set = useCallback(
    (next: T) => {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(next));
      } catch {}
      for (const listener of listeners) listener();
    },
    [key],
  );
  return [value, set] as const;
}
