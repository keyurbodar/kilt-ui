// Vendored from Kiki (components/markdown-chips/chips.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Link } from "@/registry/kilt/app/lib/route-link";
import { cx } from "class-variance-authority";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/registry/kilt/app/primitives/preview-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/kilt/app/primitives/tooltip";
import {
  chipAmbiguousClass,
  chipDashedClass,
  chipFileTextClass,
  chipIconClass,
  chipLinkClass,
  chipPreviewCardClass,
  chipTextClass,
  chipTooltipClass,
} from "./classes";
import {
  type ChipMention,
  type ChipPull,
  type ChipThread,
  pullKey,
  useMarkdownChips,
} from "./context";
import { useMotionDelayMs } from "./delay";
import type { ChipGlyphName } from "./glyphs";
import {
  ChipFileIcon,
  ChipGlyph,
  PullStateIcon,
  TaskStatusIcon,
  ThreadStatusIcon,
} from "./icons";
import {
  IssuePreview,
  PullRequestHoverPanel,
  pullRouteParams,
  TaskPreview,
  ThreadChipPreview,
} from "./previews";
import { classifyHref, parseCodes, parseDriveReference } from "./references";

function ChipTooltip({
  trigger,
  children,
}: {
  trigger: ReactElement;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent side="bottom" sideOffset={4} className={chipTooltipClass}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

function ChipPreview({
  trigger,
  label,
  className,
  side = "right",
  children,
}: {
  trigger: ReactElement;
  label?: ReactNode;
  className?: string;
  side?: "right" | "bottom";
  children: ReactNode;
}) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={trigger}
        delay={useMotionDelayMs("--delay-preview")}
        closeDelay={0}
      >
        {label}
      </PreviewCardTrigger>
      <PreviewCardContent
        side={side}
        align="start"
        sideOffset={8}
        className={cx(chipPreviewCardClass, className)}
      >
        {children}
      </PreviewCardContent>
    </PreviewCard>
  );
}

const hasModifier = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const takeOverClick =
  (open: ((id: string) => boolean) | undefined, id: string) =>
  (event: MouseEvent) => {
    if (open === undefined || hasModifier(event)) return;
    if (open(id)) event.preventDefault();
  };

export type FileOpenChipProps = Omit<ComponentProps<"span">, "onClick"> & {
  onOpen: () => void;
  dashed?: boolean;
};

/** A clickable file reference that opens the file pane. */
export function FileOpenChip({
  onOpen,
  dashed,
  children,
  ...props
}: FileOpenChipProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Capy keeps file chips inline spans so they wrap with the text
    <span
      role="button"
      tabIndex={0}
      {...props}
      className={cx(
        chipLinkClass,
        "break-all",
        dashed === true && chipDashedClass,
      )}
      onClick={onOpen}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen();
      }}
    >
      {children}
    </span>
  );
}

const stripPosition = (value: string) => value.replace(/:\d+(?::\d+)?$/, "");

function useFileReference(path: string, onOpen?: () => void) {
  const chips = useMarkdownChips();
  const resolved =
    chips.resolvePath === undefined
      ? ({ kind: "file", path } as const)
      : chips.resolvePath(path);
  const opener =
    resolved?.kind === "folder"
      ? chips.openFolder
      : resolved === undefined
        ? undefined
        : chips.openFile;
  const open =
    chips.interactive === false
      ? undefined
      : (onOpen ??
        (resolved === undefined || opener === undefined
          ? undefined
          : () => opener(resolved.path)));
  return (label: ReactNode) => {
    const iconName =
      resolved?.kind === "folder" ? `${path.replace(/\/+$/, "")}/` : path;
    const content = (
      <>
        <ChipFileIcon name={iconName} className={chipIconClass} />
        {label}
      </>
    );
    return open === undefined ? (
      <span className={chipFileTextClass}>{content}</span>
    ) : (
      <FileOpenChip onOpen={open}>{content}</FileOpenChip>
    );
  };
}

/** A file path from a link target, labelled by the link text. */
export function FileReference({
  path,
  children,
}: {
  path: string;
  children?: ReactNode;
}) {
  return useFileReference(path)(children);
}

/** Inline code that names a directory: a chip when the surface resolves it. */
export function PathChip({ value }: { value: string }) {
  const { resolvePath } = useMarkdownChips();
  if (resolvePath?.(value) === undefined) return <code>{value}</code>;
  return <FileReference path={value}>{value}</FileReference>;
}

