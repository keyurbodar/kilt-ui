// Vendored from Kiki (primitives/drawer/drawer.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cx } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useRef,
} from "react";
import "./drawer.css";
import { type DrawerDragContext, useDrawerDrag } from "./use-drawer-drag";

type DrawerContextValue = DrawerDragContext & {
  setContent: (node: HTMLElement | null) => void;
  setBackdrop: (node: HTMLElement | null) => void;
  pressBackdrop: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

const noop = () => {};

export type DrawerProps = ComponentProps<typeof BaseDialog.Root>;

export function Drawer({ onOpenChange, ...props }: DrawerProps) {
  const contentRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<BaseDialog.Root.Actions>({
    unmount: noop,
    close: noop,
  });
  const backdropPressed = useRef(false);
  const context: DrawerContextValue = {
    contentRef,
    actionsRef,
    setContent: (node) => {
      contentRef.current = node;
    },
    setBackdrop: (node) => {
      if (node !== null) backdropPressed.current = false;
    },
    pressBackdrop: () => {
      backdropPressed.current = true;
    },
  };
  return (
    <DrawerContext.Provider value={context}>
      <BaseDialog.Root
        {...props}
        onOpenChange={(open, details) => {
          if (
            !open &&
            details.reason === "outside-press" &&
            !backdropPressed.current
          ) {
            details.cancel();
            return;
          }
          onOpenChange?.(open, details);
        }}
        actionsRef={actionsRef}
      />
    </DrawerContext.Provider>
  );
}

export type DrawerTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;

export function DrawerTrigger(props: DrawerTriggerProps) {
  return <BaseDialog.Trigger data-slot="drawer-trigger" {...props} />;
}

export type DrawerOverlayProps = Omit<
  ComponentProps<typeof BaseDialog.Backdrop>,
  "className"
> & { className?: string };

export function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  const context = useContext(DrawerContext);
  return (
    <BaseDialog.Backdrop
      ref={context?.setBackdrop}
      onPointerDown={context?.pressBackdrop}
      data-slot="drawer-overlay"
      forceRender
      className={cx(
        "fixed inset-0 z-(--z-drawer) bg-overlay",
        "group-has-[[data-nested]]/drawer-portal:z-(--z-overlay-content)",
        "transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-fast",
        className,
      )}
      {...props}
    />
  );
}

export type DrawerHandleProps = Omit<
  ComponentProps<typeof BaseDialog.Close>,
  "className" | "children"
> & { className?: string };

export function DrawerHandle({ className, ...props }: DrawerHandleProps) {
  return (
    <BaseDialog.Close
      data-slot="drawer-handle"
      className={cx(
        "group/drawer-handle flex w-full shrink-0 cursor-grab touch-none items-center justify-center py-3 outline-none group-data-[dragging]/drawer:cursor-grabbing",
        className,
      )}
      {...props}
    >
      <span className="focus-gutter -my-1 rounded-full py-1 group-focus-visible/drawer-handle:outline-ring-inset">
        <span className="block h-1 w-9 rounded-full bg-muted transition-colors duration-hover group-hover/drawer-handle:bg-muted-foreground-3 group-active/drawer-handle:bg-muted-foreground-3" />
      </span>
      <span className="sr-only">Close</span>
    </BaseDialog.Close>
  );
}

export type DrawerContentProps = Omit<
  ComponentProps<typeof BaseDialog.Popup>,
  "className"
> & {
  className?: string;
  scrollFade?: boolean;
  ornament?: ReactNode;
};

export function DrawerContent({
  className,
  children,
  ref,
  scrollFade = true,
  ornament,
  ...props
}: DrawerContentProps) {
  const context = useContext(DrawerContext);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useDrawerDrag(context, scrollerRef);
  const hasOrnament = ornament !== undefined;
  return (
    <BaseDialog.Portal className="group/drawer-portal">
      <DrawerOverlay />
      <BaseDialog.Popup
        ref={(node) => {
          context?.setContent(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="drawer-content"
        className={cx(
          "fixed inset-x-0 bottom-0 z-(--z-drawer) flex max-h-[calc(100dvh_-_var(--spacing)_*_24)] flex-col rounded-t-(--radius-panel) border-x-hairline border-t-hairline border-border-2 bg-popover pb-(--safe-bottom) shadow-overlay",
          "data-[nested]:z-(--z-overlay-content)",
          "group/drawer outline-none data-[dragging]:cursor-grabbing data-[dragging]:select-none",
          "transition-[translate,opacity] duration-base ease-out-quint data-[starting-style]:translate-y-full data-[starting-style]:opacity-0 data-[ending-style]:translate-y-full data-[ending-style]:opacity-0 data-[ending-style]:duration-fast",
          className,
        )}
        {...props}
        {...drag}
      >
        {ornament}
        <DrawerHandle className={hasOrnament ? "relative" : undefined} />
        <div
          ref={scrollerRef}
          className={cx(
            "min-h-0 overflow-x-clip overflow-y-auto overscroll-contain",
            scrollFade && "md:scroll-fade-y",
            hasOrnament && "relative",
          )}
        >
          {children}
        </div>
        <div
          aria-hidden
          className="absolute -inset-x-hairline top-full h-24 border-x-hairline border-border-2 bg-popover"
        />
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export type DrawerTitleProps = ComponentProps<typeof BaseDialog.Title>;

export function DrawerTitle(props: DrawerTitleProps) {
  return <BaseDialog.Title {...props} />;
}

export type DrawerDescriptionProps = ComponentProps<
  typeof BaseDialog.Description
>;

export function DrawerDescription(props: DrawerDescriptionProps) {
  return <BaseDialog.Description {...props} />;
}

export type DrawerCloseProps = ComponentProps<typeof BaseDialog.Close>;

export function DrawerClose(props: DrawerCloseProps) {
  return <BaseDialog.Close {...props} />;
}
