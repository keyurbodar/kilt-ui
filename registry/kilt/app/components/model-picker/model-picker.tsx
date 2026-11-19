// Vendored from Kiki (components/model-picker/model-picker.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  type ComponentProps,
  Fragment,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type UIEvent,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { sampleCatalog } from "./sample-catalog";
import { Badge } from "@/registry/kilt/app/primitives/badge";
import { Button } from "@/registry/kilt/app/primitives/button";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { MenuSearchRow } from "@/registry/kilt/app/primitives/menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/kilt/app/primitives/popover";
import { Switch } from "@/registry/kilt/app/primitives/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/kilt/app/primitives/tooltip";
import {
  defaultSelection,
  type Effort,
  effortLabel,
  type FavoriteSlot,
  featuredModels,
  findGroup,
  formatContext,
  formatPrice,
  groupModels,
  isFreeRoute,
  isKeyEntry,
  labName,
  labOf,
  type ModeKey,
  type ModelEntry,
  type ModelGroup,
  type ModelSelection,
  type Modes,
  maxFavorites,
  modeKeys,
  preferredRoute,
  priceLabel,
  type RouteOption,
  resolveModes,
  searchModels,
  selectEntry,
  selectionSummary,
  stepEffort,
  toggleMode,
} from "./catalog";
import { Dither, EffortSlider } from "./effort-slider";
import { Glyph } from "./glyph";
import { ProviderIcon } from "./provider-icon";
import { useStoredState } from "./use-stored-state";

const join = (...parts: ReadonlyArray<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const menuRowBase =
  "relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded px-2 text-left text-sm font-normal outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon-sm) h-(--h-menu-row) text-foreground";
const menuRow = join(
  menuRowBase,
  "data-[highlighted]:bg-[var(--menu-row-highlight,var(--popover-hover))] data-[popup-open]:bg-[var(--menu-row-highlight,var(--popover-hover))]",
);
const menuRowButton = join(
  menuRowBase,
  "hover:bg-[var(--menu-row-highlight,var(--popover-hover))] focus-visible:bg-[var(--menu-row-highlight,var(--popover-hover))] data-[selected]:bg-[var(--menu-row-highlight,var(--popover-hover))] disabled:pointer-events-none disabled:opacity-50",
);
const menuIconBox =
  "flex size-(--icon-sm) shrink-0 items-center justify-center in-data-[intent=danger]:text-destructive";
const menuIcon = join(menuIconBox, "text-icon-muted");
const menuText = "mask-fade-r min-w-0 flex-1 overflow-hidden whitespace-nowrap";
const menuTrailing =
  "ml-auto flex shrink-0 items-center gap-1.5 text-sm font-normal text-muted-foreground-1";
const menuCheck = "size-(--icon-sm) shrink-0 text-foreground";
const menuChevron = "size-(--icon-sm) shrink-0 text-muted-foreground-3";
const menuSeparator =
  "-mx-1 my-1 h-px bg-border-1 [[data-menu-list]>&:first-child]:hidden [[data-menu-list]>&:last-child]:hidden [[data-slot=menu-separator]+&]:hidden shrink-0";
const menuLabelBase =
  "mt-1 flex min-h-5.5 items-center text-xs font-medium text-muted-foreground-2 first:mt-0";
const menuLabel = join(menuLabelBase, "px-2");
const menuInput =
  "h-(--h-menu-row) w-full min-w-0 bg-transparent px-2 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground-3";
const surface =
  "rounded-(--radius-overlay) border-hairline border-border-2 bg-popover p-1 text-foreground shadow-overlay";
const muted = "text-muted-foreground-2";
const digitClass =
  "w-2 text-center text-xs font-normal text-muted-foreground-2 tabular-nums pointer-coarse:hidden";
const segmented =
  "relative flex items-center gap-0.5 rounded-lg border-hairline border-border-2 bg-secondary p-0.5 [&>[data-selected]]:bg-card [&>[data-selected]]:shadow-card [&>button]:relative";

const keepFocus = (event: { preventDefault: () => void }) =>
  event.preventDefault();

const storageKey = (name: string) => `capy-web:model-picker-lab:${name}`;

const isGroupingValue = (value: unknown): value is "provider" | "route" =>
  value === "provider" || value === "route";

const isSlots = (value: unknown): value is ReadonlyArray<FavoriteSlot> =>
  Array.isArray(value) &&
  value.every(
    (slot) =>
      typeof slot === "object" &&
      slot !== null &&
      typeof (slot as FavoriteSlot).modelId === "string",
  );

const isRoutes = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => typeof item === "string");

function Separator() {
  return <div data-slot="menu-separator" className={menuSeparator} />;
}

function Digit({ index }: { index: number }) {
  if (index > 9) return null;
  const digit = String((index + 1) % 10);
  return (
    <span data-menu-digit={digit} className={digitClass}>
      {digit}
    </span>
  );
}

