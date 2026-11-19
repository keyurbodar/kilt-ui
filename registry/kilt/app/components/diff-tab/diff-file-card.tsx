// Vendored from Kiki (components/diff-tab/diff-file-card.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cx } from "class-variance-authority";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import {
  CommentMarkers,
  type MarkerComment,
} from "@/registry/kilt/app/components/comment-marker";
import { Button } from "@/registry/kilt/app/primitives/button";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import type { DiffFile } from "./model";
import { diffRows, rowKey, rowKeys, unchangedLabel } from "./rows";

export type DiffFileCardProps = {
  file: DiffFile;
  domId: string;
  collapsed: boolean;
  /** Required whenever the card can collapse; absent in a fixed single-file view. */
  onCollapsedChange?: (path: string, collapsed: boolean) => void;
  collapsible?: boolean;
  trailing?: ReactNode;
  lineComments?: ReadonlyMap<string, ReadonlyArray<MarkerComment>>;
  fileComments?: ReadonlyArray<MarkerComment>;
  activeId?: string | null;
  onToggleComment?: (id: string) => void;
  renderDiscussion?: (id: string) => ReactNode;
};

const kindLabel: Partial<Record<DiffFile["kind"], string>> = {
  added: "Added",
  deleted: "Deleted",
  renamed: "Renamed",
};

