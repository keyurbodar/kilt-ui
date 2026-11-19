// Vendored from Kiki (components/composer/composer.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  type ComponentProps,
  lazy,
  type ReactNode,
  type Ref,
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { shortcutGlyphText } from "@/registry/kilt/app/features/shell/keyboard";
import { cn } from "@/registry/kilt/app/lib/cn";
import { Button } from "@/registry/kilt/app/primitives/button";
import { DotGridIcon } from "@/registry/kilt/app/primitives/dot-grid-icon";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { AttachmentDropOverlay } from "./drop-overlay";
import { dropTargetFor, registerDropTarget } from "./drop-targets";
import type { ComposerEditorHandle, ComposerEditorProps } from "./editor";
import {
  type ComposerFieldHeight,
  EDITOR_FIELD_HEIGHT_CLASS,
} from "./editor-field";
import { ShortcutTooltip } from "./shortcut-tooltip";
import { ToolbarAction } from "./toolbar-action";
import type {
  ComposerCommand,
  ComposerDelivery,
  ComposerInputPrefs,
  ComposerPayload,
  MentionSource,
} from "./types";
import { useTouchOnly } from "./use-touch-only";
import {
  type ComposerVoice,
  isVoiceActive,
  VoiceControl,
  VoiceRecording,
} from "./voice-control";

export {
  ComposerCommandMenu,
  type ComposerCommandMenuProps,
} from "./command-menu";
export {
  ComposerMentionMenu,
  type ComposerMentionMenuProps,
} from "./mention-menu";
export { SelectionBox, type SelectionBoxProps } from "./selection-box";
export {
  SelectionToolbar,
  type SelectionToolbarProps,
} from "./selection-toolbar";

const ComposerEditor = lazy(() => import("./editor"));

const HOLD_TO_QUEUE_MS = 450;
const HOLD_SLOP = 8;

export const ASK_ANYTHING_PLACEHOLDER = (
  <>
    Ask anything
    <span className="@max-md/composer:hidden">
      , / for commands, @ for context
    </span>
  </>
);

export type ComposerSurface = "card" | "field" | "plain" | "bare";

export type ComposerStop = {
  onStop: () => void;
  disabled?: boolean;
  pending?: boolean;
  shortcut?: string | null;
};

export type ComposerSubmitControl = (props: {
  submit: () => void;
  disabled: boolean;
  label: string;
}) => ReactNode;

export type ComposerHandle = ComposerEditorHandle;

export type ComposerProps = Omit<
  ComponentProps<"div">,
  "onSubmit" | "onChange" | "defaultValue" | "placeholder" | "ref"
> & {
  ref?: Ref<ComposerHandle>;
  placeholder?: ReactNode;
  ariaLabel?: string;
  submitLabel?: string;
  onSubmit: (
    payload: ComposerPayload,
    delivery: ComposerDelivery,
  ) => boolean | undefined | void;
  onEmptySubmit?: () => void;
  onPromptHistory?: (direction: "up" | "down", empty: boolean) => boolean;
  onChange?: (payload: ComposerPayload) => void;
  onVoiceActive?: (active: boolean) => void;
  leftControls?: ReactNode;
  rightControls?: ReactNode;
  sources?: MentionSource[];
  commands?: ComposerCommand[];
  voice?: ComposerVoice;
  attachments?: ReactNode;
  hasAttachments?: boolean;
  uploading?: boolean;
  submitWhileUploading?: boolean;
  onFilesAdded?: (files: File[]) => void;
  attachShortcut?: string | null;
  submitControl?: ComposerSubmitControl;
  holdToQueue?: boolean;
  stop?: ComposerStop;
  disabled?: boolean;
  submitLocked?: boolean;
  submitPersistent?: boolean;
  autoFocus?: boolean;
  persistCaret?: boolean;
  defaultValue?: ComposerPayload;
  clearOnSubmit?: boolean;
  inputPrefs?: ComposerInputPrefs;
  surface?: ComposerSurface;
  controlsTarget?: HTMLElement | null;
  toolbar?: boolean;
  editorClassName?: string;
  fieldHeight?: ComposerFieldHeight;
};

const hasFiles = (data: DataTransfer | null) =>
  data?.types.includes("Files") === true;
const filesOf = (data: DataTransfer | null) => Array.from(data?.files ?? []);

