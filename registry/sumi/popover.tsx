"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/popover.css";
import "./styles/live.css";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;
export const PopoverClose = BasePopover.Close;

export interface PopoverContentProps extends ComponentProps<typeof BasePopover.Popup> {
  arrow?: boolean;
  side?: ComponentProps<typeof BasePopover.Positioner>["side"];
  align?: ComponentProps<typeof BasePopover.Positioner>["align"];
  sideOffset?: number;
}

export function PopoverContent({ arrow = false, side = "bottom", align = "center", sideOffset = 6, className, children, ...props }: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner className="sumi-positioner" side={side} align={align} sideOffset={sideOffset}>
        <BasePopover.Popup data-slot="popover" className={cn("sumi-popover sumi-pop", className)} {...props}>
          {arrow && <BasePopover.Arrow className="sumi-popover__ar" />}
          <div className="sumi-popover__ct">{children}</div>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
