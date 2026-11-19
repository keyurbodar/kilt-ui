// Vendored from Kiki (components/composer/mention-plugin.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  type RangeSelection,
} from "lexical";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ComposerMentionMenu, MentionMenuSurface } from "./mention-menu";
import { $createMentionNode } from "./mention-node";
import {
  EMPTY_MENTION_STATE,
  readMentionRecents,
  recordMentionRecent,
  resolveMentionState,
} from "./mention-rows";
import {
  type CaretRect,
  MENTION_MENU_MAX_HEIGHT,
  MENU_WIDTH,
  placeMenuInWindow,
} from "./menu-position";
import {
  findMentionTrigger,
  type MentionTrigger,
  mentionTriggerKey,
} from "./triggers";
import type { MentionMenuState, MentionRow, MentionSource } from "./types";

export const VOICE_TAG = "voice";
export const CARET_MENU_LAYER = "z-(--z-overlay-content) outline-none fixed";

type ActiveMention = {
  trigger: MentionTrigger;
  anchorKey: string;
  rect: CaretRect;
};

export const caretRect = (): CaretRect | null => {
  const selection = window.getSelection();
  const rect =
    selection && selection.rangeCount > 0
      ? selection.getRangeAt(0).getBoundingClientRect()
      : null;
  return rect ? { left: rect.left, top: rect.top, bottom: rect.bottom } : null;
};

