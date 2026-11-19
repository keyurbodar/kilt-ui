// Vendored from Kiki (components/composer/toolbar-action.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { MouseEventHandler, ReactNode } from "react";
import { Button } from "@/registry/kilt/app/primitives/button";
import { ShortcutTooltip } from "./shortcut-tooltip";

export type ToolbarActionProps = {
  label: string;
  shortcut?: string | null;
  disabled?: boolean;
  pressed?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

export function ToolbarAction({
  label,
  shortcut,
  disabled = false,
  pressed,
  onClick,
  children,
}: ToolbarActionProps) {
  return (
    <ShortcutTooltip label={label} shortcut={disabled ? undefined : shortcut}>
      <span className="inline-flex">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={pressed}
          data-selected={pressed === true ? "" : undefined}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          {children}
        </Button>
      </span>
    </ShortcutTooltip>
  );
}
