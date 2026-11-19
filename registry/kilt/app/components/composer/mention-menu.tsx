// Vendored from Kiki (components/composer/mention-menu.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ComponentProps, Ref } from "react";
import { FileIcon } from "@/registry/kilt/app/components/directory-view/file-icon";
import { menuRowVariants } from "@/registry/kilt/app/primitives/menu";
import { MENTION_MENU_MAX_HEIGHT, MENU_WIDTH } from "./menu-position";
import {
  ChevronTrailing,
  HighlightedText,
  MENU_GROUP_LABEL,
  MENU_LIST,
  MENU_MESSAGE,
  MENU_SURFACE,
  MenuRowContent,
} from "./menu-surface";
import type { MentionMenuState, MentionRow } from "./types";

const rowKey = (row: MentionRow) =>
  row.type === "category"
    ? `category:${row.source.category}`
    : `item:${row.item.kind}:${row.item.id}`;

export type MentionMenuSurfaceProps = {
  state: MentionMenuState;
  highlight: number;
  onSelect?: (row: MentionRow) => void;
  onHighlight?: (index: number) => void;
  highlightedRef?: Ref<HTMLDivElement>;
  maxHeight?: number;
};

export function MentionMenuSurface({
  state,
  highlight,
  onSelect,
  onHighlight,
  highlightedRef,
  maxHeight = MENTION_MENU_MAX_HEIGHT,
}: MentionMenuSurfaceProps) {
  return (
    <div
      role="listbox"
      id="capy-mention-menu"
      className={`${MENU_SURFACE} flex flex-col overflow-hidden`}
      style={{ width: MENU_WIDTH, maxHeight }}
    >
      <div role="presentation" className={MENU_LIST}>
        {state.loading && state.rows.length === 0 ? (
          <div className={MENU_MESSAGE}>Loading…</div>
        ) : state.empty === null ? null : (
          <div className={MENU_MESSAGE}>{state.empty}</div>
        )}
        {state.rows.map((row, index) => {
          const header = state.headers.get(index);
          const active = index === highlight;
          return (
            <div key={rowKey(row)}>
              {header === undefined ? null : (
                <div className={MENU_GROUP_LABEL}>{header}</div>
              )}
              <div
                ref={active ? highlightedRef : undefined}
                id={`capy-mention-row-${index}`}
                role="option"
                tabIndex={-1}
                aria-selected={active}
                data-highlighted={active ? "" : undefined}
                className={menuRowVariants({ density: "rich" })}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect?.(row);
                }}
                onMouseEnter={() => onHighlight?.(index)}
              >
                {row.type === "category" ? (
                  <MenuRowContent
                    icon={<row.source.icon />}
                    label={row.source.label}
                    description={row.source.description}
                    density="rich"
                    trailing={<ChevronTrailing />}
                  />
                ) : (
                  <MenuRowContent
                    icon={
                      row.item.kind === "task"
                        ? row.item.leading
                        : (row.item.leading ??
                          (row.item.kind === "file" ? (
                            <FileIcon
                              name={row.item.label}
                              className="size-(--icon-sm)"
                            />
                          ) : (
                            <row.source.icon />
                          )))
                    }
                    label={
                      row.item.trailing === undefined ? (
                        row.item.labelRanges === undefined ? (
                          row.item.label
                        ) : (
                          <HighlightedText
                            text={row.item.label}
                            ranges={row.item.labelRanges}
                            hitClassName="font-medium"
                          />
                        )
                      ) : (
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="mask-fade-r min-w-0 overflow-hidden whitespace-nowrap">
                            {row.item.label}
                          </span>
                          {row.item.trailing}
                        </span>
                      )
                    }
                    description={
                      row.item.subtitle !== undefined &&
                      row.item.subtitleRanges !== undefined ? (
                        <HighlightedText
                          text={row.item.subtitle}
                          ranges={row.item.subtitleRanges}
                          hitClassName="font-medium text-muted-foreground-1"
                        />
                      ) : (
                        row.item.subtitle
                      )
                    }
                    trailing={row.item.hint}
                    density="rich"
                  />
                )}
              </div>
            </div>
          );
        })}
        {state.notice === null ? null : (
          <div className="px-2 py-1.5 text-center text-xs font-normal text-muted-foreground-3">
            {state.notice}
          </div>
        )}
      </div>
    </div>
  );
}

export type ComposerMentionMenuProps = ComponentProps<"div">;

export function ComposerMentionMenu(props: ComposerMentionMenuProps) {
  return <div data-slot="composer-mention-menu" {...props} />;
}
