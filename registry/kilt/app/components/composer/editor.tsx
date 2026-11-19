// Vendored from Kiki (components/composer/editor.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { $insertDataTransferForRichText } from "@lexical/clipboard";
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  $setSelection,
  BLUR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  type EditorThemeClasses,
  FORMAT_TEXT_COMMAND,
  HISTORY_MERGE_TAG,
  INDENT_CONTENT_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  PASTE_TAG,
  type RangeSelection,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
  type TextFormatType,
} from "lexical";
import {
  type Ref,
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
} from "react";
import { $caretOffset, $restoreCaret } from "./caret";
import { CommandPlugin } from "./command-plugin";
import { type ComposerFieldHeight, editorFieldClass } from "./editor-field";
import {
  $createMentionNode,
  $createVoiceTranscriptNode,
  MentionNode,
  VoiceTranscriptNode,
} from "./mention-node";
import { MentionPlugin, VOICE_TAG } from "./mention-plugin";
import {
  $readPayload,
  $writePayload,
  COMPOSER_TRANSFORMERS,
  isPayloadEmpty,
  type MentionLine,
  payloadSignature,
} from "./payload";
import {
  DEFAULT_INPUT_PREFS,
  defaultDelivery,
  resolveEnterKey,
} from "./submit-keys";
import type {
  ComposerCommand,
  ComposerDelivery,
  ComposerInputPrefs,
  ComposerMention,
  ComposerPayload,
  MentionSource,
} from "./types";
import { useTouchOnly } from "./use-touch-only";

const CHANGE_DEBOUNCE_MS = 300;
const MAX_LIST_DEPTH = 4;
const CARET_EDGE_SLOP = 4;
const VOICE_TAGS = [HISTORY_MERGE_TAG, VOICE_TAG];

export const COMPOSER_THEME: EditorThemeClasses = {
  paragraph: "",
  text: {
    bold: "font-semibold",
    italic: "italic",
    strikethrough: "line-through",
    code: "rounded-sm bg-secondary px-(--spacing-code-inline-x) font-mono",
  },
  list: {
    ul: "list-disc pl-5",
    ol: "list-decimal pl-5",
    listitem: "my-0.5",
    nested: { listitem: "list-none" },
  },
};

export type ComposerEditorHandle = {
  submit: (delivery?: ComposerDelivery) => void;
  focus: () => void;
  getRootElement: () => HTMLElement | null;
  typeCharacter: (text: string) => void;
  clear: () => void;
  getPayload: () => ComposerPayload;
  reset: (payload: ComposerPayload | null) => void;
  insertText: (text: string) => void;
  pastePlainText: (text: string) => void;
  insertMention: (
    mention: Pick<ComposerMention, "kind" | "id" | "label"> & { text?: string },
    text: string,
  ) => void;
  insertMentionLines: (lines: MentionLine[], onUpdate?: () => void) => void;
  applyFormat: (format: TextFormatType) => void;
  insertList: (kind: "bullet" | "number") => void;
  insertLink: () => void;
  beginTranscript: () => void;
  updateTranscript: (text: string) => void;
  commitTranscript: (focus?: boolean) => void;
};

export type ComposerEditorProps = {
  placeholder?: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  persistCaret?: boolean;
  defaultValue?: ComposerPayload;
  clearOnSubmit?: boolean;
  submitLocked?: boolean;
  onLockedSubmit?: (delivery: ComposerDelivery) => void;
  submitOnEnter?: boolean;
  hasAttachments?: boolean;
  sources?: MentionSource[];
  commands?: ComposerCommand[];
  inputPrefs?: ComposerInputPrefs;
  onSubmit: (
    payload: ComposerPayload,
    delivery: ComposerDelivery,
  ) => boolean | undefined | void;
  onEmptySubmit?: () => void;
  onPromptHistory?: (direction: "up" | "down", empty: boolean) => boolean;
  onChange?: (payload: ComposerPayload) => void;
  onEmptyChange?: (empty: boolean) => void;
  handleRef?: Ref<ComposerEditorHandle>;
  editorClassName?: string;
  fieldHeight?: ComposerFieldHeight;
};

