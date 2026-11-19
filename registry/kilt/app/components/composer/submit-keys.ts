// Vendored from Kiki (components/composer/submit-keys.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComposerDelivery, ComposerInputPrefs } from "./types";

export const DEFAULT_INPUT_PREFS: ComposerInputPrefs = {
  enter: "steer",
  modEnter: "interrupt",
  altEnter: "queue",
};

export type EnterKeyInput = ComposerInputPrefs & {
  touchOnly: boolean;
  shiftKey: boolean;
  modKey: boolean;
  altKey: boolean;
  isComposing: boolean;
};

export type EnterKeyResult =
  | { kind: "pass" }
  | { kind: "newline" }
  | { kind: "submit"; delivery: ComposerDelivery };

export function resolveEnterKey(input: EnterKeyInput): EnterKeyResult {
  if (input.isComposing || input.touchOnly) return { kind: "pass" };
  if (input.altKey) return { kind: "submit", delivery: input.altEnter };
  if (input.modKey) return { kind: "submit", delivery: input.modEnter };
  if (input.shiftKey)
    return input.enter === "newline" ? { kind: "pass" } : { kind: "newline" };
  return input.enter === "newline"
    ? { kind: "pass" }
    : { kind: "submit", delivery: input.enter };
}

export const defaultDelivery = (prefs: ComposerInputPrefs): ComposerDelivery =>
  prefs.enter === "newline" ? prefs.modEnter : prefs.enter;