function Tip({
  side = "top",
  label,
  children,
}: {
  side?: "top" | "left";
  label: ReactNode;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

function FreeBadge({ ads }: { ads?: boolean }) {
  return (
    <Badge size="xs" color="success" className="shrink-0">
      <Glyph name="gift-1" />
      {ads === true ? "Free with ads" : "Free"}
    </Badge>
  );
}

export type RouteIconProps = {
  entry: ModelEntry;
  className?: string;
  iconClassName?: string;
  accent?: boolean;
};

export function RouteIcon({
  entry,
  className,
  iconClassName,
  accent = false,
}: RouteIconProps) {
  const seat =
    entry.route?.kind === "member_seat" ? entry.route.service : undefined;
  if (seat !== undefined)
    return (
      <span
        className={join(
          "flex shrink-0",
          className,
          accent && entry.route?.kind !== "capy" && "text-primary-ink",
        )}
      >
        <ProviderIcon provider={seat} className={iconClassName} />
      </span>
    );
  if (isKeyEntry(entry))
    return (
      <span className={join("relative flex shrink-0", className)}>
        <span className="flex [mask-composite:exclude] [mask-repeat:no-repeat]">
          <ProviderIcon
            provider={labOf(entry)}
            className={join(iconClassName, "mx-0!")}
          />
        </span>
        <Icon
          name="key-2"
          className="absolute -right-0.625 -bottom-0.625 mx-0! size-2.25 text-primary-ink"
        />
      </span>
    );
  return (
    <span className={join("relative flex shrink-0", className)}>
      <ProviderIcon provider={labOf(entry)} className={iconClassName} />
    </span>
  );
}

const rowIcon = join(menuIconBox, "text-foreground opacity-100!");

export type ModelPickerInherit = {
  label: string;
  value?: string;
  active: boolean;
  onSelect: () => void;
};

export type ModelPickerAlso = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export type ModelPickerProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  value?: ModelSelection;
  defaultValue?: ModelSelection;
  onChange?: (value: ModelSelection) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  entries?: ReadonlyArray<ModelEntry>;
  orgId?: string;
  compact?: boolean;
  loading?: boolean;
  daybreak?: boolean;
  inherit?: ModelPickerInherit;
  trigger?: ReactElement;
  align?: "start" | "center" | "end";
  also?: ModelPickerAlso;
  composer?: boolean;
};

type Cell = { slot: FavoriteSlot; group: ModelGroup; route: RouteOption };

type Focus = {
  group: ModelGroup;
  route: RouteOption;
  effort: Effort | undefined;
  modes: Modes;
  slot?: number;
  current: boolean;
  fixed?: boolean;
};

function useEntries(
  entries: ReadonlyArray<ModelEntry> | undefined,
  orgId: string,
) {
  void orgId;
  return { entries: entries ?? sampleCatalog, loading: false };
}

export function ModelPicker({
  value: valueProp,
  defaultValue = defaultSelection,
  onChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  entries: entriesProp,
  orgId = "",
  compact = false,
  loading: loadingProp = false,
  daybreak: daybreakAllowed = true,
  inherit,
  trigger,
  align = "start",
  also,
  composer = false,
  children,
  className,
  ...props
}: ModelPickerProps) {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const value = valueProp ?? ownValue;
  const emit = (next: ModelSelection) => {
    const clean = daybreakAllowed ? next : { ...next, daybreak: false };
    if (valueProp === undefined) setOwnValue(clean);
    onChange?.(clean);
  };
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const open = openProp ?? ownOpen;
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [olderOpen, setOlderOpen] = useState(false);
  const [efforts, setEfforts] = useState<Record<string, Effort>>({});
  const [modesDraft, setModesDraft] = useState<Record<string, Modes>>({});
  const [routesDraft, setRoutesDraft] = useState<Record<string, string>>({});
  const [rowTop, setRowTop] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [grouping, setGrouping] = useStoredState(
    storageKey("grouping"),
    "provider",
    isGroupingValue,
  );
  const [storedSlots, setSlots] = useStoredState<ReadonlyArray<FavoriteSlot>>(
    storageKey("slots"),
    [],
    isSlots,
  );
  const [routePrefs, setRoutePrefs] = useStoredState<Record<string, string>>(
    storageKey("routes"),
    {},
    isRoutes,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const jumping = useRef(false);
  const hoverTimer = useRef<number | undefined>(undefined);

  const { entries, loading: entriesLoading } = useEntries(entriesProp, orgId);
  const loading = loadingProp || entriesLoading;
  const groups = groupModels(entries);
  const routeOf = (group: ModelGroup, id?: string) =>
    preferredRoute(group, routePrefs, id);
  const model = findGroup(groups, value.modelId);
  const route = model === undefined ? undefined : routeOf(model, value.modelId);
  const effort = value.pro
    ? undefined
    : (value.effort ?? route?.entry.defaultEffort);
  const cells: ReadonlyArray<Cell> = storedSlots
    .flatMap((slot) => {
      const group = findGroup(groups, slot.modelId);
      return group === undefined
        ? []
        : [{ slot, group, route: routeOf(group, slot.modelId) }];
    })
    .filter(
      (cell, index, all) =>
        all.findIndex((other) => other.group.key === cell.group.key) === index,
    )
    .slice(0, maxFavorites);
  const featured = featuredModels(groups);
  const free = cells.length < maxFavorites;
  const slotOf = (group: ModelGroup) =>
    cells.findIndex((cell) => cell.group.key === group.key);
  const inheritActive = inherit?.active === true;
  const term = query.trim().toLowerCase();
  const browsing = term.length === 0;

  const writeSlot = (index: number, slot: FavoriteSlot | null) => {
    const current = cells.map((cell) => cell.slot);
    setSlots(
      index >= current.length
        ? slot === null
          ? current
          : [...current, slot]
        : current.flatMap((item, at) =>
            at === index ? (slot === null ? [] : [slot]) : [item],
          ),
    );
  };

  const setOpen = (next: boolean) => {
    setOwnOpen(next);
    onOpenChange?.(next);
    if (next) return;
    window.clearTimeout(hoverTimer.current);
    setQuery("");
    setHighlighted(null);
    setOlderOpen(false);
    setEfforts({});
    setModesDraft({});
    setRoutesDraft({});
    setScrolled(false);
    setAnchor(null);
    setReplacing(null);
  };

  const close = () => setOpen(false);

  const fromSlot = (cell: Cell): ModelSelection => ({
    ...selectEntry(value, cell.route.entry),
    effort:
      cell.slot.effort !== undefined &&
      cell.route.entry.efforts.includes(cell.slot.effort)
        ? cell.slot.effort
        : undefined,
    ...resolveModes(cell.route.entry, cell.slot),
  });

  const equip = (index: number) => {
    const cell = cells[index];
    if (cell !== undefined) emit(fromSlot(cell));
  };

  const pick = (
    group: ModelGroup,
    nextEffort: Effort | undefined,
    modes: Modes | undefined,
    via?: RouteOption,
  ) => {
    if (via !== undefined)
      setRoutePrefs({ ...routePrefs, [group.key]: via.entry.id });
    const entry = (via ?? routeOf(group)).entry;
    const base = selectEntry(value, entry);
    emit({
      ...base,
      effort: nextEffort ?? base.effort,
      ...resolveModes(entry, modes ?? base),
    });
  };

  const tune = (change: {
    effort?: Effort;
    modes?: Modes;
    route?: RouteOption;
  }) => {
    if (model === undefined || route === undefined) return;
    if (change.route !== undefined)
      setRoutePrefs({ ...routePrefs, [model.key]: change.route.entry.id });
    const entry = (change.route ?? route).entry;
    const wanted = change.modes ?? {
      fast: value.fast,
      pro: value.pro === true,
      ultrafast: value.ultrafast === true,
      daybreak: value.daybreak === true,
    };
    emit({
      ...(change.route === undefined ? value : selectEntry(value, entry)),
      modelId: entry.id,
      effort:
        change.effort ??
        (change.route === undefined ? value.effort : undefined),
      ...resolveModes(entry, {
        ...wanted,
        pro: wanted.pro && change.effort === undefined,
      }),
    });
  };

  const holds = (index: number, focus: Focus) => {
    const cell = cells[index];
    if (cell === undefined) return false;
    const saved = resolveModes(cell.route.entry, cell.slot);
    return (
      cell.route.entry.id === focus.route.entry.id &&
      modeKeys.every((key) => saved[key] === focus.modes[key]) &&
      (saved.pro ||
        (cell.slot.effort ?? cell.route.entry.defaultEffort) === focus.effort)
    );
  };

  const saveSlot = (focus: Focus, index: number) =>
    writeSlot(index, {
      modelId: focus.route.entry.id,
      effort: focus.effort,
      ...focus.modes,
    });

  const focusOf = (nav: string | null): Focus | undefined => {
    const [kind, ...rest] = (nav ?? "").split(":");
    if (kind === "slot") {
      const cell = cells[Number(rest[0])];
      if (cell === undefined) return undefined;
      const key = `slot:${cell.group.key}`;
      const via =
        cell.group.routes.find(
          (option) => option.entry.id === routesDraft[key],
        ) ?? cell.route;
      return {
        group: cell.group,
        route: via,
        effort: efforts[key] ?? cell.slot.effort ?? via.entry.defaultEffort,
        modes: resolveModes(via.entry, modesDraft[key] ?? cell.slot),
        slot: Number(rest[0]),
        current: false,
      };
    }
    const group =
      kind === "m"
        ? groups.find((item) => item.key === rest.slice(1).join(":"))
        : undefined;
    if (group === undefined) return undefined;
    const via = rest[0]?.startsWith("via")
      ? group.routes[Number(rest[0].slice(3))]
      : undefined;
    const fixed = via !== undefined;
    if (
      !inheritActive &&
      group.key === model?.key &&
      route !== undefined &&
      (via === undefined || via.entry.id === route.entry.id)
    )
      return {
        group,
        route,
        effort: efforts[group.key] ?? value.effort ?? route.entry.defaultEffort,
        modes: resolveModes(route.entry, modesDraft[group.key] ?? value),
        current: true,
        fixed,
      };
    const option = via ?? routeOf(group);
    return {
      group,
      route: option,
      effort: efforts[group.key] ?? option.entry.defaultEffort,
      modes: resolveModes(option.entry, modesDraft[group.key] ?? value),
      current: false,
      fixed,
    };
  };

  const draftKey = (focus: Focus) =>
    focus.slot === undefined ? focus.group.key : `slot:${focus.group.key}`;

  const adjust = (
    focus: Focus,
    change: { effort?: Effort; modes?: Modes; route?: RouteOption },
    preview = false,
  ) => {
    const key = draftKey(focus);
    if (focus.current && !preview) {
      tune(change);
      const { [key]: _effort, ...restEfforts } = efforts;
      const { [key]: _modes, ...restModes } = modesDraft;
      setEfforts(restEfforts);
      setModesDraft(restModes);
      return;
    }
    if (change.effort !== undefined)
      setEfforts({ ...efforts, [key]: change.effort });
    if (
      change.modes !== undefined ||
      (change.effort !== undefined && focus.modes.pro)
    )
      setModesDraft({
        ...modesDraft,
        [key]: change.modes ?? { ...focus.modes, pro: false },
      });
    if (change.route !== undefined && focus.slot !== undefined)
      setRoutesDraft({ ...routesDraft, [key]: change.route.entry.id });
    else if (change.route !== undefined)
      setRoutePrefs({
        ...routePrefs,
        [focus.group.key]: change.route.entry.id,
      });
  };

  const edited = (key: string) =>
    efforts[key] !== undefined ||
    modesDraft[key] !== undefined ||
    routesDraft[key] !== undefined;

  const step = (nav: string, direction: number) => {
    const focus = focusOf(nav);
    if (focus === undefined) return;
    const next = stepEffort(focus.route.entry, focus.effort, direction);
    if (next !== undefined && next !== focus.effort)
      adjust(focus, { effort: next });
  };

  const navItems = () => [
    ...(panelRef.current?.querySelectorAll<HTMLElement>("[data-nav]") ?? []),
  ];

  const measure = (element: HTMLElement) => {
    const box = panelRef.current?.getBoundingClientRect();
    if (box !== undefined)
      setRowTop(element.getBoundingClientRect().top - box.top);
  };

  const highlight = (element: HTMLElement | undefined) => {
    if (element === undefined) return;
    setHighlighted(element.dataset.nav ?? null);
    element.scrollIntoView?.({ block: "nearest" });
    measure(element);
  };

  const move = (direction: number) => {
    const items = navItems();
    const at = items.findIndex((item) => item.dataset.nav === highlighted);
    highlight(
      items[
        at === -1
          ? direction > 0
            ? 0
            : items.length - 1
          : (at + direction + items.length) % items.length
      ],
    );
  };

  const cardControls = () => [
    ...(cardRef.current?.querySelectorAll<HTMLElement>(
      'button, [role="slider"], [role="menuitemcheckbox"]',
    ) ?? []),
  ];

  const handleListKey = (event: KeyboardEvent | ReactKeyboardEvent) => {
    if (event.key === "Tab" && !event.shiftKey) {
      const first = cardControls()[0];
      first?.focus();
      return first !== undefined;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      move(event.key === "ArrowDown" ? 1 : -1);
      return true;
    }
    if (event.key === "Enter") {
      const items = navItems();
      const target =
        items.find((item) => item.dataset.nav === highlighted) ??
        (term.length > 0 ? items[0] : undefined);
      target?.click();
      return target !== undefined;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      if (query !== "" || highlighted === null) return false;
      step(highlighted, event.key === "ArrowRight" ? 1 : -1);
      return true;
    }
    if (/^[1-9]$/.test(event.key) && query === "") {
      const index = Number(event.key) - 1;
      const focus = focusOf(highlighted);
      if (cells[index] !== undefined) {
        equip(index);
        close();
      } else if (
        focus !== undefined &&
        focus.slot === undefined &&
        free &&
        slotOf(focus.group) < 0
      )
        saveSlot(focus, cells.length);
      return true;
    }
    if (event.key.length === 1 || event.key === "Backspace")
      searchRef.current?.focus();
    return false;
  };

  const onDocumentKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.isComposing) return;
    const composerRoot = rootRef.current?.closest('[data-slot="composer"]');
    const active = document.activeElement;
    if (
      open &&
      active instanceof HTMLElement &&
      cardRef.current?.contains(active)
    ) {
      const role = active.getAttribute("role");
      const direction =
        event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)
          ? 1
          : event.key === "ArrowUp" || event.key === "Tab"
            ? -1
            : 0;
      const controls = cardControls();
      if (direction !== 0)
        (
          controls[controls.indexOf(active) + direction] ?? searchRef.current
        )?.focus();
      else if (event.key === "Escape") searchRef.current?.focus();
      else if (
        (event.key === "ArrowRight" || event.key === "ArrowLeft") &&
        role === "slider"
      ) {
        if (highlighted !== null)
          step(highlighted, event.key === "ArrowRight" ? 1 : -1);
      } else if (
        (event.key === "Enter" || event.key === " ") &&
        role === "menuitemcheckbox"
      )
        active.click();
      else return;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (
      composerRoot?.contains(active) !== true &&
      (!open ||
        (active !== document.body &&
          panelRef.current?.contains(active) !== true))
    )
      return;
    const digit = /^Digit([1-9])$/.exec(event.code)?.[1];
    if (!event.altKey) {
      if (!open || !handleListKey(event)) return;
    } else if (composerRoot == null || !composer || event.shiftKey) return;
    else if (digit !== undefined) equip(Number(digit) - 1);
    else if (event.code === "Slash") setOpen(!open);
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onDocumentKey(event);
    document.addEventListener("keydown", listener, true);
    return () => document.removeEventListener("keydown", listener, true);
  }, []);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const panel = panelRef.current;
    if (card == null || panel == null) return;
    const panelTop = panel.getBoundingClientRect().top;
    const height = card.offsetHeight;
    const lowest = panel.offsetHeight + 5 - height;
    const wanted =
      rowTop + 14 <= height - 5
        ? -5
        : rowTop + 14 >= lowest
          ? lowest
          : rowTop - 5;
    const top = Math.max(
      8 - panelTop,
      Math.min(wanted, window.innerHeight - 8 - panelTop - height),
    );
    card.style.top = `${top}px`;
    const box = panel.getBoundingClientRect();
    const gap = scrolled && browsing ? 59 : 11;
    const overflow =
      box.right + 11 + card.offsetWidth - (window.innerWidth - 8);
    const flip = overflow > 0 && box.left - gap - card.offsetWidth >= 8;
    card.style.left = flip ? "auto" : "";
    card.style.right = flip ? "100%" : "";
    card.style.marginRight = flip ? `${gap}px` : "";
    card.style.marginLeft = flip
      ? "0"
      : overflow > 0
        ? `${11 - overflow}px`
        : "";
  });

  const groupsShown =
    grouping === "route"
      ? [
          ...new Set(
            groups
              .filter((group) => !group.older)
              .flatMap((group) => group.routes.map((option) => option.label)),
          ),
        ].map((label) => ({
          id: label,
          name: label,
          rows: groups
            .filter((group) => !group.older)
            .flatMap((group) => {
              const via = group.routes.findIndex(
                (option) => option.label === label,
              );
              return via === -1 ? [] : [{ group, via }];
            }),
        }))
      : [
          ...new Set(
            groups.filter((group) => !group.older).map((group) => group.lab),
          ),
        ].map((lab) => ({
          id: lab,
          name: labName(lab),
          rows: groups
            .filter((group) => !group.older && group.lab === lab)
            .map((group) => ({ group, via: -1 })),
        }));

  type Section = (typeof groupsShown)[number];

  const sectionIcon = (section: Section, iconClass: string, header = false) => {
    const first = section.rows[0];
    const option =
      first === undefined ? undefined : first.group.routes[first.via];
    if (option === undefined)
      return <ProviderIcon provider={section.id} className={iconClass} />;
    if (option.kind === "credits")
      return <ProviderIcon provider="capy" className={iconClass} />;
    if (header && option.kind === "key")
      return <Icon name="key-2" className={iconClass} />;
    return (
      <RouteIcon
        entry={option.entry}
        className="opacity-100!"
        iconClassName={iconClass}
      />
    );
  };

  const anchors = (list: HTMLElement) => [
    ...list.querySelectorAll<HTMLElement>("[data-anchor]"),
  ];

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    const marks = anchors(list);
    const top = list.scrollTop;
    setScrolled(marks[0] !== undefined && top > marks[0].offsetTop - 32);
    if (!jumping.current)
      setAnchor(
        (top + list.clientHeight >= list.scrollHeight - 2
          ? marks.at(-1)
          : (marks.filter((mark) => mark.offsetTop <= top + 24).at(-1) ??
            marks[0])
        )?.dataset.anchor ?? null,
      );
    const row = navItems().find((item) => item.dataset.nav === highlighted);
    if (row === undefined) return;
    const rowBox = row.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    if (rowBox.bottom < listBox.top + 8 || rowBox.top > listBox.bottom - 8)
      setHighlighted(null);
    else measure(row);
  };

  const jump = (id: string) => {
    const list = listRef.current;
    const target =
      list === null
        ? undefined
        : anchors(list).find((mark) => mark.dataset.anchor === id);
    if (list === null || target === undefined) return;
    jumping.current = true;
    setAnchor(id);
    setHighlighted(null);
    list.scrollTo?.({ top: target.offsetTop });
  };

  const navProps = (nav: string) => ({
    role: "option",
    tabIndex: -1,
    "data-nav": nav,
    "data-highlighted": highlighted === nav ? "" : undefined,
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      window.clearTimeout(hoverTimer.current);
      if (
        highlighted === nav ||
        event.buttons !== 0 ||
        (event.movementX === 0 && event.movementY === 0)
      )
        return;
      const row = event.currentTarget;
      const apply = () => {
        setHighlighted(nav);
        measure(row);
      };
      if (
        highlighted !== null &&
        event.movementX > Math.abs(event.movementY) + 1
      )
        hoverTimer.current = window.setTimeout(apply, 150);
      else apply();
    },
    onPointerLeave: () => window.clearTimeout(hoverTimer.current),
    onMouseDown: keepFocus,
  });

  const header = (name: string, icon?: ReactNode, stuck = false) => (
    <div
      className={join(
        icon === undefined ? menuLabel : menuLabelBase,
        "gap-1.5",
        icon !== undefined &&
          "sticky top-0 z-(--z-table-lead) -mx-1 mb-(--h-menu-row) bg-popover px-3",
        stuck &&
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-3 after:bg-linear-to-b after:from-popover after:to-transparent",
      )}
    >
      {icon}
      {name}
    </div>
  );

  const checkmark = <Icon name="checkmark-1" className={menuCheck} />;

  const modelRow = (
    scope: string,
    group: ModelGroup,
    feature?: { note: string },
    via?: RouteOption,
  ) => {
    const nav = `m:${scope}:${group.key}`;
    const selected =
      !inheritActive &&
      group.key === model?.key &&
      (via === undefined || via.entry.id === route?.entry.id);
    const option =
      via ?? (selected && route !== undefined ? route : routeOf(group));
    const isFree =
      option.entry.pricing?.input === 0 && option.entry.pricing.output === 0;
    const price = priceLabel(option.entry);
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: Capy rows are divs driven by the picker's global keydown handler; role="option" comes from the navProps spread, which Biome cannot see
      <div
        key={nav}
        {...navProps(nav)}
        aria-selected={selected}
        className={menuRow}
        onClick={() => {
          if (!selected)
            pick(group, efforts[group.key], modesDraft[group.key], via);
          close();
        }}
      >
        <Tip label={`Runs on ${option.label}`}>
          <RouteIcon entry={option.entry} className={rowIcon} accent />
        </Tip>
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="min-w-0 truncate">{group.name}</span>
          {feature === undefined ? null : (
            <Tip label={feature.note}>
              <span className="flex shrink-0 self-center">
                <FreeBadge ads={option.entry.ads} />
              </span>
            </Tip>
          )}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          {feature !== undefined || price === "" ? null : (
            <Tip
              label={
                isFree
                  ? option.entry.ads === true
                    ? "Free, supported by ads"
                    : "Free on Capy"
                  : "Input and output per 1M tokens"
              }
            >
              {isFree ? (
                <span className="flex shrink-0">
                  <FreeBadge ads={option.entry.ads} />
                </span>
              ) : (
                <span className={join("text-xs tabular-nums", muted)}>
                  {price}
                </span>
              )}
            </Tip>
          )}
          {selected ? checkmark : null}
        </span>
      </div>
    );
  };

  const slotRow = (cell: Cell, index: number) => (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: Capy rows are divs driven by the picker's global keydown handler; role="option" comes from the navProps spread, which Biome cannot see
    <div
      key={cell.group.key}
      {...navProps(`slot:${index}`)}
      aria-selected={false}
      className={menuRow}
      onClick={() => {
        equip(index);
        close();
      }}
    >
      <RouteIcon entry={cell.route.entry} className={rowIcon} accent />
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="min-w-0 truncate">{cell.group.name}</span>
        <span className={join("shrink-0", muted)}>
          {selectionSummary(
            cell.route.entry,
            cell.slot.effort,
            resolveModes(cell.route.entry, cell.slot),
          )}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-2">
        <Tip label={`Press ${index + 1}`}>
          <span className="ml-auto flex shrink-0">
            <Digit index={index} />
          </span>
        </Tip>
      </span>
    </div>
  );

  const older = groups.filter((group) => group.older);

  const catalog = () => (
    <>
      {inherit === undefined ? null : (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: Capy rows are divs driven by the picker's global keydown handler; role="option" comes from the navProps spread, which Biome cannot see */}
          <div
            {...navProps("inherit")}
            aria-selected={inherit.active}
            className={menuRow}
            onClick={() => {
              inherit.onSelect();
              close();
            }}
          >
            <span className={menuIcon}>
              <Glyph name="bubble-wide" />
            </span>
            <span className={menuText}>{inherit.label}</span>
            {inherit.value === undefined ? null : (
              <span className={menuTrailing}>{inherit.value}</span>
            )}
            {inherit.active ? checkmark : null}
          </div>
          <Separator />
        </>
      )}
      {cells.length === 0 ? null : (
        <div data-loadout>
          {header("Favorites")}
          {cells.map(slotRow)}
        </div>
      )}
      {featured.length === 0 ? null : (
        <>
          {cells.length === 0 ? null : <Separator />}
          <div>
            {header("Featured")}
            {featured.map((item) =>
              modelRow(
                "featured",
                item.group,
                item,
                item.group.routes.find(isFreeRoute),
              ),
            )}
          </div>
        </>
      )}
      {groupsShown.map((section, index) => (
        <Fragment key={section.id}>
          {index === 0 && cells.length === 0 && featured.length === 0 ? null : (
            <Separator />
          )}
          <div data-anchor={section.id}>
            {header(
              section.name,
              sectionIcon(section, "size-(--icon-xs)", true),
              scrolled && anchor === section.id,
            )}
            <div className="-mt-(--h-menu-row)">
              {section.rows.map((row) =>
                modelRow(
                  row.via < 0 ? "lab" : `via${row.via}`,
                  row.group,
                  undefined,
                  row.group.routes[row.via],
                ),
              )}
            </div>
          </div>
        </Fragment>
      ))}
      {older.length === 0 ? null : (
        <>
          <Separator />
          {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: Capy rows are divs driven by the picker's global keydown handler; role="option" comes from the navProps spread, which Biome cannot see */}
          <div
            {...navProps("older")}
            aria-selected={false}
            className={menuRow}
            onClick={() => setOlderOpen(!olderOpen)}
          >
            <span className={menuIcon}>
              <Glyph name="clock" />
            </span>
            <span className={menuText}>Older models</span>
            <span className="flex shrink-0 items-center justify-center">
              <Glyph
                name="chevron-down-small"
                className={join(menuChevron, !olderOpen && "-rotate-90")}
              />
            </span>
          </div>
          {olderOpen ? older.map((group) => modelRow("older", group)) : null}
        </>
      )}
    </>
  );

  const results = () => {
    const found = searchModels(groups, query);
    return found.length === 0 ? (
      <div className="px-2 py-4 text-center text-sm font-normal text-muted-foreground-2">
        No models found
      </div>
    ) : (
      found.map((group) => modelRow("search", group))
    );
  };

  const stat = (label: string, amount: string) => (
    <div
      key={label}
      className="flex items-baseline justify-between gap-2 px-2 text-xs"
    >
      <span className={muted}>{label}</span>
      <span className="font-medium tabular-nums">{amount}</span>
    </div>
  );

  const modeRow = (
    focus: Focus,
    key: ModeKey,
    label: string,
    icon: ReactNode,
  ) => (
    <div
      key={key}
      role="menuitemcheckbox"
      aria-checked={focus.modes[key]}
      tabIndex={0}
      className={menuRowButton}
      onMouseDown={keepFocus}
      onClick={() => adjust(focus, { modes: toggleMode(focus.modes, key) })}
      onKeyDown={() => {}}
    >
      <span className={menuIcon}>{icon}</span>
      <span className={menuText}>{label}</span>
      <Switch
        checked={focus.modes[key]}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none"
      />
    </div>
  );

  const card = (focus: Focus) => {
    const entry = focus.route.entry;
    const slot = focus.slot ?? slotOf(focus.group);
    const fastRoute = entry.fast
      ? undefined
      : focus.group.routes.find((option) => option.entry.fast);
    const showDaybreak = entry.daybreak !== undefined && daybreakAllowed;
    const hasControls =
      entry.efforts.length > 0 ||
      entry.fast ||
      fastRoute !== undefined ||
      entry.pro ||
      entry.ultrafast === true ||
      showDaybreak;
    return (
      <div className="flex flex-col text-sm font-normal">
        <div className="relative -mx-1 -mt-1 overflow-hidden rounded-t-(--radius-overlay) px-1 pt-1">
          <Dither
            from={0}
            to={0.55}
            start={0.5}
            slant={-0.45}
            className="inset-x-0 top-0 h-16 w-full [mask-image:linear-gradient(to_bottom,black,transparent)] text-primary opacity-40"
          />
          <div className="relative flex h-(--h-menu-row) items-center gap-2 px-2 font-medium">
            <RouteIcon entry={entry} className={rowIcon} accent />
            <span className="min-w-0 truncate">{focus.group.name}</span>
          </div>
          <div className="relative flex flex-col gap-1 pt-0.5 pb-1.5">
            {entry.limits === undefined
              ? null
              : stat("Context", formatContext(entry.limits.context))}
            {entry.pricing === undefined ? null : (
              <>
                {stat("Input per 1M", formatPrice(entry.pricing.input))}
                {stat("Output per 1M", formatPrice(entry.pricing.output))}
              </>
            )}
          </div>
        </div>
        {hasControls ? <Separator /> : null}
        {entry.efforts.length === 0 ? null : (
          <>
            <div className={join(menuLabel, "justify-between")}>
              Reasoning
              <span className="flex items-baseline gap-2 text-sm font-normal">
                {focus.modes.pro ? (
                  <span className="text-xs">Off with Pro</span>
                ) : null}
                <span
                  className={focus.modes.pro ? undefined : "text-foreground"}
                >
                  {focus.effort === undefined ? "" : effortLabel(focus.effort)}
                </span>
              </span>
            </div>
            <div
              className={join(
                "px-2 pt-0.5 pb-1.5",
                focus.modes.pro && "opacity-50",
              )}
            >
              <EffortSlider
                efforts={entry.efforts}
                value={focus.effort}
                onChange={(next) => adjust(focus, { effort: next }, true)}
                onCommit={() => {
                  const next = efforts[draftKey(focus)];
                  if (focus.current && next !== undefined && next !== effort)
                    tune({ effort: next });
                }}
                off={focus.modes.pro}
              />
            </div>
          </>
        )}
        {entry.fast ? (
          modeRow(focus, "fast", "Fast mode", <Glyph name="speed-high" />)
        ) : fastRoute === undefined ? null : (
          <div className="flex h-(--h-menu-row) items-center gap-2 px-2 text-muted-foreground-2">
            <span className={menuIcon}>
              <Glyph name="speed-high" />
            </span>
            <span className={menuText}>Fast mode</span>
            <span className="shrink-0 text-xs">{fastRoute.label} only</span>
          </div>
        )}
        {entry.ultrafast === true
          ? modeRow(focus, "ultrafast", "Ultrafast", <Glyph name="rocket" />)
          : null}
        {entry.pro
          ? modeRow(focus, "pro", "Pro", <Glyph name="diamond" />)
          : null}
        {showDaybreak
          ? modeRow(
              focus,
              "daybreak",
              entry.daybreak === "red" ? "Daybreak Red" : "Daybreak Blue",
              <Glyph name="sunrise" />,
            )
          : null}
        {focus.group.routes.length < 2 || focus.fixed === true ? null : (
          <>
            <Separator />
            <div className={join(menuLabel, "justify-between")}>
              Runs on
              <span className="text-sm font-normal text-foreground">
                {focus.route.label}
              </span>
            </div>
            <div className="px-2 pt-0.5 pb-1.5">
              {/* biome-ignore lint/a11y/useSemanticElements: Capy's route picker is a div group of segmented buttons */}
              <div
                role="group"
                aria-label="Runs on"
                className={join(segmented, "w-full")}
              >
                {focus.group.routes.map((option) => (
                  <Tip key={option.entry.id} label={option.label}>
                    <Button
                      type="button"
                      variant="segmented"
                      size="sm"
                      aria-label={option.label}
                      aria-pressed={option.entry.id === entry.id}
                      data-selected={option.entry.id === entry.id || undefined}
                      className="min-w-0 flex-1"
                      onMouseDown={keepFocus}
                      onClick={() => adjust(focus, { route: option })}
                    >
                      {option.kind === "credits" ? (
                        <ProviderIcon
                          provider="capy"
                          className="size-(--icon-sm)"
                        />
                      ) : (
                        <RouteIcon
                          entry={option.entry}
                          className="opacity-100!"
                          accent
                        />
                      )}
                    </Button>
                  </Tip>
                ))}
              </div>
            </div>
          </>
        )}
        <Separator />
        {slot >= 0 &&
        (focus.current || edited(draftKey(focus))) &&
        !holds(slot, focus) ? (
          <Button
            variant="soft"
            size="sm"
            className="mb-1 w-full justify-center"
            onMouseDown={keepFocus}
            onClick={() => saveSlot(focus, slot)}
          >
            Update favorite
          </Button>
        ) : null}
        {slot >= 0 ? (
          <Button
            variant="soft"
            size="sm"
            aria-label="Remove from favorites"
            className="group/saved w-full justify-center"
            onMouseDown={keepFocus}
            onClick={() => writeSlot(slot, null)}
          >
            <span className="flex items-center gap-1.5 group-hover/saved:hidden">
              Favorite
              <Digit index={slot} />
            </span>
            <span className="hidden group-hover/saved:inline">
              Remove from favorites
            </span>
          </Button>
        ) : replacing === focus.group.key ? (
          <>
            <div className={menuLabel}>Replace which favorite</div>
            {cells.map((cell, index) => (
              <button
                key={cell.group.key}
                type="button"
                aria-label={`Replace favorite ${index + 1}`}
                className={menuRowButton}
                onMouseDown={keepFocus}
                onClick={() => {
                  saveSlot(focus, index);
                  setReplacing(null);
                }}
              >
                <RouteIcon
                  entry={cell.route.entry}
                  className={rowIcon}
                  accent
                />
                <span className={menuText}>{cell.group.name}</span>
                <Digit index={index} />
              </button>
            ))}
          </>
        ) : (
          <Button
            variant="soft"
            size="sm"
            aria-label="Add to favorites"
            className="w-full justify-center"
            onMouseDown={keepFocus}
            onClick={() =>
              free
                ? saveSlot(focus, cells.length)
                : setReplacing(focus.group.key)
            }
          >
            <Glyph name="plus-large" />
            Add to favorites
          </Button>
        )}
      </div>
    );
  };

  const focus = focusOf(highlighted);
  const summary =
    route === undefined
      ? ""
      : selectionSummary(route.entry, effort, resolveModes(route.entry, value));
  const customTrigger =
    trigger ?? (isValidElement(children) ? children : undefined);
  const triggerButton = customTrigger ?? (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Model"
      aria-keyshortcuts={composer ? "Alt+/" : undefined}
    >
      {inheritActive ? (
        <Glyph name="bubble-wide" />
      ) : loading || route === undefined ? null : (
        <RouteIcon
          entry={route.entry}
          className="-ml-0.5"
          iconClassName="mx-0! size-(--icon-sm)"
          accent
        />
      )}
      <span>
        {inheritActive
          ? inherit?.label
          : loading
            ? "Loading"
            : (model?.name ?? value.modelId.split("/")[1])}
      </span>
      {inheritActive || loading || compact || summary === "" ? null : (
        <span className={muted}>{summary}</span>
      )}
      <Glyph
        name="chevron-down-small"
        className="size-(--icon-sm) shrink-0 text-muted-foreground-3"
      />
    </Button>
  );
  const alt =
    typeof navigator !== "undefined" &&
    /Mac|iP(hone|ad)/.test(navigator.platform)
      ? "⌥"
      : "Alt+";
  const railShown = scrolled && browsing;
  const railSections = groupsShown.map((section) => ({
    id: section.id,
    name: section.name,
    icon: sectionIcon(section, "size-4"),
  }));

  return (
    <div
      ref={rootRef}
      data-slot="model-picker"
      className={join("contents", className)}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        {composer ? (
          <Tip label={`${alt}1 to ${alt}9 switch favorites`}>
            <PopoverTrigger render={triggerButton} />
          </Tip>
        ) : (
          <PopoverTrigger render={triggerButton} />
        )}
        <PopoverContent
          variant="unstyled"
          align={align}
          sideOffset={4}
          initialFocus={searchRef}
          className={join(surface, "w-80")}
        >
          <div ref={panelRef} className="relative flex min-h-0 flex-col">
            <MenuSearchRow className="flex shrink-0 items-center">
              <input
                ref={searchRef}
                className={menuInput}
                placeholder="Search models"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlighted(null);
                  setScrolled(false);
                }}
              />
              <Tip
                label={
                  grouping === "route" ? "Group by provider" : "Group by route"
                }
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Group by"
                  className="mr-1 flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 text-xs font-normal text-muted-foreground-2 hover:bg-popover-hover hover:text-foreground focus-visible:outline-ring-inset"
                  onMouseDown={keepFocus}
                  onClick={() => {
                    setGrouping(grouping === "route" ? "provider" : "route");
                    setHighlighted(null);
                    setAnchor(null);
                    listRef.current?.scrollTo?.({ top: 0 });
                  }}
                >
                  <Glyph name="layers-three" className="size-(--icon-xs)" />
                  {grouping === "route" ? "By route" : "By provider"}
                </button>
              </Tip>
            </MenuSearchRow>
            <Separator />
            <div className="relative -mx-1 -mb-1 flex">
              <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-b-(--radius-overlay)">
                <div
                  ref={listRef}
                  role="listbox"
                  aria-label="Models"
                  className={join(
                    "relative min-w-0 flex-1 max-h-80 scroll-pt-7 overflow-y-auto px-1 pb-1",
                    railShown ? "md:scroll-fade-b" : "md:scroll-fade-y",
                    !browsing && "pt-1",
                  )}
                  onScroll={onScroll}
                  onWheel={() => {
                    jumping.current = false;
                    setHighlighted(null);
                  }}
                >
                  {browsing ? catalog() : results()}
                </div>
              </div>
            </div>
            <PickerLabRail
              sections={railSections}
              anchor={anchor}
              onJump={jump}
              shown={railShown}
            />
            {focus === undefined ? null : (
              <PickerLabCard ref={cardRef}>{card(focus)}</PickerLabCard>
            )}
            {also === undefined ? null : (
              <>
                <Separator />
                {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: Capy rows are divs driven by the picker's global keydown handler; role="option" comes from the navProps spread, which Biome cannot see */}
                <div
                  {...navProps("also")}
                  aria-selected={also.checked}
                  className={menuRow}
                  onClick={() => also.onCheckedChange(!also.checked)}
                >
                  <span className={menuText}>{also.label}</span>
                  {also.checked ? checkmark : null}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type PickerLabSection = { id: string; name: string; icon: ReactNode };

export type PickerLabRailProps = ComponentProps<"div"> & {
  sections?: ReadonlyArray<PickerLabSection>;
  anchor?: string | null;
  onJump?: (id: string) => void;
  shown?: boolean;
};

export function PickerLabRail({
  sections,
  anchor = null,
  onJump,
  shown = true,
  className,
  ...props
}: PickerLabRailProps) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const mark = [...(list?.children ?? [])].find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.dataset.mark === anchor,
    );
    if (list == null || mark === undefined) return;
    const top = mark.offsetTop - 32;
    const bottom = mark.offsetTop + mark.offsetHeight + 32 - list.clientHeight;
    const target =
      list.scrollTop > top ? top : list.scrollTop < bottom ? bottom : undefined;
    if (target !== undefined) list.scrollTo?.({ top: target });
  }, [anchor]);
  if (sections === undefined)
    return <div data-slot="picker-lab-rail" className={className} {...props} />;
  const nearest = (event: PointerEvent<HTMLDivElement>, force: boolean) => {
    const index = [...event.currentTarget.querySelectorAll("button")].findIndex(
      (button) => event.clientY < button.getBoundingClientRect().bottom,
    );
    const id = sections[index === -1 ? sections.length - 1 : index]?.id;
    if (id !== undefined && (force || id !== anchor)) onJump?.(id);
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the rail is a pointer-jump surface, as in Capy
    <div
      data-slot="picker-lab-rail"
      aria-hidden={!shown}
      className={join(
        surface,
        "absolute -top-1.25 right-full -bottom-1.25 mr-2.75 flex w-9.25 cursor-pointer flex-col overflow-hidden p-0 transition-[opacity,translate] duration-base ease-out motion-reduce:transition-none",
        !shown && "pointer-events-none translate-x-2 opacity-0",
        className,
      )}
      onMouseDown={keepFocus}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        nearest(event, true);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) nearest(event, false);
      }}
      {...props}
    >
      <div
        ref={listRef}
        className="relative flex min-h-0 flex-1 scrollbar-hide flex-col gap-px overflow-y-auto scroll-fade-y p-1"
      >
        {sections.map((section) => (
          <Tip key={section.id} side="left" label={section.name}>
            <button
              type="button"
              tabIndex={-1}
              aria-label={section.name}
              aria-current={anchor === section.id}
              data-mark={section.id}
              className={join(
                "flex h-(--h-menu-row) w-full shrink-0 cursor-pointer items-center justify-center rounded hover:bg-popover-hover hover:text-foreground focus-visible:outline-ring-inset",
                anchor === section.id
                  ? "bg-popover-hover text-foreground"
                  : "text-muted-foreground-2",
              )}
            >
              {section.icon}
            </button>
          </Tip>
        ))}
      </div>
    </div>
  );
}

export type PickerLabCardProps = ComponentProps<"div">;

export function PickerLabCard({ className, ...props }: PickerLabCardProps) {
  return (
    <div
      data-slot="picker-lab-card"
      className={join(
        surface,
        "absolute left-full ml-2.75 flex w-72 animate-crossfade-in flex-col motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export type ModelPinProps = ComponentProps<"button">;

export function ModelPin(props: ModelPinProps) {
  return <button data-slot="model-pin" {...props} />;
}

export type ModelStageProps = ComponentProps<"div">;

export function ModelStage(props: ModelStageProps) {
  return <div data-slot="model-stage" {...props} />;
}
