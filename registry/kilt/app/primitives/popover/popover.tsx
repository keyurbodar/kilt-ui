// Vendored from Kiki (primitives/popover/popover.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva, cx, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { motion } from "@/registry/kilt/app/lib/motion";

export const Popover = BasePopover.Root;

export type PopoverProps = ComponentProps<typeof BasePopover.Root>;

export type PopoverTriggerProps = ComponentProps<typeof BasePopover.Trigger>;

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

export const overlayPositionerClassName =
  "z-(--z-overlay-content) outline-none";

export const popoverContentVariants = cva(motion.popup, {
  variants: {
    variant: {
      default:
        "flex max-h-[min(60dvh,var(--available-height))] flex-col overflow-hidden rounded-(--radius-overlay) border-hairline border-border-2 bg-popover p-2 text-foreground shadow-overlay",
      unstyled: "",
    },
  },
  defaultVariants: { variant: "default" },
});

const popoverArrowClassName = cx(
  "size-2.5 rotate-45 border-border-2 bg-popover",
  "data-[side=bottom]:-top-1.25 data-[side=bottom]:border-t-hairline data-[side=bottom]:border-l-hairline",
  "data-[side=top]:-bottom-1.25 data-[side=top]:border-r-hairline data-[side=top]:border-b-hairline",
  "data-[side=left]:-right-1.25 data-[side=left]:border-t-hairline data-[side=left]:border-r-hairline",
  "data-[side=right]:-left-1.25 data-[side=right]:border-b-hairline data-[side=right]:border-l-hairline",
);

export type PopoverContentProps = Omit<
  ComponentProps<typeof BasePopover.Popup>,
  "className"
> &
  Pick<
    ComponentProps<typeof BasePopover.Positioner>,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "collisionPadding"
    | "collisionAvoidance"
    | "anchor"
  > &
  Pick<ComponentProps<typeof BasePopover.Portal>, "container"> &
  VariantProps<typeof popoverContentVariants> & {
    className?: string;
    arrow?: boolean;
  };

export function PopoverContent({
  side,
  align = "start",
  sideOffset = 4,
  alignOffset,
  collisionPadding = 12,
  collisionAvoidance = { fallbackAxisSide: "none" },
  anchor,
  container,
  arrow = false,
  variant,
  className,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <BasePopover.Portal container={container}>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        anchor={anchor}
        className={overlayPositionerClassName}
      >
        <BasePopover.Popup
          data-slot="popover-content"
          className={cx(
            popoverContentVariants({ variant }),
            arrow && "overflow-visible",
            className,
          )}
          {...props}
        >
          {arrow && <BasePopover.Arrow className={popoverArrowClassName} />}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
