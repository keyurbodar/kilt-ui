// Vendored from Kiki (components/markdown-chips/previews.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Link } from "@/registry/kilt/app/lib/route-link";
import type { ChipIssue, ChipPull, ChipTask, ChipThread } from "./context";
import { useMarkdownChips } from "./context";
import {
  ChipGlyph,
  PullStateIcon,
  TaskStatusIcon,
  ThreadStatusIcon,
} from "./icons";
import { relativeTime } from "./relative-time";

export const pullRouteParams = (repo: string, number: number) => {
  const [owner = "", name = repo] = repo.split("/");
  return { owner, repo: name, prNumber: String(number) };
};

/** Capy's Avatar at size xs: image over the initial on a secondary tile. */
function SmallAvatar({ name, src }: { name: string; src?: string }) {
  return (
    <span className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary text-2xs">
      {src === undefined || src === "" ? (
        name.charAt(0).toUpperCase()
      ) : (
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}

export function DiffCount({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  return (
    <span className="shrink-0 tabular-nums">
      <span className="text-diff-add">+{additions}</span>{" "}
      <span className="text-diff-del">-{deletions}</span>
    </span>
  );
}

const pullLabel = (pull: ChipPull, multirepo: boolean) =>
  multirepo
    ? `${pull.repo.split("/")[1] ?? pull.repo}#${pull.number}`
    : `#${pull.number}`;

/** shared/pull-preview PullRequestHoverPanel: one row per pull request. */
export function PullRequestHoverPanel({
  prs,
  multirepo,
  onOpen,
}: {
  prs: readonly ChipPull[];
  multirepo: boolean;
  onOpen?: (pull: { repo: string; number: number; url: string }) => void;
}) {
  return (
    <div className="-m-1.5 flex flex-col gap-0.5 p-0.5">
      {prs.map((pull) => (
        <Link
          key={`${pull.repo}#${pull.number}`}
          to="/pull/$owner/$repo/$prNumber"
          params={pullRouteParams(pull.repo, pull.number)}
          onClick={(event) => {
            if (onOpen === undefined) return;
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            onOpen({
              repo: pull.repo,
              number: pull.number,
              url:
                pull.url ??
                `https://github.com/${pull.repo}/pull/${pull.number}`,
            });
          }}
          className="flex items-center gap-2 rounded px-1.5 py-1 outline-none select-none transition-colors duration-100 hover:bg-popover-hover focus-visible:outline-ring-inset"
        >
          <PullStateIcon state={pull.state} />
          <span className="shrink-0 text-xs font-normal text-muted-foreground-2 tabular-nums">
            {pullLabel(pull, multirepo)}
          </span>
          <span className="mask-fade-r min-w-0 flex-1 overflow-hidden text-sm font-medium whitespace-nowrap text-foreground">
            {pull.title}
          </span>
          <span className="shrink-0 text-xs font-medium">
            <DiffCount additions={pull.additions} deletions={pull.deletions} />
          </span>
          <SmallAvatar name={pull.author} src={pull.authorAvatarUrl} />
        </Link>
      ))}
    </div>
  );
}

const taskStatusLabels: Record<string, string> = {
  working: "Working",
  waiting: "Waiting",
  idle: "Idle",
  failed: "Failed",
  archived: "Archived",
  done: "Done",
  stopped: "Stopped",
};

const taskStatusLabel = (task: ChipTask) =>
  task.status === "draft"
    ? "Draft"
    : task.queuedSince !== null &&
        task.status !== "working" &&
        task.status !== "archived"
      ? "Queued"
      : (taskStatusLabels[task.status] ?? task.status);

/** Capy's task hover card: subagent number and age, title, status footer. */
export function TaskPreview({ task, now }: { task: ChipTask; now: number }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground-2">
        <span>
          {task.localIndex === null
            ? "Side thread"
            : `Subagent ${task.localIndex}`}
        </span>
        <span className="ml-auto" suppressHydrationWarning>
          {relativeTime(Date.parse(task.lastActivityAt ?? task.createdAt), now)}
        </span>
      </div>
      <span className="mt-1 text-sm font-medium text-foreground">
        {task.title ?? "Untitled subagent"}
      </span>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t-hairline border-border-1 pt-2.5 text-xs font-medium text-muted-foreground-1">
        <span className="flex items-center gap-1.5">
          <TaskStatusIcon task={task} className="size-(--icon-sm) shrink-0" />
          {taskStatusLabel(task)}
        </span>
      </div>
    </div>
  );
}

const issueStatusLabels: Record<ChipIssue["status"], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  canceled: "Canceled",
};

const issuePriorityLabels: Record<ChipIssue["priority"], string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

/** Capy's issue hover card: state, code, private mark and priority over the title and assignee. */
export function IssuePreview({ issue }: { issue: ChipIssue }) {
  const { renderIssueState, renderIssuePriority } = useMarkdownChips();
  return (
    <div className="flex flex-col gap-1.5 px-0.5">
      <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground-2">
        {renderIssueState?.(issue, "size-(--icon-xs)")}
        <span className="tabular-nums">{issue.code}</span>
        <span>{issue.stateName ?? issueStatusLabels[issue.status]}</span>
        {issue.visibility === "private" && (
          <ChipGlyph
            name="key-1"
            label="Private"
            className="size-(--icon-xs) shrink-0"
          />
        )}
        <span className="ml-auto flex items-center gap-1">
          {renderIssuePriority?.(issue, "size-(--icon-xs)")}
          {issuePriorityLabels[issue.priority]}
        </span>
      </div>
      <span className="text-sm font-medium text-foreground">{issue.title}</span>
      {issue.assignee !== null && (
        <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground-1">
          <SmallAvatar
            name={issue.assignee.name}
            src={issue.assignee.avatarUrl}
          />
          {issue.assignee.name}
        </span>
      )}
    </div>
  );
}

/**
 * Header of Capy's thread hover card (shared/thread-preview ThreadPreview):
 * status and code, title, model. The issues, pulls and crew sections of the
 * full card belong to the thread-preview package.
 */
export function ThreadChipPreview({ thread }: { thread: ChipThread }) {
  return (
    <div className="-m-1.5 flex max-h-88 min-h-0 flex-col p-0.5">
      <div className="flex shrink-0 flex-col gap-1.5 px-2 pt-1 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground-2">
          <ThreadStatusIcon
            thread={thread}
            className="size-(--icon-sm) shrink-0"
          />
          <span className="whitespace-nowrap">{thread.code}</span>
        </div>
        <span className="line-clamp-2 text-sm font-medium text-foreground">
          {thread.title ?? thread.code}
        </span>
        {thread.modelLabel !== undefined && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground-2">
            <span className="flex items-center gap-1 whitespace-nowrap">
              {thread.modelLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