type Point = { type: "text" | "element"; key: string; offset: number };
type Span = { anchor: Point; focus: Point };
type Transcript = {
  anchor: Point | null;
  focus: Point | null;
  selected: string;
  nodeKey: string | null;
  prefix: string;
  suffix: string;
};

const toPoint = (p: RangeSelection["anchor"]): Point => ({
  type: p.type,
  key: p.key,
  offset: p.offset,
});
const samePoint = (a: Point | null, b: Point | null) =>
  a !== null &&
  b !== null &&
  a.key === b.key &&
  a.offset === b.offset &&
  a.type === b.type;
const toSpan = (s: RangeSelection): Span => ({
  anchor: toPoint(s.anchor),
  focus: toPoint(s.focus),
});

function $currentSpan(): Span | null {
  const selection = $getSelection();
  return $isRangeSelection(selection) ? toSpan(selection) : null;
}

function $spanSelection(span: Span) {
  if (
    $getNodeByKey(span.anchor.key) === null ||
    $getNodeByKey(span.focus.key) === null
  )
    return null;
  const selection = $createRangeSelection();
  selection.anchor.set(span.anchor.key, span.anchor.offset, span.anchor.type);
  selection.focus.set(span.focus.key, span.focus.offset, span.focus.type);
  return selection;
}

function $removeSelectedForTranscript(t: Transcript) {
  const { anchor, focus } = t;
  t.focus = null;
  if (anchor === null || focus === null || samePoint(anchor, focus)) return;
  const selection = $spanSelection({ anchor, focus });
  if (selection === null || selection.getTextContent() !== t.selected)
    t.anchor = focus;
  else {
    selection.removeText();
    t.anchor = toPoint(selection.anchor);
  }
}

function $transcriptNode(t: Transcript) {
  if (t.nodeKey !== null) {
    const existing = $getNodeByKey(t.nodeKey);
    if ($isTextNode(existing) && existing.isAttached()) return existing;
    t.anchor = null;
  }
  $removeSelectedForTranscript(t);
  const node = $createVoiceTranscriptNode("");
  const at = t.anchor === null ? null : $getNodeByKey(t.anchor.key);
  if (t.anchor !== null && t.anchor.type === "text" && $isTextNode(at)) {
    const offset = t.anchor.offset;
    if (offset <= 0) at.insertBefore(node);
    else if (offset >= at.getTextContentSize()) at.insertAfter(node);
    else at.splitText(offset)[0]?.insertAfter(node);
  } else if (
    t.anchor !== null &&
    t.anchor.type === "element" &&
    $isElementNode(at)
  ) {
    const child = at.getChildAtIndex(t.anchor.offset);
    const insert = $isRootNode(at) ? $createParagraphNode().append(node) : node;
    if (child === null) at.append(insert);
    else child.insertBefore(insert);
  } else {
    const root = $getRoot();
    if (root.isEmpty()) root.append($createParagraphNode().append(node));
    else root.selectEnd().insertNodes([node]);
  }
  const prev = node.getPreviousSibling();
  t.prefix =
    prev === null ||
    ($isTextNode(prev) && /(^|\s)$/.test(prev.getTextContent()))
      ? ""
      : " ";
  const next = node.getNextSibling();
  t.suffix =
    next === null || ($isTextNode(next) && /^\s/.test(next.getTextContent()))
      ? ""
      : " ";
  t.nodeKey = node.getKey();
  return node;
}

function $clearEditor() {
  const paragraph = $createParagraphNode();
  $getRoot().clear().append(paragraph);
  if ($getSelection() === null) return;
  const selection = paragraph.select();
  selection.setFormat(0);
  selection.setStyle("");
}

function $clearAndDeselect() {
  $getRoot().clear().append($createParagraphNode());
  $setSelection(null);
}