export function MentionPlugin({ sources }: { sources: MentionSource[] }) {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState<ActiveMention | null>(null);
  const [highlight, setHighlight] = useState(0);
  const dismissed = useRef<string | null>(null);
  const categories = useMemo(() => sources.map((s) => s.category), [sources]);

  useEffect(
    () =>
      editor.registerUpdateListener(({ tags }) => {
        if (tags.has(VOICE_TAG)) return;
        const found = editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed())
            return null;
          const anchor = selection.anchor;
          if (anchor.type !== "text") return null;
          const node = anchor.getNode();
          if (!$isTextNode(node) || node.isToken()) return null;
          const trigger = findMentionTrigger(
            node.getTextContent().slice(0, anchor.offset),
            categories,
          );
          return trigger ? { trigger, anchorKey: node.getKey() } : null;
        });
        if (!found) {
          dismissed.current = null;
          setActive(null);
          return;
        }
        if (dismissed.current === mentionTriggerKey(found.trigger)) return;
        const rect = caretRect();
        if (rect) setActive({ ...found, rect });
      }),
    [editor, categories],
  );

  const term = active?.trigger.term ?? "";
  const category = active?.trigger.category ?? null;
  useEffect(() => {
    for (const source of sources)
      source.onQuery?.(
        category === null || source.category === category ? term.trim() : "",
      );
  }, [sources, term, category]);

  useEffect(() => {
    const notify = (focused: boolean) => {
      for (const source of sources) source.onFocus?.(focused);
      return false;
    };
    if (editor.getRootElement() === document.activeElement) notify(true);
    const off = [
      editor.registerCommand(
        FOCUS_COMMAND,
        () => notify(true),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => notify(false),
        COMMAND_PRIORITY_LOW,
      ),
    ];
    return () => {
      for (const dispose of off) dispose();
    };
  }, [editor, sources]);

  const [state, setState] = useState<MentionMenuState>(EMPTY_MENTION_STATE);
  useEffect(() => {
    if (!active) {
      setState(EMPTY_MENTION_STATE);
      return;
    }
    const next = resolveMentionState(
      sources,
      active.trigger.category,
      active.trigger.term,
      active.trigger.category === null && active.trigger.term === ""
        ? readMentionRecents(Date.now())
        : [],
    );
    if (!(next instanceof Promise)) {
      setState(next);
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    let live = true;
    next.then((resolved) => {
      if (live) setState(resolved);
    });
    return () => {
      live = false;
    };
  }, [active, sources]);

  const queryKey = active
    ? `${active.trigger.category ?? ""}:${active.trigger.term}`
    : "";
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the highlight whenever the query changes
  useEffect(() => setHighlight(0), [queryKey]);
  const index = Math.min(highlight, Math.max(state.rows.length - 1, 0));

  const dismiss = (remember: boolean) => {
    if (remember && active)
      dismissed.current = mentionTriggerKey(active.trigger);
    setActive(null);
  };
  const dismissLater = useEffectEvent(dismiss);

  const replaceTrigger = (apply: (select: () => RangeSelection) => void) => {
    if (!active) return;
    const { trigger, anchorKey } = active;
    editor.update(() => {
      const node = $getNodeByKey(anchorKey);
      if ($isTextNode(node))
        apply(() => node.select(trigger.start, trigger.start + trigger.length));
    });
  };

  const selectRow = (row: MentionRow) => {
    if (row.type === "category") {
      replaceTrigger((select) => {
        const selection = select();
        if ($isRangeSelection(selection))
          selection.insertText(`@${row.source.category}:`);
      });
      return;
    }
    replaceTrigger((select) => {
      const selection = select();
      if ($isRangeSelection(selection))
        selection.insertNodes([
          $createMentionNode(row.item.kind, row.item.id, row.item.label),
          $createTextNode(" "),
        ]);
    });
    recordMentionRecent(row.source.category, row.item, Date.now());
    setActive(null);
  };

  const spaced = active !== null && /\s/.test(active.trigger.term);
  const open =
    active !== null &&
    (spaced
      ? state.rows.length > 0 || state.loading
      : state.rows.length > 0 || state.empty !== null || state.loading);

  useEffect(() => {
    if (!open) return;
    const move = (delta: number) => {
      setHighlight((h) =>
        state.rows.length === 0
          ? 0
          : (h + delta + state.rows.length) % state.rows.length,
      );
      return true;
    };
    const pick = (event: KeyboardEvent | null) => {
      const row = state.rows[index];
      if (!row && !state.loading) return false;
      event?.preventDefault();
      if (row) selectRow(row);
      return true;
    };
    const off = [
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          event?.preventDefault();
          return move(1);
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          event?.preventDefault();
          return move(-1);
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        pick,
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(KEY_TAB_COMMAND, pick, COMMAND_PRIORITY_CRITICAL),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (event) => {
          event?.preventDefault();
          event?.stopPropagation();
          dismiss(true);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          if (
            !active ||
            active.trigger.category === null ||
            active.trigger.shorthand ||
            active.trigger.term !== ""
          )
            return false;
          replaceTrigger((select) => {
            const selection = select();
            if ($isRangeSelection(selection)) selection.insertText("@");
          });
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          requestAnimationFrame(() => dismissLater(true));
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    ];
    return () => {
      for (const dispose of off) dispose();
    };
  });

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    if (open) {
      root.setAttribute("aria-expanded", "true");
      root.setAttribute("aria-activedescendant", `capy-mention-row-${index}`);
    } else if (
      root
        .getAttribute("aria-activedescendant")
        ?.startsWith("capy-mention-row-")
    ) {
      root.removeAttribute("aria-activedescendant");
      root.setAttribute("aria-expanded", "false");
    }
  }, [editor, open, index]);

  const highlighted = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the highlight moves
  useEffect(() => {
    highlighted.current?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open || !active) return null;
  const place = placeMenuInWindow(active.rect, editor.getRootElement(), {
    width: MENU_WIDTH,
    maxHeight: MENTION_MENU_MAX_HEIGHT,
  });
  return createPortal(
    <ComposerMentionMenu
      className={CARET_MENU_LAYER}
      style={{ left: place.left, top: place.top, bottom: place.bottom }}
    >
      <MentionMenuSurface
        state={state}
        highlight={index}
        onSelect={selectRow}
        onHighlight={setHighlight}
        highlightedRef={highlighted}
        maxHeight={place.maxHeight}
      />
    </ComposerMentionMenu>,
    document.body,
  );
}