export function Composer({
  ref,
  placeholder = "Describe a task",
  ariaLabel,
  submitLabel = "Start",
  onSubmit,
  onEmptySubmit,
  onPromptHistory,
  onChange,
  onVoiceActive,
  leftControls,
  rightControls,
  sources,
  commands,
  voice,
  attachments,
  hasAttachments = false,
  uploading = false,
  submitWhileUploading = false,
  onFilesAdded,
  attachShortcut,
  submitControl,
  holdToQueue = false,
  stop,
  disabled = false,
  submitLocked = false,
  submitPersistent = false,
  autoFocus = false,
  persistCaret = false,
  defaultValue,
  clearOnSubmit = true,
  inputPrefs,
  surface = "card",
  controlsTarget,
  toolbar = false,
  editorClassName,
  fieldHeight = "single",
  className,
  ...rest
}: ComposerProps) {
  const handle = useRef<ComposerEditorHandle | null>(null);
  useImperativeHandle(ref, () => ({
    submit: (d) => handle.current?.submit(d),
    focus: () => handle.current?.focus(),
    getRootElement: () => handle.current?.getRootElement() ?? null,
    typeCharacter: (t) => handle.current?.typeCharacter(t),
    clear: () => handle.current?.clear(),
    getPayload: () =>
      handle.current?.getPayload() ??
      defaultValue ?? { text: "", mentions: [], files: [] },
    reset: (p) => handle.current?.reset(p),
    insertText: (t) => handle.current?.insertText(t),
    pastePlainText: (t) => handle.current?.pastePlainText(t),
    insertMention: (m, t) => handle.current?.insertMention(m, t),
    insertMentionLines: (l, u) => handle.current?.insertMentionLines(l, u),
    applyFormat: (f) => handle.current?.applyFormat(f),
    insertList: (k) => handle.current?.insertList(k),
    insertLink: () => handle.current?.insertLink(),
    beginTranscript: () => handle.current?.beginTranscript(),
    updateTranscript: (t) => handle.current?.updateTranscript(t),
    commitTranscript: (f) => handle.current?.commitTranscript(f),
  }));

  const [empty, setEmpty] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const dropId = useId();
  const touchOnly = useTouchOnly();
  useEffect(() => setMounted(true), []);

  const canDrop = onFilesAdded !== undefined && attachments !== undefined;
  const addFiles = useEffectEvent((files: File[]) => onFilesAdded?.(files));
  useEffect(() => {
    if (!canDrop) return;
    return registerDropTarget(dropId, root);
  }, [canDrop, dropId]);
  useEffect(() => {
    if (!canDrop) return;
    let depth = 0;
    const reset = () => {
      depth = 0;
      setDragging(false);
    };
    const enter = (event: DragEvent) => {
      if (!hasFiles(event.dataTransfer)) return;
      if (dropTargetFor(event.target) !== dropId) return;
      event.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const leave = (event: DragEvent) => {
      if (event.relatedTarget === null) return reset();
      if (dropTargetFor(event.target) !== dropId) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const over = (event: DragEvent) => {
      if (!hasFiles(event.dataTransfer)) return;
      if (dropTargetFor(event.target) !== dropId) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    const drop = (event: DragEvent) => {
      if (!hasFiles(event.dataTransfer)) return;
      if (dropTargetFor(event.target) !== dropId) return;
      event.preventDefault();
      event.stopPropagation();
      const files = filesOf(event.dataTransfer);
      reset();
      if (files.length > 0) addFiles(files);
    };
    document.addEventListener("dragenter", enter);
    document.addEventListener("dragleave", leave);
    document.addEventListener("dragover", over);
    document.addEventListener("drop", drop);
    return () => {
      reset();
      document.removeEventListener("dragenter", enter);
      document.removeEventListener("dragleave", leave);
      document.removeEventListener("dragover", over);
      document.removeEventListener("drop", drop);
    };
  }, [canDrop, dropId]);

  useEffect(() => {
    if (!dragging) return;
    const reset = () => {
      setDragging(false);
    };
    window.addEventListener("drop", reset, true);
    window.addEventListener("dragend", reset, true);
    window.addEventListener("pointermove", reset, true);
    window.addEventListener("pointerdown", reset, true);
    return () => {
      window.removeEventListener("drop", reset, true);
      window.removeEventListener("dragend", reset, true);
      window.removeEventListener("pointermove", reset, true);
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [dragging]);

  const voiceActive = voice !== undefined && isVoiceActive(voice.state);
  const voiceReady =
    voice !== undefined && mounted && voice.supported && !disabled;
  useEffect(() => onVoiceActive?.(voiceActive), [voiceActive, onVoiceActive]);

  const blockedByUpload = uploading && !submitWhileUploading;
  const showSend = !empty || hasAttachments || submitPersistent;
  const sendOrStop = showSend || stop !== undefined;
  const raised = surface !== "field" && surface !== "plain";

  const hold = useRef<{
    timer: number | null;
    x: number;
    y: number;
    suppress: boolean;
  }>({
    timer: null,
    x: 0,
    y: 0,
    suppress: false,
  });
  const cancelHold = useCallback(() => {
    if (hold.current.timer !== null) window.clearTimeout(hold.current.timer);
    hold.current.timer = null;
  }, []);
  useEffect(() => cancelHold, [cancelHold]);
  const holdEnabled = holdToQueue && touchOnly;

  const sendButton = submitControl?.({
    submit: () => handle.current?.submit(),
    disabled:
      disabled || blockedByUpload || submitLocked || (empty && !hasAttachments),
    label: submitLabel,
  }) ?? (
    <Button
      intent="accent"
      size="icon-sm"
      aria-label={submitLabel}
      className="select-none [-webkit-touch-callout:none]"
      disabled={
        disabled ||
        blockedByUpload ||
        submitLocked ||
        (empty && !hasAttachments)
      }
      onClick={() => handle.current?.submit()}
      onPointerDown={(event) => {
        hold.current.suppress = false;
        if (!holdEnabled || event.pointerType !== "touch") return;
        hold.current.x = event.clientX;
        hold.current.y = event.clientY;
        hold.current.timer = window.setTimeout(() => {
          hold.current.timer = null;
          hold.current.suppress = true;
          handle.current?.submit("queue");
        }, HOLD_TO_QUEUE_MS);
      }}
      onPointerMove={(event) => {
        if (
          hold.current.timer !== null &&
          (Math.abs(event.clientX - hold.current.x) > HOLD_SLOP ||
            Math.abs(event.clientY - hold.current.y) > HOLD_SLOP)
        )
          cancelHold();
      }}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onClickCapture={(event) => {
        if (!hold.current.suppress) return;
        hold.current.suppress = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onContextMenuCapture={(event) => {
        if (holdEnabled) event.preventDefault();
      }}
    >
      <Icon name="arrow-up" size="sm" />
    </Button>
  );

  const stopButton =
    stop === undefined ? null : (
      <ShortcutTooltip
        label="Stop run"
        shortcut={stop.disabled || stop.pending ? undefined : stop.shortcut}
      >
        <Button
          intent="accent"
          size="icon-sm"
          aria-label="Stop run"
          aria-busy={stop.pending || undefined}
          disabled={stop.disabled || stop.pending}
          onClick={stop.onStop}
        >
          {stop.pending ? (
            <DotGridIcon size="inherit" />
          ) : (
            <Icon name="stop" size="sm" />
          )}
        </Button>
      </ShortcutTooltip>
    );

  const processing = (variant: "accent" | "ghost") => (
    <Button
      {...(variant === "accent"
        ? ({ intent: "accent" } as const)
        : ({ variant: "ghost" } as const))}
      size="icon-sm"
      aria-label="Processing voice input"
      disabled
    >
      <DotGridIcon />
    </Button>
  );

  const controls = (
    <div className="-mx-1 -mb-1 flex items-center gap-2 pt-1">
      {voice?.state.phase === "recording" ? (
        <>
          <VoiceRecording
            startedAt={voice.state.startedAt}
            audioLevelRef={voice.audioLevelRef}
          />
          <ShortcutTooltip label="Stop and keep text" shortcut="Esc">
            <Button
              intent="accent"
              size="icon-sm"
              aria-label="Stop recording and keep text"
              onClick={voice.accept}
            >
              <Icon name="checkmark-1" size="sm" />
            </Button>
          </ShortcutTooltip>
        </>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-0.5">
            {leftControls}
          </div>
          {rightControls === undefined ? (
            <div className="flex shrink-0 items-center gap-1">
              {voice?.state.phase === "finalizing" ? (
                processing("accent")
              ) : (
                <>
                  <VoiceControl
                    empty={raised && !sendOrStop}
                    ready={voiceReady}
                    voice={voice}
                  />
                  {raised && showSend ? sendButton : stopButton}
                </>
              )}
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1">
              {voice === undefined ? null : voice.state.phase ===
                "finalizing" ? (
                processing("ghost")
              ) : (
                <VoiceControl empty={false} ready={voiceReady} voice={voice} />
              )}
              {rightControls}
            </div>
          )}
        </>
      )}
    </div>
  );

  const fallback = (
    <div className="relative">
      <div
        className={cn(
          "p-1 text-base font-normal text-muted-foreground-3",
          EDITOR_FIELD_HEIGHT_CLASS[fieldHeight],
          editorClassName,
        )}
      >
        {placeholder}
      </div>
    </div>
  );

  const editorProps: ComposerEditorProps = {
    placeholder,
    ariaLabel,
    disabled,
    autoFocus,
    persistCaret,
    defaultValue,
    clearOnSubmit,
    submitLocked: submitLocked || blockedByUpload || voiceActive,
    onLockedSubmit: () => {
      if (!submitLocked && !blockedByUpload && voiceActive) voice?.accept();
    },
    sources,
    commands,
    inputPrefs,
    hasAttachments,
    onSubmit,
    onEmptySubmit,
    onPromptHistory,
    onChange,
    onEmptyChange: setEmpty,
    handleRef: handle,
    editorClassName,
    fieldHeight,
  };

  const surfaceClass = [
    "relative @container/composer",
    surface === "card" &&
      "rounded-(--radius-card) bg-[color:var(--composer-surface,var(--card))] p-3 shadow-composer",
    surface === "field" &&
      "rounded border-(length:--border-width-hairline) border-border-2 bg-input px-1.5 py-1.5 focus-within:outline-ring-inset",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={root}
      data-slot="composer"
      {...rest}
      className={surfaceClass}
      onPasteCapture={(event) => {
        if (onFilesAdded === undefined) return;
        const files = filesOf(event.clipboardData);
        if (files.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        onFilesAdded(files);
      }}
    >
      <AttachmentDropOverlay open={dragging} />
      {surface === "card" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-(--radius-card) border-(length:--border-width-hairline) border-transparent [background:linear-gradient(180deg,var(--border-2),var(--border-1))] [mask:linear-gradient(black,black)_padding-box_exclude,linear-gradient(black,black)_border-box]"
        />
      ) : null}
      {toolbar ? (
        <div className="-mx-1 flex items-center gap-0.5 pb-1">
          <ToolbarAction
            label="Bold"
            onClick={() => handle.current?.applyFormat("bold")}
          >
            <Icon name="bold" size="sm" />
          </ToolbarAction>
          <ToolbarAction
            label="Italic"
            onClick={() => handle.current?.applyFormat("italic")}
          >
            <Icon name="italic" size="sm" />
          </ToolbarAction>
          <ToolbarAction
            label="Code"
            onClick={() => handle.current?.applyFormat("code")}
          >
            <Icon name="code" size="sm" />
          </ToolbarAction>
          <ToolbarAction
            label="Link"
            onClick={() => handle.current?.insertLink()}
          >
            <Icon name="chain-link-1" size="sm" />
          </ToolbarAction>
          <ToolbarAction
            label="Bulleted list"
            onClick={() => handle.current?.insertList("bullet")}
          >
            <Icon name="list-bullets" size="sm" />
          </ToolbarAction>
          <ToolbarAction
            label="Numbered list"
            onClick={() => handle.current?.insertList("number")}
          >
            <Icon name="numbered-list" size="sm" />
          </ToolbarAction>
          {onFilesAdded === undefined ? (
            <ToolbarAction label="Attachments coming soon" disabled>
              <Icon name="images-1" size="sm" />
            </ToolbarAction>
          ) : (
            <>
              <ToolbarAction
                label="Attach files"
                shortcut={
                  attachShortcut ?? shortcutGlyphText("composer.attach")
                }
                disabled={disabled}
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="images-1" size="sm" />
              </ToolbarAction>
              <input
                ref={fileInput}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  onFilesAdded(Array.from(event.currentTarget.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </>
          )}
        </div>
      ) : null}
      <div>
        {mounted ? (
          <Suspense fallback={fallback}>
            <ComposerEditor {...editorProps} />
          </Suspense>
        ) : (
          fallback
        )}
      </div>
      {attachments}
      {controlsTarget === undefined
        ? controls
        : controlsTarget && createPortal(controls, controlsTarget)}
    </div>
  );
}
