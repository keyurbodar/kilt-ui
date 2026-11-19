// Vendored from Kiki (components/composer/command-menu.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComponentProps, Ref } from "react";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { menuRowVariants } from "@/registry/kilt/app/primitives/menu";
import { COMMAND_MENU_MAX_HEIGHT, MENU_WIDTH } from "./menu-position";
import {
  CheckTrailing,
  ChevronTrailing,
  MENU_GROUP_LABEL,
  MENU_LEADING,
  MENU_LIST,
  MENU_MESSAGE,
  MENU_SURFACE,
  MENU_TRAILING,
  MenuRowContent,
} from "./menu-surface";
import type { CommandRow } from "./types";

export const SKILLS_COMMAND = "skills";

const rowKey = (row: CommandRow) => {
  switch (row.type) {
    case "back":
      return "back";
    case "command":
      return `command:${row.command.name}`;
    case "item":
      return `item:${row.item.id}`;
    case "skills":
      return "skills";
    case "skill":
      return `skill:${row.item.id}`;
  }
};

function RowBody({ row }: { row: CommandRow }) {
  if (row.type === "back")
    return (
      <>
        <span className={MENU_LEADING}>
          <Icon name="arrow-left" />
        </span>
        <span className="min-w-0 truncate">Back to commands</span>
        <span className={MENU_TRAILING}>Backspace</span>
      </>
    );
  if (row.type === "skill")
    return (
      <MenuRowContent
        icon={row.item.leading ?? <row.source.icon />}
        label={row.item.label}
        description={row.item.subtitle}
        trailing={row.item.hint}
        density="rich"
      />
    );
  if (row.type === "skills")
    return (
      <>
        <span className={MENU_LEADING}>
          <row.source.icon />
        </span>
        <span className="min-w-0 truncate">{row.source.label}</span>
        <span className={`${MENU_TRAILING} flex items-center gap-2`}>
          <ChevronTrailing />
        </span>
      </>
    );
  return (
    <>
      <span className={MENU_LEADING}>
        {row.type === "command" ? row.command.icon : row.item.icon}
      </span>
      <span className="min-w-0 truncate">
        {row.type === "command" ? row.command.label : row.item.label}
      </span>
      <span className={`${MENU_TRAILING} flex items-center gap-2`}>
        {row.type === "command" ? (
          row.command.kind === "picker" ? (
            <ChevronTrailing />
          ) : (
            <>
              {`/${row.command.name}`}
              {row.command.kind === "action" && row.command.active === true ? (
                <CheckTrailing />
              ) : null}
            </>
          )
        ) : (
          <>
            {row.item.trailing}
            {row.item.selected ? <CheckTrailing /> : null}
          </>
        )}
      </span>
    </>
  );
}

export type CommandMenuSurfaceProps = {
  rows: CommandRow[];
  command: string | null;
  loading: boolean;
  empty: string | null;
  highlight: number;
  headers?: Map<number, string>;
  onSelect?: (row: CommandRow) => void;
  onHighlight?: (index: number) => void;
  highlightedRef?: Ref<HTMLDivElement>;
  maxHeight?: number;
};

export function CommandMenuSurface({
  rows,
  command,
  loading,
  empty,
  highlight,
  headers,
  onSelect,
  onHighlight,
  highlightedRef,
  maxHeight = COMMAND_MENU_MAX_HEIGHT,
}: CommandMenuSurfaceProps) {
  return (
    <div
      role="listbox"
      id="capy-command-menu"
      className={`${MENU_SURFACE} flex flex-col overflow-hidden`}
      style={{ width: MENU_WIDTH, maxHeight }}
    >
      <div role="presentation" className={MENU_LIST}>
        {command !== null && rows.length > 0 ? (
          <div className={MENU_GROUP_LABEL}>{`/${command}`}</div>
        ) : null}
        {rows.map((row, index) => {
          const active = index === highlight;
          const header = headers?.get(index);
          return (
            <div key={rowKey(row)}>
              {header === undefined ? null : (
                <div className={MENU_GROUP_LABEL}>{header}</div>
              )}
              <div
                ref={active ? highlightedRef : undefined}
                id={`capy-command-row-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={active}
                data-highlighted={active ? "" : undefined}
                className={menuRowVariants({
                  density: row.type === "skill" ? "rich" : "default",
                })}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect?.(row);
                }}
                onMouseEnter={() => onHighlight?.(index)}
              >
                <RowBody row={row} />
              </div>
            </div>
          );
        })}
        {loading && !rows.some((r) => r.type !== "back") ? (
          <div className={MENU_MESSAGE}>Loading…</div>
        ) : empty === null ? null : (
          <div className={MENU_MESSAGE}>{empty}</div>
        )}
      </div>
    </div>
  );
}

export type ComposerCommandMenuProps = ComponentProps<"div">;

export function ComposerCommandMenu(props: ComposerCommandMenuProps) {
  return <div data-slot="composer-command-menu" {...props} />;
}
