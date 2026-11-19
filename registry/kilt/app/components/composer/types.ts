// Vendored from Kiki (components/composer/types.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComponentType, ReactNode } from "react";

export type ComposerMentionKind =
  | "user"
  | "thread"
  | "captain"
  | "pull"
  | "issue"
  | "skill"
  | "plugin"
  | "subagent"
  | "device"
  | "file"
  | "excerpt"
  | "secret"
  | "task"
  | (string & {});

export type ComposerMention = {
  kind: ComposerMentionKind;
  id: string;
  label: string;
  start: number;
  end: number;
  text: string;
};

export type ComposerFileRef = { fileId: string; name?: string };

export type ComposerPayload = {
  text: string;
  mentions: ComposerMention[];
  files: ComposerFileRef[];
  caret?: number | null;
};

export type ComposerDelivery = "interrupt" | "queue" | "steer";

export type ComposerEnterAction = ComposerDelivery | "newline";

export type ComposerInputPrefs = {
  enter: ComposerEnterAction;
  modEnter: ComposerDelivery;
  altEnter: ComposerDelivery;
};

export type TextRange = { start: number; end: number };

export type MentionItem = {
  kind: ComposerMentionKind;
  id: string;
  label: string;
  subtitle?: string;
  text?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  hint?: ReactNode;
  section?: string;
  boost?: number;
  labelRanges?: TextRange[];
  subtitleRanges?: TextRange[];
};

export type MentionSearchResult = MentionItem[] | Promise<MentionItem[]>;

export type MentionSource = {
  category: string;
  kind: ComposerMentionKind;
  label: string;
  description?: string;
  icon: ComponentType;
  search: (term: string) => MentionSearchResult;
  initial?: () => MentionSearchResult;
  lookup?: (id: string) => MentionItem | undefined;
  onQuery?: (term: string) => void;
  onFocus?: (focused: boolean) => void;
  ranked?: boolean;
  closed?: boolean;
  settling?: (term: string) => boolean;
  failure?: () => string | null;
  notice?: () => string | null;
};

export type CommandPickerItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  group?: string;
  searchTerms?: string[];
};

type CommandBase = {
  name: string;
  label: string;
  icon?: ReactNode;
  aliases?: string[];
  searchTerms?: string[];
};

export type ComposerCommand =
  | (CommandBase & { kind: "action"; run: () => void; active?: boolean })
  | (CommandBase & { kind: "insert"; text: string })
  | (CommandBase & {
      kind: "picker";
      items: CommandPickerItem[];
      select: (item: CommandPickerItem) => void;
      emptyLabel: string;
      loading?: boolean;
    });

export type MentionRow =
  | { type: "category"; source: MentionSource }
  | { type: "item"; item: MentionItem; source: MentionSource };

export type MentionMenuState = {
  rows: MentionRow[];
  headers: Map<number, string>;
  empty: string | null;
  loading: boolean;
  notice: string | null;
};

export type CommandRow =
  | { type: "back" }
  | { type: "command"; command: ComposerCommand }
  | {
      type: "item";
      command: Extract<ComposerCommand, { kind: "picker" }>;
      item: CommandPickerItem;
    }
  | { type: "skills"; source: MentionSource }
  | { type: "skill"; source: MentionSource; item: MentionItem };
