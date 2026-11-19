// Vendored from Kiki (components/composer/menu-surface.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { ReactNode } from "react";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import type { TextRange } from "./types";

export const MENU_SURFACE =
  "rounded-(--radius-overlay) border-(length:--border-width-hairline) border-border-2 bg-popover p-1 text-foreground shadow-overlay";
export const MENU_LIST =
  "-m-1 min-h-0 overflow-x-hidden overflow-y-auto p-1 md:scroll-fade-y";
export const MENU_GROUP_LABEL =
  "mt-1 flex min-h-(--h-menu-group-label) items-center px-2 text-xs font-medium text-muted-foreground-2 first:mt-0";
export const MENU_LEADING =
  "flex size-(--icon-sm) shrink-0 items-center justify-center text-icon-muted in-data-[intent=danger]:text-destructive";
export const MENU_TRAILING =
  "ml-auto flex shrink-0 items-center gap-1.5 text-sm font-normal text-muted-foreground-1";
export const MENU_CHEVRON = "size-(--icon-sm) shrink-0 text-muted-foreground-3";
export const MENU_CHECK = "size-(--icon-sm) shrink-0 text-foreground";
export const MENU_LABEL =
  "mask-fade-r min-w-0 flex-1 overflow-hidden whitespace-nowrap";
export const MENU_MESSAGE =
  "px-2 py-4 text-center text-sm font-normal text-muted-foreground-2";

export const ChevronTrailing = () => (
  <Icon name="chevron-right-small" className={MENU_CHEVRON} />
);

export const CheckTrailing = () => (
  <Icon name="checkmark-1" className={MENU_CHECK} />
);

export function MenuRowContent({
  icon,
  label,
  description,
  trailing,
  density,
}: {
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  density?: "default" | "rich";
}) {
  const stacked = density === "rich" && description != null;
  return (
    <span
      data-slot="menu-row"
      className="flex min-w-0 flex-1 items-center gap-2 text-left"
    >
      {icon ? (
        <span
          className={stacked ? `${MENU_LEADING} h-5 self-start` : MENU_LEADING}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="line-clamp-1 min-w-0 text-sm font-normal text-foreground in-data-[intent=danger]:text-destructive">
          {label}
        </span>
        {description ? (
          <span className="line-clamp-1 min-w-0 text-xs font-normal text-muted-foreground-2">
            {description}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span
          className={
            stacked ? `${MENU_TRAILING} h-5 self-start` : MENU_TRAILING
          }
        >
          {trailing}
        </span>
      ) : null}
    </span>
  );
}

export function HighlightedText({
  text,
  ranges,
  hitClassName,
}: {
  text: string;
  ranges: TextRange[];
  hitClassName: string;
}) {
  const parts: { text: string; hit: boolean; at: number }[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor)
      parts.push({
        text: text.slice(cursor, range.start),
        hit: false,
        at: cursor,
      });
    parts.push({
      text: text.slice(range.start, range.end),
      hit: true,
      at: range.start,
    });
    cursor = range.end;
  }
  if (cursor < text.length)
    parts.push({ text: text.slice(cursor), hit: false, at: cursor });
  return (
    <>
      {parts.map((part) =>
        part.hit ? (
          <span key={part.at} className={hitClassName}>
            {part.text}
          </span>
        ) : (
          <span key={part.at}>{part.text}</span>
        ),
      )}
    </>
  );
}
