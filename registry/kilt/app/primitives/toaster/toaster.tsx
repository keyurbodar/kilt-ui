// Vendored from Kiki (primitives/toaster/toaster.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cx } from "class-variance-authority";
import {
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type ExternalToast, Toaster as Sonner, toast as sonner } from "sonner";
import { useAppearance } from "@/registry/kilt/app/lib/appearance";
import { motion } from "@/registry/kilt/app/lib/motion";
import { Button, type ButtonProps, buttonVariants } from "@/registry/kilt/app/primitives/button";
import { DotGridIcon } from "@/registry/kilt/app/primitives/dot-grid-icon";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { ShimmerText } from "@/registry/kilt/app/primitives/shimmer-text";
import "./toaster.css";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "loading";

type ToastActionBase = {
  label: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export type ToastAction = ToastActionBase &
  (
    | { onClick: (event: MouseEvent<HTMLButtonElement>) => void }
    | { href: string }
  );

export type ToastCancel = {
  label: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type ToastOptions = {
  id?: string | number;
  description?: ReactNode;
  icon?: ReactNode;
  duration?: number;
  action?: ToastAction;
  cancel?: ToastCancel;
  onDismiss?: () => void;
};

export type ToastContent = { title: ReactNode } & Omit<ToastOptions, "id">;

type ToastProps = ToastContent & { id: string | number; type: ToastType };

const STAMP_EXIT_FALLBACK = 400;

const stopPropagation = (event: PointerEvent) => event.stopPropagation();

const stampOf = (value: ReactNode) =>
  value ? (typeof value === "string" ? `text:${value}` : "node") : "empty";

export function formatToastDescription(description: ReactNode): ReactNode {
  if (typeof description !== "string" || !description) return description;
  const counts = new Map<string, number>();
  return description.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part) => {
    const count = (counts.get(part) ?? 0) + 1;
    counts.set(part, count);
    const key = `${part}-${count}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return (
        <span key={key} className="font-semibold">
          {part.slice(2, -2)}
        </span>
      );
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      part.length > 2 &&
      !part.startsWith("**")
    )
      return <em key={key}>{part.slice(1, -1)}</em>;
    return <span key={key}>{part}</span>;
  });
}

function ToastStamp({
  stamp,
  className,
  children,
}: {
  stamp: string;
  className?: string;
  children: ReactNode;
}) {
  const previous = useRef<{ stamp: string; body: ReactNode } | null>(null);
  const [initialStamp] = useState(stamp);
  const [changed, setChanged] = useState(false);
  const [exiting, setExiting] = useState<{
    stamp: string;
    body: ReactNode;
  } | null>(null);
  const animateEnter = changed || stamp !== initialStamp;

  useLayoutEffect(() => {
    const last = previous.current;
    previous.current = { stamp, body: children };
    if (last !== null && last.stamp !== stamp) {
      setChanged(true);
      setExiting(last.body == null ? null : last);
    }
  });

  useEffect(() => {
    if (exiting === null) return;
    const timer = window.setTimeout(
      () => setExiting(null),
      STAMP_EXIT_FALLBACK,
    );
    return () => window.clearTimeout(timer);
  }, [exiting]);

  return (
    <div
      className={cx(
        "relative",
        exiting !== null && children != null && "overflow-hidden",
        className,
      )}
    >
      {exiting !== null && (
        <div
          key={`exit-${exiting.stamp}`}
          aria-hidden
          onTransitionEnd={(event) => {
            if (
              event.propertyName === "opacity" &&
              event.target === event.currentTarget
            )
              setExiting(null);
          }}
          className="ease-out-quint starting:translate-y-0 starting:opacity-100 pointer-events-none absolute inset-x-0 top-0 opacity-0 transition-[opacity,translate] duration-exit motion-safe:-translate-y-1"
        >
          {exiting.body}
        </div>
      )}
      <div
        key={stamp}
        className={cx(
          animateEnter &&
            "ease-out-quint starting:translate-y-1 starting:opacity-0 transition-[opacity,translate] duration-fast motion-reduce:starting:translate-y-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

const measureHeight = (element: HTMLElement) =>
  Number.parseFloat(getComputedStyle(element).height);

function toastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return <Icon name="circle-check" className="text-success" />;
    case "error":
      return <Icon name="circle-x" className="text-destructive" />;
    case "warning":
      return <Icon name="exclamation-circle" className="text-warning-fg" />;
    case "info":
      return <Icon name="circle-info" className="text-info" />;
    case "loading":
      return <DotGridIcon className="text-muted-foreground-1" />;
    default:
      return <Icon name="circle-info" className="text-muted-foreground-2" />;
  }
}

export function Toast({
  id,
  type,
  title,
  description,
  icon,
  action,
  cancel,
}: ToastProps) {
  const iconStamp = icon == null ? type : "custom";
  const inline = !description && !cancel && action ? action : null;
  const titleStamp = `${stampOf(title)}|${String(type === "loading")}|${stampOf(inline?.label)}`;
  const descriptionStamp = stampOf(description);
  const actionsStamp =
    inline === null
      ? `${stampOf(action?.label)}|${stampOf(cancel?.label)}`
      : "inline";
  const layoutKey = [
    iconStamp,
    titleStamp,
    descriptionStamp,
    actionsStamp,
  ].join("||");

  const contentRef = useRef<HTMLDivElement>(null);
  const settledHeight = useRef<number | null>(null);
  const frame = useRef(0);
  const lastLayoutKey = useRef<string | null>(null);

  const dismiss = () => {
    sonner.dismiss(id);
  };

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!action || "href" in action) return;
    action.onClick(event);
    if (!event.defaultPrevented) dismiss();
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    cancel?.onClick?.(event);
    if (!event.defaultPrevented) dismiss();
  };

  const actionNode = !action ? null : "href" in action ? (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        buttonVariants({
          variant: action.variant ?? "solid",
          size: action.size ?? "xs",
        }),
        "touch-manipulation",
        inline !== null && "-my-1 shrink-0",
      )}
      onPointerDown={stopPropagation}
      onClick={dismiss}
    >
      {action.label}
    </a>
  ) : (
    <Button
      type="button"
      variant={action.variant ?? "solid"}
      size={action.size ?? "xs"}
      className={cx("touch-manipulation", inline !== null && "-my-1 shrink-0")}
      onPointerDown={stopPropagation}
      onClick={handleActionClick}
    >
      {action.label}
    </Button>
  );

  const animateHeight = (element: HTMLElement, from: number, to: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.transitionProperty = "none";
      element.style.overflow = "hidden";
      element.style.height = `${from}px`;
      element.style.transitionProperty = "";
      element.style.height = `${to}px`;
    });
  };

  useLayoutEffect(() => {
    const element = contentRef.current;
    const previousKey = lastLayoutKey.current;
    lastLayoutKey.current = layoutKey;
    if (!element) return;
    const pinned = element.style.height !== "";
    if (previousKey === null || previousKey === layoutKey) {
      if (!pinned) {
        settledHeight.current = measureHeight(element);
        return;
      }
      const from = measureHeight(element);
      element.style.height = "";
      const to = measureHeight(element);
      settledHeight.current = to;
      if (Math.abs(from - to) < 1) {
        cancelAnimationFrame(frame.current);
        element.style.overflow = "";
        return;
      }
      animateHeight(element, from, to);
      return;
    }
    const from = pinned ? measureHeight(element) : settledHeight.current;
    element.style.height = "";
    const to = measureHeight(element);
    settledHeight.current = to;
    if (from === null || Math.abs(from - to) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animateHeight(element, from, to);
  });

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const hasActionRow = inline === null && (cancel || action);

  return (
    <div className="relative z-(--z-toast) mx-px flex h-full items-start gap-2 overflow-hidden rounded-(--radius-card) border-hairline border-border-2 bg-popover p-4 font-sans text-sm shadow-overlay">
      <div
        ref={contentRef}
        data-sonner-content=""
        onTransitionEnd={(event) => {
          const element = contentRef.current;
          if (
            element &&
            event.target === element &&
            event.propertyName === "height"
          ) {
            element.style.height = "";
            element.style.overflow = "";
          }
        }}
        className="ease-out-quint relative min-w-0 flex-1 transition-[height] duration-base motion-reduce:transition-none"
      >
        <div className="flex w-full min-w-0 items-start gap-2 pr-8">
          <ToastStamp stamp={iconStamp}>
            <div className="flex h-4 items-center [&_svg:not([class*='size-'])]:size-(--icon-base)">
              {icon ?? toastIcon(type)}
            </div>
          </ToastStamp>
          <div className="min-w-0 flex-1">
            <ToastStamp stamp={titleStamp}>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-3.5">
                <p className="min-w-0 flex-auto text-sm font-medium text-foreground">
                  {type === "loading" ? (
                    <ShimmerText>{title}</ShimmerText>
                  ) : (
                    title
                  )}
                </p>
                {inline === null ? null : actionNode}
              </div>
            </ToastStamp>
            <ToastStamp
              stamp={descriptionStamp}
              className={description ? "mt-0.5" : undefined}
            >
              {description ? (
                <div className="text-sm font-normal text-muted-foreground-2">
                  {formatToastDescription(description)}
                </div>
              ) : null}
            </ToastStamp>
            <ToastStamp
              stamp={actionsStamp}
              className={hasActionRow ? "mt-2.5" : undefined}
            >
              {hasActionRow ? (
                <div className="flex items-center gap-2">
                  {actionNode}
                  {cancel ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="touch-manipulation"
                      onPointerDown={stopPropagation}
                      onClick={handleCancelClick}
                    >
                      {cancel.label}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </ToastStamp>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onPointerDown={stopPropagation}
        onClick={dismiss}
        className={cx(
          "absolute right-4 top-3.5 inline-flex size-5 flex-none touch-manipulation items-center justify-center rounded-(--radius-sm) text-muted-foreground-3 hover:bg-secondary hover:text-foreground",
          motion.focusRing,
          motion.hover,
        )}
      >
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}

const isToastContent = (value: unknown): value is ToastContent =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !("$$typeof" in value) &&
  "title" in value;

type ToastMessage = ReactNode | ToastContent;

const resolveContent = (
  type: ToastType,
  message: ToastMessage,
  options?: ToastOptions,
): ToastContent & { type: ToastType } =>
  isToastContent(message)
    ? {
        ...message,
        type,
        icon: options?.icon ?? message.icon,
        duration: options?.duration ?? message.duration,
        onDismiss: () => {
          message.onDismiss?.();
          options?.onDismiss?.();
        },
      }
    : {
        type,
        title: message,
        description: options?.description,
        icon: options?.icon,
        duration: options?.duration,
        action: options?.action,
        cancel: options?.cancel,
        onDismiss: options?.onDismiss,
      };

const show = (
  type: ToastType,
  message: ToastMessage,
  options?: ToastOptions,
) => {
  const content = resolveContent(type, message, options);
  return sonner.custom((id) => <Toast id={id} {...content} />, {
    ...(options?.id === undefined ? {} : { id: options.id }),
    duration:
      type === "loading"
        ? (content.duration ?? Number.POSITIVE_INFINITY)
        : content.duration,
    onDismiss: () => {
      content.onDismiss?.();
    },
  });
};

type ToastFn = (
  message: ToastMessage,
  options?: ToastOptions,
) => string | number;

export const toast = Object.assign(
  ((message, options) => show("default", message, options)) as ToastFn,
  {
    success: ((message, options) =>
      show("success", message, options)) as ToastFn,
    error: ((message, options) => show("error", message, options)) as ToastFn,
    info: ((message, options) => show("info", message, options)) as ToastFn,
    warning: ((message, options) =>
      show("warning", message, options)) as ToastFn,
    loading: ((message, options) =>
      show("loading", message, options)) as ToastFn,
    dismiss: (id?: string | number) => sonner.dismiss(id),
    custom: (
      render: (id: string | number) => ReactNode,
      options?: Pick<ExternalToast, "id" | "duration" | "onDismiss">,
    ) =>
      sonner.custom(render as Parameters<typeof sonner.custom>[0], {
        ...(options?.id === undefined ? {} : { id: options.id }),
        ...(options?.duration === undefined
          ? {}
          : { duration: options.duration }),
        ...(options?.onDismiss ? { onDismiss: options.onDismiss } : {}),
      }),
    promise: sonner.promise,
    message: sonner.message,
  },
);

export type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({ theme, className, style, ...props }: ToasterProps) {
  const { mode } = useAppearance();
  return (
    <Sonner
      theme={theme ?? mode}
      className={cx("toaster group", className)}
      style={
        { "--width": "calc(var(--spacing) * 95.5)", ...style } as CSSProperties
      }
      mobileOffset={{
        top: "calc(1rem + var(--safe-top))",
        bottom: "calc(1rem + var(--safe-bottom))",
      }}
      {...props}
    />
  );
}