/** A file path in text; a tooltip carries the full path when a label stands in for it. */
export function FileChip({
  value,
  label,
  onOpen,
}: {
  value: string;
  label?: string;
  onOpen?: () => void;
}) {
  const path = stripPosition(value);
  const chip = useFileReference(path, onOpen)(label ?? value);
  if (label === undefined) return chip;
  return <ChipTooltip trigger={chip}>{path}</ChipTooltip>;
}

/** "Subagent N" with the subagent's status and a hover card. */
export function TaskChip({ value }: { value: string }) {
  const chips = useMarkdownChips();
  const code = parseCodes(value)[0];
  const task = code?.kind === "task" ? chips.tasks?.get(code.index) : undefined;
  if (task === undefined || chips.interactive === false) return value;
  const open = chips.openTask;
  const trigger =
    open === undefined ? (
      <span className={`${chipTextClass} whitespace-nowrap`} />
    ) : (
      <button
        type="button"
        className={`${chipLinkClass} whitespace-nowrap`}
        onClick={() => open(task.id)}
      />
    );
  const label = (
    <>
      <TaskStatusIcon task={task} className={chipIconClass} />
      {value}
    </>
  );
  if (chips.preview === "none") return cloneTrigger(trigger, label);
  return (
    <ChipPreview trigger={trigger} label={label}>
      <TaskPreview task={task} now={chips.now?.() ?? Date.now()} />
    </ChipPreview>
  );
}

const cloneTrigger = (trigger: ReactElement, label: ReactNode) => (
  <trigger.type {...(trigger.props as object)}>{label}</trigger.type>
);

function AmbiguousThreadCode({ code }: { code: string }) {
  return (
    <ChipTooltip
      trigger={
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Capy keeps the code focusable so keyboard users reach its tooltip
        <span tabIndex={0} className={chipAmbiguousClass}>
          {code}
        </span>
      }
    >
      {`More than one project has a ${code}, so this code doesn't link to one thread`}
    </ChipTooltip>
  );
}

function useThreadByCode(code: string): ChipThread | "ambiguous" | undefined {
  const chips = useMarkdownChips();
  const found = chips.threads?.get(code);
  if (found === "ambiguous") return found;
  if (found === undefined) return;
  if (chips.projectId != null && found.projectId !== chips.projectId) return;
  return found;
}

function ThreadLinkChip({
  thread,
  label,
}: {
  thread: ChipThread;
  label: ReactNode;
}) {
  const chips = useMarkdownChips();
  const icon = <ThreadStatusIcon thread={thread} className={chipIconClass} />;
  const title = thread.title ?? undefined;
  if (chips.openThread === null)
    return (
      <span title={title} className={`${chipTextClass} whitespace-nowrap`}>
        {icon}
        {label}
      </span>
    );
  const link = (
    <Link
      to="/thread/$threadId"
      params={{ threadId: thread.id }}
      title={chips.preview === "none" ? title : undefined}
      className={`${chipLinkClass} whitespace-nowrap`}
      onClick={takeOverClick(chips.openThread, thread.id)}
    />
  );
  const content = (
    <>
      {icon}
      {label}
    </>
  );
  if (chips.preview === "none") return cloneTrigger(link, content);
  return (
    <ChipPreview trigger={link} label={content} className="w-96">
      <ThreadChipPreview thread={thread} />
    </ChipPreview>
  );
}

/** A thread code (KIKI-12) linking to its thread with a hover card. */
export function ThreadChip({ value }: { value: string }) {
  const chips = useMarkdownChips();
  const thread = useThreadByCode(value);
  if (thread === undefined || chips.interactive === false) return value;
  if (thread === "ambiguous") return <AmbiguousThreadCode code={value} />;
  return <ThreadLinkChip thread={thread} label={value} />;
}

