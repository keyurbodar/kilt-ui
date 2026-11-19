// Vendored from Kiki (components/markdown-chips/markdown-chips.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComponentProps, ReactNode } from "react";
import {
  DriveChip,
  FileChip,
  IssueChip,
  PathChip,
  PullChip,
  ReferenceLinkChip,
  StructuredMentionChip,
  TaskChip,
} from "./chips";
import { chipTransform } from "./references";

export type MarkdownChipProps = ComponentProps<"span">;

/** A bare chip span, for surfaces that render chip markup without the markdown pipeline. */
export function MarkdownChip(props: MarkdownChipProps) {
  return <span {...props} />;
}

export type MarkdownChipRendererProps = {
  kind: string;
  value?: string;
  label?: string;
  href?: string;
  anchorProps?: ComponentProps<"a">;
  /** Markdown's interactive prop: false renders the chip as plain text. */
  interactive?: boolean;
  children?: ReactNode;
};

/**
 * Renders one chip the markdown pipeline found: span chips by data-chip kind,
 * anchors marked by the chip transform, and data-mention spans. Matches the
 * markdown package's MarkdownChipRenderProps.
 */
export function MarkdownChipRenderer({
  kind,
  value,
  label,
  href,
  anchorProps,
  interactive = true,
  children,
}: MarkdownChipRendererProps) {
  if (!interactive) return <>{children ?? label ?? value}</>;
  if (href !== undefined)
    return (
      <ReferenceLinkChip kind={kind} href={href} anchorProps={anchorProps}>
        {children}
      </ReferenceLinkChip>
    );
  if (value === undefined) return <>{children}</>;
  switch (kind) {
    case "file":
      return <FileChip value={value} label={label} />;
    case "path":
      return <PathChip value={value} />;
    case "drive":
      return <DriveChip value={value} />;
    case "pull":
      return <PullChip value={value} label={label} />;
    case "task":
      return <TaskChip value={value} />;
    case "thread":
      // A thread code may be an issue code: IssueChip resolves the issue and
      // falls back to ThreadChip, so this is the entry point for both.
      return <IssueChip value={value} />;
    case "issue":
      return <IssueChip value={value} />;
    case "mention":
      return (
        <StructuredMentionChip value={value}>{children}</StructuredMentionChip>
      );
    default:
      return <>{children ?? label ?? value}</>;
  }
}

/** The markdown renderer's chip plug-in points, ready to spread into MarkdownComponents. */
export const markdownChipComponents = {
  chip: MarkdownChipRenderer,
  transforms: [chipTransform],
} as const;
