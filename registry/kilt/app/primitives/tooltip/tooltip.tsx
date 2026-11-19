// Vendored from Kiki (primitives/tooltip/tooltip.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cx } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { motion } from "@/registry/kilt/app/lib/motion";
import { Kbd } from "@/registry/kilt/app/primitives/kbd";

export type TooltipProviderProps = ComponentProps<typeof BaseTooltip.Provider>;

export function TooltipProvider({
  delay = 300,
  timeout = 1000,
  ...props
}: TooltipProviderProps) {
  return <BaseTooltip.Provider delay={delay} timeout={timeout} {...props} />;
}

export const Tooltip = BaseTooltip.Root;

export type TooltipProps = ComponentProps<typeof BaseTooltip.Root>;

export type TooltipTriggerProps = ComponentProps<typeof BaseTooltip.Trigger>;

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

export const tooltipContentClassName = cx(
  "w-fit max-w-xs rounded bg-popover border-hairline border-border-2 shadow-overlay px-2 py-1 text-xs font-medium text-balance text-foreground",
  motion.tooltip,
);

export type TooltipContentProps = Omit<
  ComponentProps<typeof BaseTooltip.Popup>,
  "className"
> &
  Pick<
    ComponentProps<typeof BaseTooltip.Positioner>,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "collisionPadding"
    | "anchor"
  > & { className?: string; shortcut?: ReactNode };

export function TooltipContent({
  side,
  align,
  sideOffset = 4,
  alignOffset,
  collisionPadding = 12,
  anchor,
  shortcut,
  className,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className="z-(--z-tooltip) outline-none"
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cx(
            tooltipContentClassName,
            shortcut != null && "flex items-center gap-1.5",
            className,
          )}
          {...props}
        >
          {shortcut == null ? (
            children
          ) : (
            <>
              <span className="min-w-0">{children}</span>
              <Kbd
                variant="chip"
                className="-mr-0.5 shrink-0 whitespace-nowrap"
              >
                {shortcut}
              </Kbd>
            </>
          )}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