export function DiffFileCard({
  file,
  domId,
  collapsed,
  onCollapsedChange,
  collapsible = true,
  trailing,
  lineComments,
  fileComments = [],
  activeId = null,
  onToggleComment,
  renderDiscussion,
}: DiffFileCardProps) {
  const slash = file.path.lastIndexOf("/");
  const directory = slash === -1 ? "" : file.path.slice(0, slash + 1);
  const name = file.path.slice(slash + 1);
  const [expandedRuns, setExpandedRuns] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const pinnedLines = useMemo(
    () => new Set(lineComments?.keys() ?? []),
    [lineComments],
  );
  const rows =
    file.patch === null
      ? []
      : diffRows(file.patch, { expandedRuns, pinnedLines });
  const open = collapsible ? !collapsed : true;
  const shownKeys = new Set(
    rows.flatMap((entry) => (entry.type === "line" ? rowKeys(entry.row) : [])),
  );
  const blockComments = [
    ...fileComments,
    ...[...(lineComments ?? [])].flatMap(([key, comments]) =>
      shownKeys.has(key) ? [] : comments,
    ),
  ];
  const toggle = (id: string) => onToggleComment?.(id);
  const kind = kindLabel[file.kind];

  return (
    <section
      id={domId}
      data-diff-file={file.path}
      data-slot="diff-file-card"
      className="scroll-mt-3 overflow-clip rounded-(--radius-card) border-hairline border-border-1 bg-card shadow-plate"
    >
      <header
        className={cx(
          "@container/file-header flex min-h-9 items-center gap-1.5 py-1 pr-1.5 pl-1",
          open && "border-b-hairline border-border-1",
        )}
      >
        {collapsible && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={collapsed ? "Expand file" : "Collapse file"}
            aria-expanded={open}
            onClick={() => onCollapsedChange?.(file.path, !collapsed)}
          >
            <Icon
              name="chevron-right"
              size="sm"
              className={cx(
                "text-icon-muted transition-transform duration-hover",
                open && "rotate-90",
              )}
            />
          </Button>
        )}
        <span className="min-w-0 flex-1 truncate text-sm" title={file.path}>
          <span className="text-muted-foreground-2">{directory}</span>
          <span className="font-medium text-foreground">{name}</span>
        </span>
        {kind !== undefined && (
          <span className="shrink-0 text-xs text-muted-foreground-2">
            {kind}
          </span>
        )}
        <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums">
          {file.additions !== null && file.additions > 0 && (
            <span className="text-diff-add">+{file.additions}</span>
          )}
          {file.deletions !== null && file.deletions > 0 && (
            <span className="text-diff-del">
              {"\u2212"}
              {file.deletions}
            </span>
          )}
        </span>
        {trailing}
      </header>
      {open && (
        <div data-slot="diff-file-body" className="flex flex-col">
          {blockComments.length > 0 && (
            <div className="flex flex-col gap-2 border-b-hairline border-border-1 p-2">
              <CommentMarkers
                comments={blockComments}
                activeId={activeId}
                onToggle={toggle}
                placement="block"
              />
              {blockComments.map(
                (comment) =>
                  comment.id === activeId && (
                    <Fragment key={comment.id}>
                      {renderDiscussion?.(comment.id)}
                    </Fragment>
                  ),
              )}
            </div>
          )}
          {file.binary ? (
            <p className="px-3 py-2 text-xs text-muted-foreground-2">
              Binary file not shown
            </p>
          ) : rows.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground-2">
              No changes to show
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 font-mono text-code-block leading-normal">
                <tbody>
                  {rows.map((entry, index) => {
                    if (entry.type === "hunk")
                      return (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: hunks are positional
                          key={`hunk-${index}`}
                          className="bg-secondary text-muted-foreground-2"
                        >
                          <td
                            colSpan={5}
                            className="px-3 py-0.5 whitespace-pre"
                          >
                            {entry.header}
                          </td>
                        </tr>
                      );
                    if (entry.type === "run")
                      return (
                        <tr key={`run-${entry.key}`}>
                          <td colSpan={5} className="p-0">
                            <button
                              type="button"
                              data-slot="diff-unchanged-run"
                              aria-expanded={false}
                              onClick={() =>
                                setExpandedRuns((current) =>
                                  new Set(current).add(entry.key),
                                )
                              }
                              className="w-full cursor-pointer bg-secondary px-3 py-0.5 text-left text-muted-foreground-2 transition-colors duration-hover hover:text-foreground"
                            >
                              {unchangedLabel(entry.rows.length)}
                            </button>
                          </td>
                        </tr>
                      );
                    const { row } = entry;
                    const key = rowKey(row);
                    const comments = rowKeys(row).flatMap(
                      (candidate) => lineComments?.get(candidate) ?? [],
                    );
                    const active = comments.find(
                      (comment) => comment.id === activeId,
                    );
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
                      <Fragment key={`${key}-${index}`}>
                        <tr
                          className={cx(
                            row.marker === "+" && "bg-(--diff-add-wash)",
                            row.marker === "-" && "bg-(--diff-del-wash)",
                          )}
                        >
                          <td className="w-10 px-2 text-right align-top whitespace-nowrap text-muted-foreground-3 tabular-nums select-none">
                            {row.marker === "+" ? "" : row.oldNo}
                          </td>
                          <td className="w-10 px-2 text-right align-top whitespace-nowrap text-muted-foreground-3 tabular-nums select-none">
                            {row.marker === "-" ? "" : row.newNo}
                          </td>
                          <td
                            className={cx(
                              "w-5 text-center align-top select-none",
                              row.marker === "+" && "text-diff-add",
                              row.marker === "-" && "text-diff-del",
                            )}
                          >
                            {row.marker === " "
                              ? ""
                              : row.marker === "-"
                                ? "\u2212"
                                : "+"}
                          </td>
                          <td className="w-full pr-2 whitespace-pre text-foreground">
                            {row.text}
                          </td>
                          <td className="w-0 pr-2 align-top">
                            {comments.length > 0 && (
                              <CommentMarkers
                                comments={comments}
                                activeId={activeId}
                                onToggle={toggle}
                                placement="block"
                              />
                            )}
                          </td>
                        </tr>
                        {active !== undefined && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div
                                id={`pull-discussion-${active.id}`}
                                className="diff-comment-discussion w-full min-w-0 p-2 font-sans"
                              >
                                {renderDiscussion?.(active.id)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
