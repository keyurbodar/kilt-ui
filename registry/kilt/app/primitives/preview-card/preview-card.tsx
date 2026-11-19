// Vendored from Kiki (primitives/preview-card/preview-card.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { cx } from "class-variance-authority";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { motion } from "@/registry/kilt/app/lib/motion";
import { overlayPositionerClassName } from "@/registry/kilt/app/primitives/popover";

const OPEN_DELAY = 300;
const COOL_DOWN = 1000;

let warm = false;
let openCards = 0;
let coolTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const setWarm = (next: boolean) => {
  if (warm === next) return;
  warm = next;
  for (const listener of listeners) listener();
};

const cardOpened = () => {
  openCards += 1;
  if (coolTimer !== null) {
    clearTimeout(coolTimer);
    coolTimer = null;
  }
  setWarm(true);
};

const cardClosed = () => {
  openCards = Math.max(0, openCards - 1);
  if (openCards > 0) return;
  if (coolTimer !== null) clearTimeout(coolTimer);
  coolTimer = setTimeout(() => {
    coolTimer = null;
    setWarm(false);
  }, COOL_DOWN);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export type PreviewCardProps = ComponentProps<typeof BasePreviewCard.Root>;

export function PreviewCard({ onOpenChange, ...props }: PreviewCardProps) {
  const counted = useRef(false);
  const account = useCallback((open: boolean) => {
    if (open === counted.current) return;
    counted.current = open;
    if (open) cardOpened();
    else cardClosed();
  }, []);
  useEffect(() => () => account(false), [account]);
  return (
    <BasePreviewCard.Root
      onOpenChange={(open, details) => {
        account(open);
        onOpenChange?.(open, details);
      }}
      {...props}
    />
  );
}

export type PreviewCardTriggerProps = ComponentProps<
  typeof BasePreviewCard.Trigger
>;

export function PreviewCardTrigger({
  delay,
  closeDelay = 0,
  ...props
}: PreviewCardTriggerProps) {
  const isWarm = useSyncExternalStore(
    subscribe,
    () => warm,
    () => false,
  );
  return (
    <BasePreviewCard.Trigger
      data-slot="preview-card-trigger"
      delay={delay ?? (isWarm ? 0 : OPEN_DELAY)}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

export type PreviewCardContentProps = Omit<
  ComponentProps<typeof BasePreviewCard.Popup>,
  "className"
> &
  Pick<
    ComponentProps<typeof BasePreviewCard.Positioner>,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "collisionPadding"
    | "anchor"
  > &
  Pick<ComponentProps<typeof BasePreviewCard.Portal>, "container"> & {
    className?: string;
  };

export function PreviewCardContent({
  side = "right",
  align = "start",
  sideOffset = 8,
  alignOffset,
  collisionPadding = 12,
  anchor,
  container,
  className,
  ...props
}: PreviewCardContentProps) {
  return (
    <BasePreviewCard.Portal container={container}>
      <BasePreviewCard.Positioner
        data-slot="preview-card"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className={overlayPositionerClassName}
      >
        <BasePreviewCard.Popup
          data-slot="preview-card-content"
          className={cx(
            "rounded-(--radius-overlay) border-hairline border-border-2 bg-popover text-foreground shadow-overlay",
            motion.popup,
            "flex max-h-(--available-height) w-72 flex-col overflow-hidden p-3",
            className,
          )}
          {...props}
        />
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
}
