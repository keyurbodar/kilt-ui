// Vendored from Kiki (components/composer/selection-box.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  type ComponentProps,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/registry/kilt/app/primitives/button";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import {
  Composer,
  type ComposerHandle,
  type ComposerSubmitControl,
} from "./composer";
import { ShortcutTooltip } from "./shortcut-tooltip";
import type { ComposerPayload, MentionSource } from "./types";
import type { ComposerVoice } from "./voice-control";

export type SelectionTarget = "agent" | "review";

export type SelectionBoxProps = Omit<
  ComponentProps<"div">,
  "onSubmit" | "defaultValue" | "onChange" | "placeholder"
> & {
  caption?: ReactNode;
  leading?: ReactNode;
  initialValue?: string;
  defaultValue?: ComposerPayload;
  composerRef?: Ref<ComposerHandle | null> & {
    current?: ComposerHandle | null;
  };
  targets?: SelectionTarget[];
  target?: SelectionTarget;
  onTargetChange?: (target: SelectionTarget) => void;
  onSubmit?: (
    payload: ComposerPayload,
    target: SelectionTarget,
  ) => boolean | undefined | void;
  submitting?: boolean;
  onClose?: (event?: PointerEvent) => void;
  voice?: ComposerVoice;
  footer?: ReactNode;
  submitLocked?: boolean;
  sources?: MentionSource[];
  placeholder?: string;
  submitLabel?: string;
  submitControl?: ComposerSubmitControl;
  actions?: ReactNode;
  surface?: "card" | "overlay";
  toolbar?: boolean;
  submitPersistent?: boolean;
};

export function SelectionBox({
  caption,
  leading,
  initialValue = "",
  defaultValue,
  composerRef,
  targets = [],
  target = "agent",
  onTargetChange,
  onSubmit,
  submitting = false,
  onClose,
  voice,
  className,
  footer,
  submitLocked,
  sources,
  placeholder,
  submitLabel,
  submitControl,
  actions,
  surface = "card",
  toolbar = true,
  submitPersistent = false,
  ...rest
}: SelectionBoxProps) {
  const box = useRef<HTMLDivElement>(null);
  const ownHandle = useRef<ComposerHandle | null>(null);
  const handle = composerRef ?? ownHandle;
  const [initial] = useState<ComposerPayload | undefined>(
    () =>
      defaultValue ??
      (initialValue === ""
        ? undefined
        : { text: initialValue, mentions: [], files: [] }),
  );

  useEffect(() => {
    if (onClose === undefined) return;
    const outside = (event: PointerEvent) => {
      const node = box.current;
      if (
        node === null ||
        !(event.target instanceof Node) ||
        node.contains(event.target)
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-slot^=composer-]")
      )
        return;
      onClose(event);
    };
    document.addEventListener("pointerdown", outside, true);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        box.current?.scrollIntoView({ block: "nearest" }),
      ),
    );
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      cancelAnimationFrame(frame);
    };
  }, [onClose]);

  const surfaceClass =
    surface === "overlay"
      ? "rounded-(--radius-overlay) border-border-2 bg-popover shadow-overlay"
      : "rounded-(--radius-card) border-border-1 bg-card shadow-plate";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Escape bubbles up from the focused controls inside the box
    <div
      ref={box}
      data-slot="selection-box"
      {...rest}
      className={[
        "flex w-full min-w-0 flex-col gap-1 border-(length:--border-width-hairline) p-3 font-sans",
        surfaceClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || onClose === undefined) return;
        event.preventDefault();
        onClose();
      }}
    >
      <div className="-mx-1 -mt-1 flex h-(--h-control-xs) items-center gap-0.5">
        {leading === undefined ? null : (
          <span className="flex size-(--h-control-xs) shrink-0 items-center justify-center">
            {leading}
          </span>
        )}
        <span
          className={
            leading === undefined
              ? "min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground-2 pl-1.5"
              : "min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground-2"
          }
        >
          {caption}
        </span>
        {actions}
        <ShortcutTooltip label="Close" shortcut="Esc" side="bottom">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onClose?.()}
          >
            <Icon name="cross-small" size="sm" />
          </Button>
        </ShortcutTooltip>
      </div>
      <Composer
        ref={handle}
        surface="bare"
        toolbar={toolbar}
        autoFocus
        placeholder={
          placeholder ??
          (target === "agent" ? "Ask Capy about this" : "Leave a review")
        }
        submitLabel={
          submitLabel ?? (target === "agent" ? "Add to prompt" : "Review")
        }
        defaultValue={initial}
        editorClassName="min-h-12"
        disabled={submitting}
        clearOnSubmit={false}
        submitLocked={submitLocked}
        submitControl={submitControl}
        submitPersistent={submitPersistent}
        voice={voice}
        sources={sources}
        onSubmit={(payload) => onSubmit?.(payload, target)}
        leftControls={
          targets.length > 1 ? (
            <div
              role="radiogroup"
              aria-label="Send to"
              className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5"
            >
              {targets.map((option) => (
                <Button
                  key={option}
                  role="radio"
                  aria-checked={target === option}
                  size="xs"
                  variant="segmented"
                  data-selected={target === option ? "" : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onTargetChange?.(option);
                    handle.current?.focus();
                  }}
                >
                  {option === "agent" ? (
                    "Capy"
                  ) : (
                    <>
                      <Icon name="bubble-wide" size="sm" />
                      Review
                    </>
                  )}
                </Button>
              ))}
            </div>
          ) : undefined
        }
      />
      {footer}
    </div>
  );
}
