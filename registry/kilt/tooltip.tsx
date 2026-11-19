"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { kiltMotion } from "./tokens";
import "./tokens.css";
import "./styles/tooltip.css";
import "./styles/live.css";

/** Shares the open delay so moving between triggers re-opens instantly. */
export function TooltipProvider({ delay = kiltMotion["delay-hover"].ms, ...props }: ComponentProps<typeof BaseTooltip.Provider>) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

export interface TooltipProps extends Omit<ComponentProps<typeof BaseTooltip.Popup>, "children"> {
  label: ReactNode;
  /** Shortcut chip, e.g. "⌘N". */
  keys?: string;
  side?: ComponentProps<typeof BaseTooltip.Positioner>["side"];
  sideOffset?: number;
  /** The trigger element. */
  children: ReactElement;
}

export function Tooltip({ label, keys, side = "bottom", sideOffset = 6, className, children, ...props }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner className="kilt-positioner" data-kind="tooltip" side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup data-slot="tooltip" className={cn("kilt-tooltip kilt-pop", className)} {...props}>
            <span>{label}</span>
            {keys != null && <kbd className="kilt-tooltip__k">{keys}</kbd>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
