// Vendored from Kiki (components/markdown-chips/context.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { createContext, type ReactNode, useContext } from "react";
type IssueStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "canceled";
type IssuePriority = "urgent" | "high" | "normal" | "low";

export type ChipPullState =
  | "ready"
  | "pending"
  | "draft"
  | "merged"
  | "failed"
  | "closed";

export type ChipPull = {
  /** owner/repo */
  repo: string;
  number: number;
  state: ChipPullState;
  title: string;
  url?: string;
  additions: number;
  deletions: number;
  author: string;
  authorAvatarUrl?: string;
};

export type ChipThreadStatus =
  | "working"
  | "waiting"
  | "failed"
  | "idle"
  | "done";

export type ChipThread = {
  id: string;
  code: string;
  title: string | null;
  status: ChipThreadStatus;
  archived?: boolean;
  projectId: string | null;
  /** Label of the model the thread last ran on, e.g. "Claude Opus 5.5". */
  modelLabel?: string;
};

export type ChipTaskStatus =
  | "draft"
  | "working"
  | "waiting"
  | "idle"
  | "failed"
  | "done"
  | "stopped"
  | "archived";

export type ChipTask = {
  id: string;
  localIndex: number | null;
  title: string | null;
  status: ChipTaskStatus;
  queuedSince: string | null;
  lastActivityAt: string | null;
  createdAt: string;
};

export type ChipIssue = {
  code: string;
  title: string;
  status: IssueStatus;
  /** Custom state name, when the issue sits in a renamed state. */
  stateName?: string;
  priority: IssuePriority;
  visibility: "shared" | "private";
  assignee: { name: string; avatarUrl?: string } | null;
};

export type ChipMention =
  | { kind: "secret"; id: string; label: string; text: string }
  | {
      kind: "skill" | "device" | "slack_channel" | "user";
      id: string;
      label: string;
    }
  | { kind: "file"; id: string; label: string }
  | { kind: "task"; id: string; label: string }
  | { kind: "thread"; id: string; label: string }
  | { kind: "pr"; id: string; label: string; pull?: ChipPull };

export type ChipPreviewMode = "card" | "none";

/**
 * What a markdown surface knows about the references in its text. Capy keeps
 * the same shape in its chip context; each surface (thread, PR, issue, drive)
 * fills it from its own atoms.
 */
export type MarkdownChipsContextValue = {
  /** false renders every chip as plain text (previews, notifications). */
  interactive?: boolean;
  /** "none" drops hover cards and keeps native titles. */
  preview?: ChipPreviewMode;
  /** owner/repo of the surface, so bare #N refs resolve. */
  repository?: string;
  projectId?: string | null;
  /** Keyed by "owner/repo#N". */
  pullRequests?: ReadonlyMap<string, ChipPull>;
  /** Keyed by thread code; "ambiguous" when several projects share the code. */
  threads?: ReadonlyMap<string, ChipThread | "ambiguous">;
  /** Keyed by the N in "Subagent N". */
  tasks?: ReadonlyMap<number, ChipTask>;
  /** Keyed by issue code. */
  issues?: ReadonlyMap<string, ChipIssue>;
  /** Keyed by the data-mention index. */
  mentions?: ReadonlyMap<number, ChipMention>;
  resolvePath?: (
    path: string,
  ) => { kind: "file" | "folder"; path: string } | undefined;
  openFile?: (path: string) => void;
  openFolder?: (path: string) => void;
  openTask?: (taskId: string) => void;
  /** null renders thread chips without links. Return true to take over the click. */
  openThread?: ((threadId: string) => boolean) | null;
  openIssue?: (code: string) => boolean;
  openPull?: (pull: { repo: string; number: number; url: string }) => void;
  driveOpener?: (target: {
    location: string | undefined;
    path: string;
  }) => (() => void) | undefined;
  paperOpener?: (
    fileId: string,
    pageId: string | undefined,
  ) => (() => void) | undefined;
  /** Issue state glyph; the issues feature passes its IssueStateIcon. */
  renderIssueState?: (issue: ChipIssue, className: string) => ReactNode;
  /** Issue priority glyph; the issues feature passes its IssuePriorityIcon. */
  renderIssuePriority?: (issue: ChipIssue, className: string) => ReactNode;
  /** Clock for relative times in task previews. */
  now?: () => number;
};

const MarkdownChipsContext = createContext<MarkdownChipsContextValue>({});

export function MarkdownChipsProvider({
  value,
  children,
}: {
  value: MarkdownChipsContextValue;
  children?: ReactNode;
}) {
  return (
    <MarkdownChipsContext.Provider value={value}>
      {children}
    </MarkdownChipsContext.Provider>
  );
}

export const useMarkdownChips = () => useContext(MarkdownChipsContext);

export const pullKey = (repo: string, number: number) =>
  `${repo.toLowerCase()}#${number}`;
