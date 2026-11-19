// Vendored from Kiki (components/markdown-chips/icons.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  createFileTreeIconResolver,
  getBuiltInSpriteSheet,
} from "@pierre/trees";
import { cx } from "class-variance-authority";
import { createElement, type SVGProps, useEffect } from "react";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import type { ChipPullState, ChipTask, ChipThread } from "./context";
import { type ChipGlyphName, chipGlyphs } from "./glyphs";

export type ChipGlyphProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: ChipGlyphName;
  label?: string;
};

/** One of Capy's 24-grid icon components, drawn from the ported path data. */
export function ChipGlyph({ name, label, ...props }: ChipGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={label === undefined}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      data-glyph={name}
      {...props}
    >
      {chipGlyphs[name].map(([tag, attributes], index) =>
        createElement(tag, { key: index, ...attributes }),
      )}
    </svg>
  );
}

const pullStates: Record<
  ChipPullState,
  { glyph: ChipGlyphName; className: string; label: string }
> = {
  ready: { glyph: "pull-request", className: "text-success", label: "open" },
  pending: {
    glyph: "pull-request",
    className: "text-warning-fg",
    label: "checks pending",
  },
  draft: {
    glyph: "draft",
    className: "text-muted-foreground-2",
    label: "draft",
  },
  merged: { glyph: "merged", className: "text-complete", label: "merged" },
  failed: {
    glyph: "shield-crossed",
    className: "text-destructive",
    label: "failing",
  },
  closed: {
    glyph: "request-closed",
    className: "text-destructive",
    label: "closed",
  },
};

export const pullStateLabel = (state: ChipPullState) => pullStates[state].label;

/** Capy's PullStateIcon: the state lives in the icon colour. */
export function PullStateIcon({
  state,
  className,
}: {
  state: ChipPullState;
  className?: string;
}) {
  const entry = pullStates[state];
  return (
    <ChipGlyph
      name={entry.glyph}
      className={cx("size-3 shrink-0", entry.className, className)}
    />
  );
}

const statusColors = {
  working: "text-muted-foreground dark:text-progress",
  waiting: "text-muted-foreground",
  failed: "text-destructive",
} as const;

const statusLabels = {
  working: "Working",
  waiting: "Waiting",
  failed: "Failed",
} as const;

type LiveStatus = keyof typeof statusColors;

const isLive = (status: string): status is LiveStatus => status in statusColors;

/**
 * Capy's ThreadStatusIcon for chips: the archive glyph for archived threads,
 * a status mark while working, waiting or failed, nothing otherwise.
 */
export function ThreadStatusIcon({
  thread,
  className,
}: {
  thread: Pick<ChipThread, "archived" | "status">;
  className?: string;
}) {
  if (thread.archived === true)
    return (
      <ChipGlyph
        name="archive"
        label="Archived"
        className={cx("text-muted-foreground-2", className)}
      />
    );
  if (!isLive(thread.status)) return null;
  return (
    <svg
      viewBox="0 0 14 14"
      role="img"
      aria-label={statusLabels[thread.status]}
      data-state={thread.status}
      className={cx(statusColors[thread.status], className)}
    >
      <circle cx="7" cy="7" r="3" fill="currentColor" />
    </svg>
  );
}

/** Capy's TaskStatusIcon: maps a subagent's status onto the thread icon. */
export function TaskStatusIcon({
  task,
  className,
}: {
  task: Pick<ChipTask, "status" | "queuedSince">;
  className?: string;
}) {
  const status =
    task.status === "draft"
      ? "idle"
      : task.queuedSince !== null &&
          task.status !== "working" &&
          task.status !== "archived"
        ? "waiting"
        : task.status;
  return (
    <ThreadStatusIcon
      thread={{
        archived: status === "archived",
        status: status as ChipThread["status"],
      }}
      className={className}
    />
  );
}

const iconSet = "complete";
const spriteId = "capy-file-icon-sprite";
const resolver = createFileTreeIconResolver(iconSet);

const ensureSprite = () => {
  const existing = document.getElementById(spriteId);
  if (existing?.dataset.iconSet === iconSet) return;
  const host = existing ?? document.createElement("div");
  host.id = spriteId;
  host.dataset.iconSet = iconSet;
  host.style.display = "none";
  host.innerHTML = getBuiltInSpriteSheet(iconSet);
  if (existing === null) document.body.append(host);
};

/**
 * Capy's file-type icon from @pierre/trees' complete set, sharing the sprite
 * host id with the composer's FileIcon. Folders (trailing slash) get the
 * folder glyph. Capy tints each type; that palette isn't tokenised yet, so
 * every type uses text-icon-muted.
 */
export function ChipFileIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  useEffect(ensureSprite, []);
  if (name.endsWith("/"))
    return (
      <Icon
        name="folder-1"
        className={cx("size-4 shrink-0 text-icon-muted", className)}
      />
    );
  const icon = resolver.resolveIcon("file-tree-icon-file", name);
  return (
    <svg
      aria-hidden
      viewBox={icon.viewBox ?? "0 0 16 16"}
      className={cx("size-4 shrink-0 text-icon-muted", className)}
    >
      <use href={`#${icon.name}`} />
    </svg>
  );
}