/** An issue code; codes that aren't issues fall back to thread chips. */
export function IssueChip({ value }: { value: string }) {
  const chips = useMarkdownChips();
  const issue = chips.issues?.get(value);
  if (issue === undefined) return <ThreadChip value={value} />;
  if (chips.interactive === false) return value;
  const link = (
    <Link
      to="/issues/$code"
      params={{ code: issue.code }}
      className={cx(chipLinkClass, "whitespace-nowrap")}
      onClick={(event) => {
        if (chips.openIssue === undefined || hasModifier(event)) return;
        if (chips.openIssue(issue.code)) event.preventDefault();
      }}
    />
  );
  const label = (
    <>
      {chips.renderIssueState?.(issue, chipIconClass)}
      <span className="tabular-nums">{issue.code}</span>
    </>
  );
  if (chips.preview === "none") return cloneTrigger(link, label);
  return (
    <ChipPreview trigger={link} label={label} className="w-80">
      <IssuePreview issue={issue} />
    </ChipPreview>
  );
}

const githubPullUrl = (repo: string, number: number) =>
  `https://github.com/${repo}/pull/${number}`;

/** Link to a pull request's pane; cmd/ctrl or middle click opens GitHub. */
export function PullReferenceLink({
  repositoryFullName,
  number,
  pull,
  className,
  anchorProps,
  children,
}: {
  repositoryFullName: string;
  number: number;
  pull?: ChipPull;
  className?: string;
  anchorProps?: ComponentProps<"a">;
  children?: ReactNode;
}) {
  const chips = useMarkdownChips();
  const url = pull?.url ?? githubPullUrl(repositoryFullName, number);
  const openExternal = (event: MouseEvent) => {
    if (
      event.type === "auxclick"
        ? event.button !== 1
        : !event.metaKey && !event.ctrlKey
    )
      return false;
    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  };
  const {
    href: _href,
    target: _target,
    rel: _rel,
    ...linkProps
  } = anchorProps ?? {};
  const link = (
    <Link
      {...(linkProps as object)}
      to="/pull/$owner/$repo/$prNumber"
      params={pullRouteParams(repositoryFullName, number)}
      className={cx(chipLinkClass, className)}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (openExternal(event)) return;
        if (chips.openPull === undefined) return anchorProps?.onClick?.(event);
        if (event.shiftKey || event.altKey) return;
        event.preventDefault();
        chips.openPull({ repo: repositoryFullName, number, url });
      }}
      onAuxClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (!openExternal(event)) anchorProps?.onAuxClick?.(event);
      }}
    />
  );
  if (pull === undefined || chips.preview === "none")
    return cloneTrigger(link, children);
  return (
    <ChipPreview trigger={link} label={children} className="w-96">
      <PullRequestHoverPanel prs={[pull]} multirepo onOpen={chips.openPull} />
    </ChipPreview>
  );
}

type PullTarget = { repo: string; number: number };

const unique = <T,>(values: readonly T[]) =>
  values.length === 1 ? values[0] : undefined;

/**
 * Resolves a "#N", "repo#N" or "owner/repo#N" reference. A short repository
 * name only resolves when the surface or the pull catalog names one repository
 * it could mean; anything ambiguous stays text rather than linking nowhere.
 */
function resolvePullTarget(
  reference: string,
  chips: {
    repository?: string | undefined;
    pullRequests?: ReadonlyMap<string, ChipPull> | undefined;
  },
): PullTarget | undefined {
  const hash = reference.lastIndexOf("#");
  if (hash === -1) return;
  const repo = reference.slice(0, hash);
  const number = Number(reference.slice(hash + 1));
  if (!Number.isInteger(number) || number <= 0) return;
  if (repo.includes("/")) return { repo, number };
  const known = [...(chips.pullRequests?.values() ?? [])];
  if (repo === "") {
    const surface = chips.repository;
    if (surface !== undefined) return { repo: surface, number };
    const pull = unique(known.filter((entry) => entry.number === number));
    return pull === undefined ? undefined : { repo: pull.repo, number };
  }
  const named = known.filter(
    (entry) => entry.number === number && entry.repo.split("/").at(-1) === repo,
  );
  const namedPull = unique(named);
  if (namedPull !== undefined) return { repo: namedPull.repo, number };
  const surface = chips.repository;
  if (surface !== undefined && surface.split("/").at(-1) === repo)
    return { repo: surface, number };
  const inCatalog = unique(
    known.filter((entry) => entry.repo.split("/").at(-1) === repo),
  );
  return inCatalog === undefined ? undefined : { repo: inCatalog.repo, number };
}

