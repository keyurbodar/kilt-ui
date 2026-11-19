// Vendored from Kiki (components/composer/command-plugin.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CommandMenuSurface,
  ComposerCommandMenu,
  SKILLS_COMMAND,
} from "./command-menu";
import { commandEmptyLabel, resolveCommandRows } from "./command-rows";
import { $createMentionNode } from "./mention-node";
import { CARET_MENU_LAYER, caretRect, VOICE_TAG } from "./mention-plugin";
import {
  type CaretRect,
  COMMAND_MENU_MAX_HEIGHT,
  MENU_WIDTH,
  placeMenuInWindow,
} from "./menu-position";
import {
  type CommandTrigger,
  commandTriggerKey,
  commandTriggerLength,
  findCommandTrigger,
} from "./triggers";
import type {
  CommandRow,
  ComposerCommand,
  MentionItem,
  MentionSource,
} from "./types";

type ActiveCommand = {
  trigger: CommandTrigger;
  anchorKey: string;
  rect: CaretRect;
};

export function CommandPlugin({
  commands,
  skills,
}: {
  commands: ComposerCommand[];
  skills?: MentionSource;
}) {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState<ActiveCommand | null>(null);
  const [highlight, setHighlight] = useState(0);
  const dismissed = useRef<string | null>(null);
  const pickers = useMemo(
    () =>
      commands.filter(
        (c): c is Extract<ComposerCommand, { kind: "picker" }> =>
          c.kind === "picker",
      ),
    [commands],
  );
  const names = useMemo(
    () => [
      ...pickers.flatMap((c) => [c.name, ...(c.aliases ?? [])]),
      ...(skills === undefined ? [] : [SKILLS_COMMAND]),
    ],
    [pickers, skills],
  );

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
          if (!$isTextNode(node)) return null;
          const trigger = findCommandTrigger(
            node.getTextContent().slice(0, anchor.offset),
            names,
          );
          return trigger ? { trigger, anchorKey: node.getKey() } : null;
        });
        if (!found) {
          dismissed.current = null;
          setActive(null);
          return;
        }
        if (dismissed.current === commandTriggerKey(found.trigger)) return;
        const rect = caretRect();
        if (rect) setActive({ ...found, rect });
      }),
    [editor, names],
  );

  const picker =
    active?.trigger.command === null || active === null
      ? undefined
      : pickers.find(
          (c) =>
            c.name === active.trigger.command ||
            c.aliases?.includes(active.trigger.command ?? "") === true,
        );
  const term = active?.trigger.term.trim().toLowerCase() ?? "";
  const skillsMode =
    active?.trigger.command === SKILLS_COMMAND && skills !== undefined;

  const [skillResult, setSkillResult] = useState<{
    items: MentionItem[];
    loading: boolean;
  }>({ items: [], loading: false });
  useEffect(() => {
    if (
      active === null ||
      skills === undefined ||
      (picker !== undefined && !skillsMode)
    ) {
      setSkillResult({ items: [], loading: false });
      return;
    }
    const result = skills.search(term);
    if (!(result instanceof Promise)) {
      setSkillResult({ items: result, loading: false });
      return;
    }
    setSkillResult((prev) => ({ ...prev, loading: true }));
    let live = true;
    result.then((items) => {
      if (live) setSkillResult({ items, loading: false });
    });
    return () => {
      live = false;
    };
  }, [active, skills, picker, skillsMode, term]);

  const { rows, headers } =
    active === null
      ? { rows: [] as CommandRow[], headers: new Map<number, string>() }
      : resolveCommandRows({
          commands,
          picker,
          skills,
          skillsMode,
          skillItems: skillResult.items,
          term,
        });
  const empty = commandEmptyLabel(rows, active !== null, skillsMode, picker);
  const loading =
    picker?.loading === true ||
    (skills !== undefined &&
      skillResult.loading &&
      (skillsMode || picker === undefined));
  const firstSelectable = Number(rows[0]?.type === "back" && rows.length > 1);
  const queryKey = `${active?.trigger.command ?? ""}:${active?.trigger.term ?? ""}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the highlight whenever the query changes
  useEffect(() => setHighlight(firstSelectable), [queryKey, firstSelectable]);
  const index = Math.min(highlight, Math.max(rows.length - 1, 0));

  const dismiss = (remember: boolean) => {
    if (remember && active)
      dismissed.current = commandTriggerKey(active.trigger);
    setActive(null);
  };
  const dismissLater = useEffectEvent(dismiss);

  const replaceTrigger = (text: string, after?: () => void) => {
    if (!active) return;
    const { trigger, anchorKey } = active;
    editor.update(() => {
      const node = $getNodeByKey(anchorKey);
      if ($isTextNode(node))
        node
          .select(trigger.start, trigger.start + commandTriggerLength(trigger))
          .insertText(text);
    });
    after?.();
  };

  const selectRow = (row: CommandRow) => {
    if (row.type === "back") return replaceTrigger("/");
    if (row.type === "skill") {
      if (!active) return;
      const { trigger, anchorKey } = active;
      editor.update(() => {
        const node = $getNodeByKey(anchorKey);
        if ($isTextNode(node))
          node
            .select(
              trigger.start,
              trigger.start + commandTriggerLength(trigger),
            )
            .insertNodes([
              $createMentionNode(row.item.kind, row.item.id, row.item.label),
              $createTextNode(" "),
            ]);
      });
      setActive(null);
      return;
    }
    if (row.type === "skills") return replaceTrigger(`/${SKILLS_COMMAND}:`);
    if (row.type === "item") {
      replaceTrigger("", () => row.command.select(row.item));
      setActive(null);
      return;
    }
    const command = row.command;
    if (command.kind === "picker") return replaceTrigger(`/${command.name}:`);
    if (command.kind === "insert") replaceTrigger(command.text);
    else replaceTrigger("", command.run);
    setActive(null);
  };

  const open =
    active !== null && (rows.length > 0 || empty !== null || loading);

  useEffect(() => {
    if (!open) return;
    const move = (delta: number) => {
      setHighlight((h) =>
        rows.length === 0 ? 0 : (h + delta + rows.length) % rows.length,
      );
      return true;
    };
    const pick = (event: KeyboardEvent | null) => {
      const row = rows[index];
      if (!row) return false;
      event?.preventDefault();
      selectRow(row);
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
          if (active?.trigger.command === null) dismiss(true);
          else replaceTrigger("/");
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          if (
            !active ||
            active.trigger.command === null ||
            active.trigger.term !== ""
          )
            return false;
          event?.preventDefault();
          replaceTrigger("/");
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
    const clear = () => {
      if (
        root
          .getAttribute("aria-activedescendant")
          ?.startsWith("capy-command-row-")
      ) {
        root.removeAttribute("aria-activedescendant");
        root.setAttribute("aria-expanded", "false");
      }
    };
    if (open) {
      root.setAttribute("aria-expanded", "true");
      root.setAttribute("aria-activedescendant", `capy-command-row-${index}`);
    } else clear();
    return clear;
  }, [editor, open, index]);

  const highlighted = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the highlight moves
  useEffect(() => {
    highlighted.current?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open || !active) return null;
  const place = placeMenuInWindow(active.rect, editor.getRootElement(), {
    width: MENU_WIDTH,
    maxHeight: COMMAND_MENU_MAX_HEIGHT,
  });
  return createPortal(
    <ComposerCommandMenu
      className={CARET_MENU_LAYER}
      style={{ left: place.left, top: place.top, bottom: place.bottom }}
    >
      <CommandMenuSurface
        rows={rows}
        command={skillsMode ? SKILLS_COMMAND : (picker?.name ?? null)}
        loading={loading}
        empty={empty}
        highlight={index}
        headers={headers}
        onSelect={selectRow}
        onHighlight={setHighlight}
        highlightedRef={highlighted}
        maxHeight={place.maxHeight}
      />
    </ComposerCommandMenu>,
    document.body,
  );
}
