// Kilt override of Kiki features/shell/keyboard/index.ts by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
// Kilt's stand-in for Kiki's shell key dispatcher: the composer only needs
// its default chords and a capture-phase handler table.
export type CommandHandler = (event: KeyboardEvent) => boolean | undefined | void;
export type CommandHandlers = Record<string, CommandHandler>;
export type CommandScopeOptions = { capture?: boolean };

const MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Default chords, as `mod+shift+key`; `mod` is ⌘ on Apple platforms, Ctrl elsewhere. */
export const DEFAULT_BINDINGS: Record<string, string> = {
  "composer.attach": "mod+/",
};

const GLYPH: Record<string, string> = { mod: MAC ? "⌘" : "Ctrl", shift: "⇧", alt: MAC ? "⌥" : "Alt" };

export function shortcutGlyphText(command: string): string | null {
  const binding = DEFAULT_BINDINGS[command];
  if (binding === undefined) return null;
  const glyphs = binding.split("+").map((part) => GLYPH[part] ?? part.toUpperCase());
  return glyphs.some((g) => g.length > 1) ? glyphs.join("+") : glyphs.join("");
}

const matches = (binding: string, event: KeyboardEvent) => {
  const parts = binding.split("+");
  const key = parts.at(-1);
  return (
    event.key.toLowerCase() === key &&
    (MAC ? event.metaKey : event.ctrlKey) === parts.includes("mod") &&
    event.shiftKey === parts.includes("shift") &&
    event.altKey === parts.includes("alt")
  );
};

/** Binds each command's default chord; returns the unregister function. */
export function registerCommands(commands: CommandHandlers, options: CommandScopeOptions = {}): () => void {
  const onKey = (event: KeyboardEvent) => {
    for (const [command, run] of Object.entries(commands)) {
      const binding = DEFAULT_BINDINGS[command];
      if (binding === undefined || !matches(binding, event)) continue;
      if (run(event) === false) continue;
      event.preventDefault();
      return;
    }
  };
  window.addEventListener("keydown", onKey, { capture: options.capture });
  return () => window.removeEventListener("keydown", onKey, { capture: options.capture });
}