/** A pull reference with its state glyph and hover card, or plain text when it doesn't resolve. */
function ResolvedPullChip({
  value,
  reference,
}: {
  value: string;
  reference: string;
}) {
  const chips = useMarkdownChips();
  if (chips.interactive === false) return value;
  const target = resolvePullTarget(reference, chips);
  if (target === undefined) return value;
  const pull = chips.pullRequests?.get(pullKey(target.repo, target.number));
  if (pull === undefined)
    return (
      <a
        href={`https://github.com/${target.repo}/issues/${target.number}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    );
  return (
    <PullReferenceLink
      repositoryFullName={pull.repo}
      number={pull.number}
      pull={pull}
      className="whitespace-nowrap"
    >
      <PullStateIcon state={pull.state} className={chipIconClass} />
      {value}
    </PullReferenceLink>
  );
}

/**
 * owner/repo#N, repo#N or #N in text. The transform's value carries the
 * repository it inherited; the label is only what to show.
 */
export function PullChip({ value, label }: { value: string; label?: string }) {
  return <ResolvedPullChip value={label ?? value} reference={value} />;
}

/** drive:path references, opened in the drive pane when the surface can. */
export function DriveReferenceChip({
  location,
  path,
  children,
}: {
  location: string | undefined;
  path: string;
  children?: ReactNode;
}) {
  const chips = useMarkdownChips();
  const open = chips.driveOpener?.({ location, path });
  const name = path.split("/").at(-1) ?? path;
  const content = (
    <>
      <ChipFileIcon name={name} className={chipIconClass} />
      {children ?? name}
    </>
  );
  if (chips.interactive === false || open === undefined)
    return <span className={chipFileTextClass}>{content}</span>;
  return (
    <ChipTooltip trigger={<FileOpenChip onOpen={open}>{content}</FileOpenChip>}>
      {location === undefined ? path : `${location}/${path}`}
    </ChipTooltip>
  );
}

export function DriveChip({ value }: { value: string }) {
  const drive = parseDriveReference(value);
  if (drive === undefined) return value;
  return <DriveReferenceChip location={drive.location} path={drive.path} />;
}

const mentionGlyphs: Record<string, ChipGlyphName> = {
  file: "files",
  thread: "bubble-sparkle",
  pr: "pull-request",
  skill: "sparkle-2",
  secret: "key-1",
  excerpt: "bubble-wide",
  device: "devices",
  task: "tasks",
  slack_channel: "hashtag",
  user: "user",
};

export type MentionChipProps = ComponentProps<"span"> & {
  kind: string;
  label: string;
};

/** A structured @-mention from the composer, drawn as its kind's icon and label. */
export function MentionChip({
  kind,
  label,
  className,
  ...props
}: MentionChipProps) {
  const glyph = mentionGlyphs[kind];
  return (
    <span data-chip={kind} className={cx(chipTextClass, className)} {...props}>
      {kind === "slack_channel" ? (
        `#${label}`
      ) : (
        <>
          {kind === "file" ? (
            <ChipFileIcon name={label} className={chipIconClass} />
          ) : (
            glyph !== undefined && (
              <ChipGlyph name={glyph} className={chipIconClass} />
            )
          )}
          {label}
        </>
      )}
    </span>
  );
}

const mentionTooltips: Record<string, string> = {
  skill: "Skill",
  secret: "Secret",
  device: "Device",
  task: "Subagent",
  slack_channel: "Slack channel",
};

const mentionTooltip = (mention: ChipMention) => {
  if (mention.kind !== "file")
    return mentionTooltips[mention.kind] ?? mention.kind;
  const colon = mention.id.indexOf(":");
  return colon === -1 ? mention.id : mention.id.slice(colon + 1);
};