function $exitInlineCode(edge: "end" | "both") {
  const selection = $getSelection();
  if (
    !$isRangeSelection(selection) ||
    !selection.isCollapsed() ||
    selection.anchor.type !== "text"
  )
    return;
  const node = selection.anchor.getNode();
  if (!$isTextNode(node) || !node.hasFormat("code")) return;
  const atEnd =
    selection.anchor.offset === node.getTextContentSize() &&
    node.getNextSibling() === null;
  const atStart =
    selection.anchor.offset === 0 && node.getPreviousSibling() === null;
  if (atEnd || (edge === "both" && atStart)) {
    if (selection.hasFormat("code")) selection.toggleFormat("code");
    selection.setStyle("");
  }
}

function $insertLinkTemplate() {
  const selection = $getSelection() ?? $getRoot().selectEnd();
  if (!$isRangeSelection(selection)) return;
  const text = selection.getTextContent();
  selection.insertText(`[${text.length === 0 ? "text" : text}](url)`);
  const after = $getSelection();
  if (!$isRangeSelection(after) || after.anchor.type !== "text") return;
  const node = after.anchor.getNode();
  if ($isTextNode(node))
    node.select(after.anchor.offset - 4, after.anchor.offset - 1);
}

const textBeforeCaret = (selection: RangeSelection) => {
  const anchor = selection.anchor;
  return anchor.type === "text" && $isTextNode(anchor.getNode())
    ? anchor.getNode().getTextContent().slice(0, anchor.offset)
    : "";
};

function $insertMentionLine(line: MentionLine, index: number) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  if (index > 0) selection.insertText("\n");
  selection.insertNodes([
    $createMentionNode(
      line.mention.kind,
      line.mention.id,
      line.mention.label,
      line.mention.text,
    ),
  ]);
  const after = $getSelection();
  if ($isRangeSelection(after)) after.insertText(` ${line.text}`);
}

