// Vendored from Kiki (components/composer/shortcut-tooltip.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ReactElement, ReactNode } from "react";
import { Kbd } from "@/registry/kilt/app/primitives/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/kilt/app/primitives/tooltip";

export function ShortcutTooltip({
  label,
  shortcut,
  side = "top",
  children,
}: {
  label: ReactNode;
  shortcut?: string | null;
  side?: "top" | "bottom";
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side={side}
        className={shortcut ? "flex items-center gap-1.5" : undefined}
      >
        {shortcut ? <span className="min-w-0">{label}</span> : label}
        {shortcut ? (
          <Kbd variant="chip" className="-mr-0.5 shrink-0 whitespace-nowrap">
            {shortcut}
          </Kbd>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