/** A data-mention span: the composer's mention, resolved through the surface's mention map. */
export function StructuredMentionChip({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  const chips = useMarkdownChips();
  const mention = chips.mentions?.get(Number(value));
  if (mention === undefined) return children ?? null;
  if (mention.kind === "secret") return children ?? mention.text;
  if (mention.kind === "thread") {
    const thread = [...(chips.threads?.values() ?? [])].find(
      (entry): entry is ChipThread =>
        entry !== "ambiguous" && entry.id === mention.id,
    );
    if (thread === undefined)
      return <MentionChip kind="thread" label={mention.label} />;
    if (chips.interactive === false) return mention.label;
    return <ThreadLinkChip thread={thread} label={mention.label} />;
  }
  if (mention.kind === "task") {
    const task = [...(chips.tasks?.values() ?? [])].find(
      (entry) => entry.id === mention.id,
    );
    if (task === undefined || chips.interactive === false)
      return <MentionChip kind="task" label={mention.label} />;
    const open = chips.openTask;
    const trigger =
      open === undefined ? (
        <span className={chipTextClass} />
      ) : (
        <button
          type="button"
          className={chipLinkClass}
          onClick={() => open(task.id)}
        />
      );
    const label = (
      <>
        <TaskStatusIcon task={task} className={chipIconClass} />
        {mention.label}
      </>
    );
    if (chips.preview === "none") return cloneTrigger(trigger, label);
    return (
      <ChipPreview trigger={trigger} label={label}>
        <TaskPreview task={task} now={chips.now?.() ?? Date.now()} />
      </ChipPreview>
    );
  }
  if (mention.kind === "pr") {
    const pull = mention.pull;
    if (pull === undefined)
      return <MentionChip kind="pr" label={mention.label} />;
    if (chips.interactive === false) return mention.label;
    return (
      <PullReferenceLink
        repositoryFullName={pull.repo}
        number={pull.number}
        pull={pull}
      >
        <PullStateIcon state={pull.state} className={chipIconClass} />
        {mention.label}
      </PullReferenceLink>
    );
  }
  if (mention.kind === "file") {
    const open = chips.interactive === false ? undefined : chips.openFile;
    const colon = mention.id.indexOf(":");
    const path =
      (colon === -1 ? mention.id : mention.id.slice(colon + 1)) ||
      mention.label;
    if (open === undefined)
      return <MentionChip kind="file" label={mention.label} />;
    if (path.endsWith("/"))
      return (
        <ChipTooltip
          trigger={<MentionChip kind="file" label={mention.label} />}
        >
          {path}
        </ChipTooltip>
      );
    return (
      <FileOpenChip onOpen={() => open(path)}>
        <ChipFileIcon name={mention.label} className={chipIconClass} />
        {mention.label}
      </FileOpenChip>
    );
  }
  return (
    <ChipTooltip
      trigger={<MentionChip kind={mention.kind} label={mention.label} />}
    >
      {mentionTooltip(mention)}
    </ChipTooltip>
  );
}

/**
 * An anchor the chip transform marked: pull request, commit, file, drive or
 * Paper links. Anything the link no longer classifies as stays a plain link.
 */
export function ReferenceLinkChip({
  kind,
  href,
  anchorProps,
  children,
}: {
  kind: string;
  href: string;
  anchorProps?: ComponentProps<"a">;
  children?: ReactNode;
}) {
  const chips = useMarkdownChips();
  if (chips.interactive === false) return <span>{children}</span>;
  const candidate = classifyHref(href);
  if (candidate === undefined || candidate.kind !== kind)
    return (
      <a href={href} {...anchorProps}>
        {children}
      </a>
    );
  if (candidate.kind === "file")
    return <FileReference path={candidate.path}>{children}</FileReference>;
  if (candidate.kind === "drive")
    return (
      <DriveReferenceChip location={candidate.location} path={candidate.path}>
        {children}
      </DriveReferenceChip>
    );
  if (candidate.kind === "paper") {
    const open = chips.paperOpener?.(candidate.fileId, candidate.pageId);
    return (
      <a
        {...anchorProps}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={open === undefined ? anchorProps?.className : chipLinkClass}
        onClick={
          open === undefined
            ? anchorProps?.onClick
            : (event) => {
                if (hasModifier(event)) return;
                event.preventDefault();
                open();
              }
        }
      >
        {children}
      </a>
    );
  }
  if (candidate.kind !== "pull_request")
    return (
      <a {...anchorProps} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  const pull = chips.pullRequests?.get(
    pullKey(candidate.repositoryFullName, candidate.number),
  );
  return (
    <PullReferenceLink
      repositoryFullName={candidate.repositoryFullName}
      number={candidate.number}
      pull={pull}
      anchorProps={anchorProps}
    >
      {pull === undefined ? (
        <ChipGlyph name="pull-request" className={chipIconClass} />
      ) : (
        <PullStateIcon state={pull.state} className={chipIconClass} />
      )}
      {children}
    </PullReferenceLink>
  );
}