function EditorBody(props: ComposerEditorProps) {
  const {
    placeholder,
    ariaLabel = "Message",
    disabled = false,
    autoFocus = false,
    persistCaret = false,
    defaultValue,
    submitOnEnter = true,
    sources = [],
    commands = [],
    inputPrefs = DEFAULT_INPUT_PREFS,
    onChange,
    onEmptyChange,
    handleRef,
    editorClassName,
    fieldHeight = "single",
  } = props;
  const [editor] = useLexicalComposerContext();
  const touchOnly = useTouchOnly();
  const initial = useRef({ value: defaultValue, focus: autoFocus });
  const caret = useRef<number | null>(defaultValue?.caret ?? null);

  useEffect(() => {
    if (!initial.current.focus || !initial.current.value?.text.trim()) return;
    editor.update(
      () => {
        $restoreCaret(caret.current);
        caret.current = $caretOffset();
      },
      { discrete: true },
    );
    editor.focus();
  }, [editor]);

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const latest = useRef(props);
  const prefs = useRef(inputPrefs);
  const touch = useRef(touchOnly);
  useEffect(() => {
    latest.current = props;
    prefs.current = inputPrefs;
    touch.current = touchOnly;
  });

  const empty = useRef(isPayloadEmpty(defaultValue));
  useEffect(() => latest.current.onEmptyChange?.(empty.current), []);

  const lastReset = useRef({
    text: defaultValue?.text ?? "",
    signature: payloadSignature(defaultValue ?? null),
  });
  const pending = useRef<ComposerPayload | null>(null);
  const caretMoved = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRange = useRef<Range | null>(null);
  const lastSpan = useRef<Span | null>(null);
  const transcript = useRef<Transcript | null>(null);

  const cancelFlush = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
    caretMoved.current = false;
  }, []);

  const flush = useEffectEvent(() => {
    const root = editor.getRootElement();
    const domSelection = root?.ownerDocument.getSelection();
    const offset =
      persistCaret &&
      domSelection?.isCollapsed &&
      domSelection.rangeCount > 0 &&
      root?.contains(domSelection.anchorNode)
        ? editor.read(() => $caretOffset(domSelection.getRangeAt(0)))
        : null;
    const payload =
      pending.current ??
      (caretMoved.current || (offset !== null && offset !== caret.current)
        ? editor.read($readPayload)
        : null);
    if (offset !== null) caret.current = offset;
    cancelFlush();
    if (payload !== null)
      latest.current.onChange?.({ ...payload, caret: caret.current });
  });

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, []);

  useEffect(
    () =>
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          flush();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  const submit = useEffectEvent((delivery?: ComposerDelivery) => {
    const current = latest.current;
    const chosen = delivery ?? defaultDelivery(prefs.current);
    if (current.submitLocked) {
      current.onLockedSubmit?.(chosen);
      return;
    }
    const payload = editor.getEditorState().read($readPayload);
    if (payload.text.trim().length === 0 && !current.hasAttachments) {
      current.onEmptySubmit?.();
      return;
    }
    if (current.onSubmit(payload, chosen) === false) {
      cancelFlush();
      current.onChange?.({ ...payload, caret: caret.current });
      return;
    }
    if (current.clearOnSubmit ?? true) {
      savedRange.current = null;
      if (touch.current) {
        editor.update($clearAndDeselect);
        editor.blur();
      } else editor.update($clearEditor);
    }
  });

  useEffect(() => {
    const track = () => {
      const span = editor.getEditorState().read($currentSpan);
      if (span !== null) lastSpan.current = span;
      const root = editor.getRootElement();
      const domSelection = root?.ownerDocument.getSelection();
      if (
        !domSelection?.rangeCount ||
        !domSelection.isCollapsed ||
        !root?.contains(domSelection.anchorNode)
      )
        return;
      const range = domSelection.getRangeAt(0);
      savedRange.current = range.cloneRange();
      const offset = persistCaret
        ? editor.getEditorState().read(() => $caretOffset(range), { editor })
        : null;
      if (offset !== null && offset !== caret.current) {
        caret.current = offset;
        caretMoved.current = true;
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = setTimeout(() => flush(), CHANGE_DEBOUNCE_MS);
      }
    };
    document.addEventListener("pointerdown", track, true);
    const offUpdate = editor.registerUpdateListener(({ tags }) => {
      if (!tags.has(VOICE_TAG)) track();
    });
    const offSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        track();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    return () => {
      offUpdate();
      offSelection();
      document.removeEventListener("pointerdown", track, true);
    };
  }, [editor, persistCaret]);

  useEffect(() => {
    let frame: number | null = null;
    const keepCaretVisible = () => {
      frame = null;
      const root = editor.getRootElement();
      if (root === null) return;
      if (root.scrollHeight <= root.clientHeight) {
        for (const animation of root.getAnimations())
          if (
            animation.timeline !== document.timeline &&
            animation.currentTime !== null
          ) {
            animation.cancel();
            animation.play();
          }
        return;
      }
      if (root !== document.activeElement) return;
      const domSelection = document.getSelection();
      if (
        domSelection === null ||
        domSelection.rangeCount === 0 ||
        !domSelection.isCollapsed
      )
        return;
      const rect = domSelection.getRangeAt(0).getBoundingClientRect();
      const node = domSelection.anchorNode;
      const target =
        rect.height > 0
          ? rect
          : (node instanceof Element
              ? node
              : node?.parentElement
            )?.getBoundingClientRect();
      if (target === undefined) return;
      const box = root.getBoundingClientRect();
      const style = getComputedStyle(root);
      const fadeTop =
        Number.parseFloat(style.getPropertyValue("--_scroll-fade-top")) || 0;
      const fadeBottom =
        Number.parseFloat(style.getPropertyValue("--_scroll-fade-bottom")) || 0;
      if (target.bottom > box.bottom - fadeBottom)
        root.scrollTop += target.bottom - (box.bottom - fadeBottom);
      else if (target.top < box.top + fadeTop)
        root.scrollTop -= box.top + fadeTop - target.top;
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(keepCaretVisible);
    };
    const offUpdate = editor.registerUpdateListener(schedule);
    const offSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        schedule();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      offUpdate();
      offSelection();
    };
  }, [editor]);

  useImperativeHandle(
    handleRef,
    (): ComposerEditorHandle => ({
      submit: (delivery) => submit(delivery),
      focus: () => editor.focus(),
      getRootElement: () => editor.getRootElement(),
      typeCharacter: (text) => {
        editor.update(
          () => {
            const root = editor.getRootElement();
            const domSelection = root?.ownerDocument.getSelection();
            const range =
              domSelection?.rangeCount &&
              root?.contains(domSelection.anchorNode)
                ? domSelection.getRangeAt(0)
                : savedRange.current;
            const selection = $getRoot().selectEnd();
            if (
              range !== null &&
              root?.contains(range.startContainer) &&
              root.contains(range.endContainer)
            )
              selection.applyDOMRange(range);
            selection.insertText(text);
          },
          { discrete: true },
        );
        editor.focus();
      },
      clear: () => {
        savedRange.current = null;
        editor.update($clearEditor);
      },
      getPayload: () =>
        editor.read(() => ({ ...$readPayload(), caret: caret.current })),
      reset: (payload) => {
        const text = payload?.text ?? "";
        const signature = payloadSignature(payload);
        const previous = lastReset.current;
        if (
          signature === previous.signature ||
          (text === "" && previous.text.trim().length === 0)
        )
          return;
        lastReset.current = { text, signature };
        caret.current = payload?.caret ?? null;
        savedRange.current = null;
        cancelFlush();
        const nowEmpty = isPayloadEmpty(payload);
        if (nowEmpty !== empty.current) {
          empty.current = nowEmpty;
          latest.current.onEmptyChange?.(nowEmpty);
        }
        editor.update(
          () => {
            if (payload === null || text.trim().length === 0) $clearEditor();
            else $writePayload(payload);
            if (editor.getRootElement() === document.activeElement)
              $getRoot().selectEnd();
            else $setSelection(null);
          },
          { tag: HISTORY_MERGE_TAG },
        );
      },
      insertText: (text) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            editor.focus();
            editor.update(() => {
              const selection = $getSelection() ?? $getRoot().selectEnd();
              if (!$isRangeSelection(selection)) return;
              const before = textBeforeCaret(selection);
              const pad = before.length > 0 && !/\s$/.test(before);
              selection.insertText(`${pad ? " " : ""}${text}`);
            });
          }),
        );
      },
      pastePlainText: (text) => {
        editor.update(
          () => {
            const selection = $getSelection() ?? $getRoot().selectEnd();
            if (!$isRangeSelection(selection)) return;
            const data = new DataTransfer();
            data.setData("text/plain", text);
            $insertDataTransferForRichText(data, selection, editor);
          },
          { tag: PASTE_TAG },
        );
      },
      insertMention: (mention, text) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            editor.focus();
            editor.update(() => {
              const selection = $getSelection() ?? $getRoot().selectEnd();
              if (!$isRangeSelection(selection)) return;
              const before = textBeforeCaret(selection);
              if (before.length > 0 && !/\s$/.test(before))
                selection.insertText(" ");
              selection.insertNodes([
                $createMentionNode(
                  mention.kind,
                  mention.id,
                  mention.label,
                  mention.text,
                ),
              ]);
              const after = $getSelection();
              if ($isRangeSelection(after))
                after.insertText(text === "" ? " " : `\n${text}`);
            });
          }),
        );
      },
      insertMentionLines: (lines, onUpdate) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            editor.getRootElement()?.focus({ preventScroll: true });
            editor.update(
              () => {
                const selection = $getSelection() ?? $getRoot().selectEnd();
                if (!$isRangeSelection(selection)) return;
                if (textBeforeCaret(selection).trim() !== "")
                  selection.insertText("\n");
                lines.forEach($insertMentionLine);
                const after = $getSelection();
                if (!$isRangeSelection(after)) return;
                const node = after.anchor.getNode();
                const rest = $isTextNode(node)
                  ? node.getTextContent().slice(after.anchor.offset)
                  : node.getTextContent();
                if (rest.trim() !== "" || node.getNextSibling() !== null)
                  after.insertText("\n");
              },
              { onUpdate },
            );
          }),
        );
      },
      applyFormat: (format) => {
        editor.focus();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
      },
      insertList: (kind) => {
        editor.focus();
        editor.dispatchCommand(
          kind === "number"
            ? INSERT_ORDERED_LIST_COMMAND
            : INSERT_UNORDERED_LIST_COMMAND,
          undefined,
        );
      },
      insertLink: () => {
        editor.focus();
        editor.update($insertLinkTemplate);
      },
      beginTranscript: () => {
        const root = editor.getRootElement();
        const domSelection = root?.ownerDocument.getSelection() ?? null;
        const span =
          root !== null &&
          domSelection !== null &&
          domSelection.rangeCount > 0 &&
          root.contains(domSelection.anchorNode)
            ? editor.read(() => {
                const selection = $createRangeSelection();
                selection.applyDOMRange(domSelection.getRangeAt(0));
                return toSpan(selection);
              })
            : null;
        const from = span ?? lastSpan.current;
        transcript.current = editor.read(() => ({
          anchor: from?.anchor ?? null,
          focus: from?.focus ?? null,
          selected:
            from === null ? "" : ($spanSelection(from)?.getTextContent() ?? ""),
          nodeKey: null,
          prefix: "",
          suffix: "",
        }));
      },
      updateTranscript: (text) => {
        const t = transcript.current;
        if (t === null || (text.length === 0 && t.nodeKey === null)) return;
        const tags = t.nodeKey === null ? VOICE_TAG : VOICE_TAGS;
        const focused =
          editor.getRootElement()?.contains(document.activeElement) === true;
        editor.update(
          () => {
            const span = $currentSpan();
            const existing =
              t.nodeKey === null ? null : $getNodeByKey(t.nodeKey);
            const follow =
              focused &&
              span !== null &&
              (existing === null
                ? samePoint(span.anchor, t.anchor) &&
                  samePoint(span.focus, t.focus ?? t.anchor)
                : samePoint(span.anchor, span.focus) &&
                  span.focus.key === existing.getKey() &&
                  span.focus.offset >= existing.getTextContentSize());
            const node = $transcriptNode(t);
            node.setTextContent(t.prefix + text.trim() + t.suffix);
            if (follow)
              node.select(node.getTextContentSize(), node.getTextContentSize());
          },
          { tag: tags },
        );
      },
      commitTranscript: (focus = true) => {
        const t = transcript.current;
        transcript.current = null;
        if (t === null || t.nodeKey === null) return;
        const key = t.nodeKey;
        editor.update(
          () => {
            const node = $getNodeByKey(key);
            if (!$isTextNode(node)) return;
            const content = node.getTextContent();
            if (content.trim().length === 0) {
              node.remove();
              return;
            }
            const next = node.getNextSibling();
            const spaced =
              $isTextNode(next) && /^\s/.test(next.getTextContent());
            const plain = $createTextNode(
              content.replace(/\s*$/, spaced ? "" : " "),
            );
            node.replace(plain);
            if (focus)
              plain.select(
                plain.getTextContentSize(),
                plain.getTextContentSize(),
              );
          },
          { tag: focus ? VOICE_TAGS : [...VOICE_TAGS, SKIP_DOM_SELECTION_TAG] },
        );
        if (focus) editor.focus();
      },
    }),
    [editor, cancelFlush],
  );

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        (event) => {
          if (!event.shiftKey) $exitInlineCode("end");
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );

  useEffect(
    () =>
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const item = $getNearestNodeOfType(
            selection.anchor.getNode(),
            ListItemNode,
          );
          if (item === null) return false;
          event.preventDefault();
          if (event.shiftKey)
            return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          const list = item.getParent();
          return (
            !$isListNode(list) ||
            listDepth(item) >= MAX_LIST_DEPTH ||
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
          );
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  const onEnter = useEffectEvent((event: KeyboardEvent | null) => {
    $exitInlineCode("both");
    if (event === null || !submitOnEnter) return false;
    const result = resolveEnterKey({
      touchOnly: touch.current,
      shiftKey: event.shiftKey,
      modKey: event.metaKey || event.ctrlKey,
      altKey: event.altKey,
      isComposing: event.isComposing || event.keyCode === 229,
      ...prefs.current,
    });
    if (result.kind === "pass") return false;
    event.preventDefault();
    if (result.kind === "newline") {
      editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
      return true;
    }
    submit(result.delivery);
    return true;
  });

  useEffect(() => {
    const off = (["up", "down"] as const).map((direction) =>
      editor.registerCommand(
        direction === "up" ? KEY_ARROW_UP_COMMAND : KEY_ARROW_DOWN_COMMAND,
        (event) => {
          if (
            event === null ||
            event.shiftKey ||
            event.altKey ||
            event.metaKey ||
            event.ctrlKey ||
            event.isComposing ||
            event.keyCode === 229
          )
            return false;
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed())
            return false;
          const root = editor.getRootElement();
          const range = root?.ownerDocument.getSelection()?.getRangeAt(0);
          const edge = (
            direction === "up"
              ? root?.firstElementChild
              : root?.lastElementChild
          )?.getBoundingClientRect();
          const start = range?.startContainer;
          const caretBox =
            range?.getClientRects()[0] ??
            (start instanceof Element
              ? start
              : start?.parentElement
            )?.getBoundingClientRect();
          if (
            root === null ||
            edge === undefined ||
            caretBox === undefined ||
            (direction === "up"
              ? caretBox.top - edge.top
              : edge.bottom - caretBox.bottom) >
              Math.max(caretBox.height / 2, CARET_EDGE_SLOP) ||
            latest.current.onPromptHistory?.(
              direction,
              $getRoot().getTextContent() === "",
            ) !== true
          )
            return false;
          event.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
    return () => {
      for (const dispose of off) dispose();
    };
  }, [editor]);

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => onEnter(event),
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );

  const skills = sources.find((s) => s.kind === "skill");
  return (
    <div className="relative">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            aria-label={ariaLabel}
            className={editorFieldClass(fieldHeight, editorClassName)}
          />
        }
        placeholder={
          <div
            aria-hidden
            className="pointer-events-none absolute top-1 left-1 text-base font-normal text-muted-foreground-3"
          >
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <MarkdownShortcutPlugin transformers={COMPOSER_TRANSFORMERS} />
      {sources.length > 0 ? <MentionPlugin sources={sources} /> : null}
      {commands.length > 0 || skills !== undefined ? (
        <CommandPlugin commands={commands} skills={skills} />
      ) : null}
      {autoFocus ? <AutoFocusPlugin /> : null}
      <OnChangePlugin
        ignoreSelectionChange
        ignoreHistoryMergeTagChange={false}
        onChange={(state, _editor, tags) => {
          if (tags.has(HISTORY_MERGE_TAG) && !tags.has(VOICE_TAG)) return;
          const { isEmpty, payload } = state.read(() => ({
            isEmpty: $getRoot().getTextContent().trim().length === 0,
            payload: onChange === undefined ? undefined : $readPayload(),
          }));
          if (isEmpty !== empty.current) {
            empty.current = isEmpty;
            onEmptyChange?.(isEmpty);
          }
          if (payload === undefined) return;
          lastReset.current = {
            text: payload.text,
            signature: payloadSignature(payload),
          };
          pending.current = { ...payload, caret: caret.current };
          if (timer.current !== null) clearTimeout(timer.current);
          timer.current = setTimeout(() => flush(), CHANGE_DEBOUNCE_MS);
        }}
      />
    </div>
  );
}

function listDepth(item: ListItemNode) {
  let depth = 1;
  let parent = item.getParent();
  while (parent !== null) {
    if ($isListItemNode(parent)) {
      const list = parent.getParent();
      if ($isListNode(list)) {
        depth++;
        parent = list.getParent();
        continue;
      }
    }
    return depth;
  }
  return depth;
}

const EDITOR_NODES = [ListNode, ListItemNode, MentionNode, VoiceTranscriptNode];

export default function ComposerEditor(props: ComposerEditorProps) {
  const { defaultValue, disabled = false } = props;
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "capy-composer",
        theme: COMPOSER_THEME,
        nodes: EDITOR_NODES,
        editable: !disabled,
        editorState:
          defaultValue === undefined || defaultValue.text.trim().length === 0
            ? undefined
            : () => {
                $writePayload(defaultValue);
                $setSelection(null);
              },
        onError: (error) => {
          console.error(error);
        },
      }}
    >
      <EditorBody {...props} />
    </LexicalComposer>
  );
}
