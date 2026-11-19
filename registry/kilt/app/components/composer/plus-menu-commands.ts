// Vendored from Kiki (components/composer/plus-menu-commands.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { CommandHandlers } from "@/registry/kilt/app/features/shell/keyboard";

/**
 * The attach menu's own keybinding, registered by the menu that owns the file
 * input the shortcut opens.
 */
export const createPlusMenuCommands = (
  read: () => { attach: () => boolean | undefined },
): CommandHandlers => ({
  "composer.attach": () => read().attach(),
});
