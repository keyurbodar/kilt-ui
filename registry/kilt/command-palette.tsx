"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { type KeyboardEvent, type ReactNode, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { CommandPaletteMkIcon } from "./icons";
import { Kbd } from "./kbd";
import { MenuRowContent, type MenuRowIntent, menuRowAttrs } from "./menu-row";
import "./tokens.css";
import "./styles/command-palette.css";
import "./styles/menu-row.css";
import "./styles/live.css";

export interface CommandItem {
  id: string;
  label: string;
  /** Filter tab the item belongs to; "All" always shows it. */
  category?: string;
  icon?: ReactNode;
  meta?: ReactNode;
  keys?: string[];
  intent?: MenuRowIntent;
  onSelect?: () => void;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  groups: CommandGroup[];
  /** Filter tabs; the first is "show everything". */
  filters?: string[];
  placeholder?: string;
  /** Trailing action in the input row, opened with Tab. */
  action?: ReactNode;
  className?: string;
}

const DEFAULT_FILTERS = ["All", "Captains", "Threads", "Pull requests", "Automations", "Actions", "Settings"];

export function CommandPalette({
  open,
  defaultOpen,
  onOpenChange,
  groups,
  filters = DEFAULT_FILTERS,
  placeholder = "Search threads, actions, settings…",
  action,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(0);
  const [active, setActive] = useState(0);
  const listId = useId();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = filter === 0 ? null : filters[filter];
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => (!cat || i.category === cat) && (!q || i.label.toLowerCase().includes(q))),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, filters, filter, query]);
  const flat = visible.flatMap((g) => g.items);
  const current = flat[Math.min(active, flat.length - 1)];

  const choose = (item: CommandItem | undefined) => {
    if (!item) return;
    item.onSelect?.();
    onOpenChange?.(false);
  };
  const moveFilter = (d: number) => {
    setFilter((f) => (f + d + filters.length) % filters.length);
    setActive(0);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(a + 1, flat.length - 1)),
      ArrowUp: () => setActive((a) => Math.max(a - 1, 0)),
      Enter: () => choose(current),
      ArrowLeft: () => query === "" && moveFilter(-1),
      ArrowRight: () => query === "" && moveFilter(1),
    };
    const run = keys[e.key];
    if (!run) return;
    e.preventDefault();
    run();
  };

  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(o) => onOpenChange?.(o)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="kilt-backdrop" />
        <div className="kilt-modal">
          <BaseDialog.Popup data-slot="command-palette" className={cn("kilt-command-palette", className)} aria-label="Command palette">
            <div className="kilt-command-palette__ir">
              <div className="kilt-command-palette__in">
                <input
                  className="kilt-field-reset"
                  role="combobox"
                  aria-expanded
                  aria-controls={listId}
                  aria-activedescendant={current ? `${listId}-${current.id}` : undefined}
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div className="kilt-command-palette__nt">
                {action ?? <Button variant="ghost">New thread</Button>}
                <span className="kilt-command-palette__tab">
                  <Kbd>⇥</Kbd>
                </span>
              </div>
            </div>
            <div className="kilt-command-palette__sep" />
            <div className="kilt-command-palette__fl" role="tablist">
              {filters.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={i === filter}
                  className={cn("kilt-button-reset kilt-command-palette__f", i === filter && "kilt-command-palette__on")}
                  onClick={() => {
                    setFilter(i);
                    setActive(0);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="kilt-command-palette__ls" id={listId} role="listbox">
              {visible.map((g) => (
                <div key={g.label} className="kilt-command-palette__gr" role="group" aria-label={g.label}>
                  <div className="kilt-command-palette__gl">{g.label}</div>
                  {g.items.map((item) => (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={item === current}
                      {...menuRowAttrs({ density: "palette", intent: item.intent })}
                      data-highlighted={item === current || undefined}
                      className="kilt-menu-row"
                      onMouseMove={() => setActive(flat.indexOf(item))}
                      onClick={() => choose(item)}
                    >
                      <MenuRowContent icon={item.icon} meta={item.meta} keys={item.keys}>
                        {item.label}
                      </MenuRowContent>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="kilt-command-palette__ft">
              <span className="kilt-command-palette__fm">
                <CommandPaletteMkIcon className="kilt-command-palette__mk" />
              </span>
              <span className="kilt-command-palette__hints">
                <Hint keys={["↵"]}>Open</Hint>
                <Hint keys={["⌘↵"]}>Open in new tab</Hint>
                <Hint keys={["←", "→"]}>Category</Hint>
              </span>
            </div>
          </BaseDialog.Popup>
        </div>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function Hint({ keys, children }: { keys: string[]; children: ReactNode }) {
  return (
    <span className="kilt-command-palette__h">
      <span className="kilt-command-palette__kg">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
      {children}
    </span>
  );
}
