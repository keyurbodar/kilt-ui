// Vendored from Kiki (primitives/menu/menu.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";

const cx = (...parts: ReadonlyArray<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Geometry lives in the menu row recipes, so a density picks a class rather
 * than a cluster of height, inset and glyph utilities. Radius and state stay
 * here: the recipe layer owns boxes, not paint or corners.
 */
export const menuRowVariants = cva(
  [
    "relative cursor-pointer text-left text-sm font-normal outline-none select-none",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      density: {
        default: "kiki-menu-row rounded",
        rich: "kiki-menu-row-rich rounded",
        palette: "kiki-palette-row rounded-(--radius-overlay)",
      },
      interaction: {
        highlight:
          "data-[highlighted]:bg-[var(--menu-row-highlight,var(--popover-hover))] data-[popup-open]:bg-[var(--menu-row-highlight,var(--popover-hover))]",
        button:
          "hover:bg-[var(--menu-row-highlight,var(--popover-hover))] focus-visible:bg-[var(--menu-row-highlight,var(--popover-hover))] data-[selected]:bg-[var(--menu-row-highlight,var(--popover-hover))] disabled:pointer-events-none disabled:opacity-50",
      },
      intent: {
        neutral: "text-foreground",
        danger:
          "text-destructive [--menu-row-highlight:var(--destructive-soft)]",
      },
    },
    defaultVariants: {
      density: "default",
      interaction: "highlight",
      intent: "neutral",
    },
  },
);

export type MenuRowVariants = VariantProps<typeof menuRowVariants>;

export const menuIconClassName =
  "flex size-(--icon-sm) shrink-0 items-center justify-center text-icon-muted in-data-[intent=danger]:text-destructive";
export const menuTrailingClassName =
  "ml-auto flex shrink-0 items-center gap-1.5 text-sm font-normal text-muted-foreground-1";
export const menuChevronClassName =
  "size-(--icon-sm) shrink-0 text-muted-foreground-3";
export const menuCheckClassName = "size-(--icon-sm) shrink-0 text-foreground";
export const menuSeparatorClassName = cx(
  "-mx-1 my-1 h-px bg-border-1",
  "[[data-menu-list]>&:first-child]:hidden [[data-menu-list]>&:last-child]:hidden [[data-slot=menu-separator]+&]:hidden",
);
export const menuLabelClassName =
  "mt-1 flex min-h-5.5 items-center px-2 text-xs font-medium text-muted-foreground-2 first:mt-0";
export const menuSearchInputClassName =
  "h-(--h-menu-row) w-full min-w-0 bg-transparent px-2 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground-3";
export const menuPositionerClassName = "z-(--z-overlay-content) outline-none";
export const menuListClassName =
  "-m-1 min-h-0 overflow-x-hidden overflow-y-auto p-1 md:scroll-fade-y";
export const menuContentHeights = {
  available: "max-h-[min(60dvh,var(--available-height))]",
  bounded: "max-h-[min(20rem,var(--available-height))]",
} as const;
export const menuPopupClassName = cx(
  "rounded-(--radius-overlay) border-hairline border-border-2 bg-popover p-1 text-foreground shadow-overlay",
  "flex min-w-32 flex-col overflow-hidden",
  "origin-(--transform-origin) outline-none transition-[opacity,scale] duration-fast ease-out-quint",
  "data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[ending-style]:duration-exit data-[instant]:transition-none",
);

const checkboxIndicatorClassName = cx(
  "relative flex size-4 shrink-0 items-center justify-center rounded-(--radius-sm) border-hairline border-border-3 bg-input text-primary-foreground transition-colors duration-100",
  "data-[checked]:border-transparent data-[checked]:bg-primary data-[checked]:[--focus-ring:var(--primary-text)]",
  "data-[indeterminate]:border-transparent data-[indeterminate]:bg-primary data-[indeterminate]:[--focus-ring:var(--primary-text)]",
  "[&>*]:hidden data-[checked]:[&>*]:block",
);

const enabledMenuItemSelector = [
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[data-slot='responsive-menu-item']",
  "[data-slot='responsive-menu-checkbox-item']",
]
  .map((s) => `${s}:not([data-disabled]):not(:disabled)`)
  .join(", ");

const menuContainerOf = (el: Element) =>
  el.closest(
    "[data-slot='responsive-menu-level'], [role='menu'], [role='listbox'], [role='dialog'], [data-slot='menu-content']",
  ) ?? el.parentElement;

const intentAttr = (intent: MenuRowVariants["intent"]) =>
  intent === "danger" ? "danger" : undefined;

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 12.75L10 19L19 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M10 16L12.9393 13.0607C13.5251 12.4749 13.5251 11.5251 12.9393 10.9393L10 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type MenuProps = ComponentProps<typeof BaseMenu.Root>;

export function Menu({ modal = false, ...props }: MenuProps) {
  return <BaseMenu.Root modal={modal} {...props} />;
}

export const MenuSub = BaseMenu.SubmenuRoot;

export type MenuSubProps = ComponentProps<typeof BaseMenu.SubmenuRoot>;

export type MenuTriggerProps = ComponentProps<typeof BaseMenu.Trigger> & {
  /**
   * The `data-slot` the trigger carries. Pass null where Capy's trigger carries
   * only its own state, as the issue list's status button does.
   */
  dataSlot?: string | null;
};

export function MenuTrigger({
  dataSlot = "menu-trigger",
  ...props
}: MenuTriggerProps) {
  return <BaseMenu.Trigger data-slot={dataSlot ?? undefined} {...props} />;
}

export type MenuContentProps = Omit<
  ComponentProps<typeof BaseMenu.Popup>,
  "className"
> &
  Pick<
    ComponentProps<typeof BaseMenu.Positioner>,
    | "side"
    | "align"
    | "sideOffset"
    | "alignOffset"
    | "collisionPadding"
    | "anchor"
  > & {
    className?: string;
    container?: ComponentProps<typeof BaseMenu.Portal>["container"] | null;
    height?: keyof typeof menuContentHeights;
  };

export function MenuContent({
  className,
  align = "start",
  side,
  sideOffset = 4,
  alignOffset,
  collisionPadding = 12,
  anchor,
  container,
  height = "available",
  children,
  ...props
}: MenuContentProps) {
  return (
    <BaseMenu.Portal container={container ?? undefined}>
      <BaseMenu.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className={menuPositionerClassName}
      >
        <BaseMenu.Popup
          data-slot="menu-content"
          className={cx(
            menuPopupClassName,
            menuContentHeights[height],
            className,
          )}
          {...props}
        >
          <div role="presentation" data-menu-list className={menuListClassName}>
            {children}
          </div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export type MenuSubContentProps = MenuContentProps;

export function MenuSubContent({
  sideOffset = 0,
  alignOffset = -4,
  ...props
}: MenuSubContentProps) {
  return (
    <MenuContent sideOffset={sideOffset} alignOffset={alignOffset} {...props} />
  );
}

export type MenuItemProps = Omit<
  ComponentProps<typeof BaseMenu.Item>,
  "className"
> &
  MenuRowVariants & {
    className?: string;
    /**
     * The shortcut this row answers while the menu is open (`menu.archive`),
     * for the row the same action carries on the list beside it.
     */
    command?: string;
  };

export function MenuItem({
  density,
  interaction,
  intent,
  className,
  command,
  ...props
}: MenuItemProps) {
  return (
    <BaseMenu.Item
      data-slot="menu-item"
      data-intent={intentAttr(intent)}
      data-menu-command={command}
      className={menuRowVariants({ density, interaction, intent, className })}
      {...props}
    />
  );
}

export type MenuActionItemProps = Omit<ComponentProps<"button">, "className"> &
  MenuRowVariants & {
    className?: string;
    selected?: boolean;
  };

export function MenuActionItem({
  density,
  interaction = "button",
  intent,
  selected,
  type = "button",
  className,
  ...props
}: MenuActionItemProps) {
  return (
    <button
      type={type}
      data-slot="menu-action-item"
      data-selected={selected ? "" : undefined}
      data-intent={intentAttr(intent)}
      className={menuRowVariants({ density, interaction, intent, className })}
      {...props}
    />
  );
}

export type MenuCheckboxItemProps = Omit<
  ComponentProps<typeof BaseMenu.CheckboxItem>,
  "className"
> &
  MenuRowVariants & { className?: string };

export function MenuCheckboxItem({
  density,
  interaction,
  intent,
  className,
  children,
  ...props
}: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="menu-checkbox-item"
      className={menuRowVariants({ density, interaction, intent, className })}
      {...props}
    >
      <span
        className={cx(
          menuIconClassName,
          density === "rich" && "h-5 self-start",
        )}
      >
        <BaseMenu.CheckboxItemIndicator
          keepMounted
          className={checkboxIndicatorClassName}
        >
          <CheckGlyph className="size-3" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  );
}

export type MenuSubTriggerProps = Omit<
  ComponentProps<typeof BaseMenu.SubmenuTrigger>,
  "className"
> &
  Pick<MenuRowVariants, "density"> & {
    className?: string;
    showChevron?: boolean;
  };

export function MenuSubTrigger({
  density,
  showChevron = true,
  className,
  children,
  ...props
}: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="menu-sub-trigger"
      className={menuRowVariants({ density, className })}
      {...props}
    >
      {children}
      {showChevron ? (
        <ChevronRightGlyph className={cx("ml-auto", menuChevronClassName)} />
      ) : null}
    </BaseMenu.SubmenuTrigger>
  );
}

export type MenuGroupProps = ComponentProps<typeof BaseMenu.Group>;

export function MenuGroup(props: MenuGroupProps) {
  return <BaseMenu.Group {...props} />;
}

export type MenuLabelProps = ComponentProps<"div">;

export function MenuLabel({ className, ...props }: MenuLabelProps) {
  return (
    <div
      data-slot="menu-label"
      className={cx(menuLabelClassName, className)}
      {...props}
    />
  );
}

export type MenuSeparatorProps = Omit<
  ComponentProps<typeof BaseMenu.Separator>,
  "className"
> & { className?: string };

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      data-slot="menu-separator"
      className={cx(menuSeparatorClassName, className)}
      {...props}
    />
  );
}

export type MenuRowProps = ComponentProps<"span"> &
  MenuRowVariants & {
    icon?: ReactNode;
    label?: ReactNode;
    description?: ReactNode;
    trailing?: ReactNode;
  };

export function MenuRow({
  icon,
  label,
  description,
  trailing,
  density,
  interaction: _interaction,
  intent,
  className,
  children,
  ...props
}: MenuRowProps) {
  const rich = density === "rich" && description != null;
  return (
    <span
      data-slot="menu-row"
      data-intent={intentAttr(intent)}
      className={cx(
        "flex min-w-0 flex-1 items-center gap-2 text-left",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className={cx(menuIconClassName, rich && "h-5 self-start")}>
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="line-clamp-1 min-w-0 text-sm font-normal text-foreground in-data-[intent=danger]:text-destructive">
          {label ?? children}
        </span>
        {description ? (
          <span className="line-clamp-1 min-w-0 text-xs font-normal text-muted-foreground-2">
            {description}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className={cx(menuTrailingClassName, rich && "h-5 self-start")}>
          {trailing}
        </span>
      ) : null}
    </span>
  );
}

export type MenuDigitProps = { index: number };

export function MenuDigit({ index }: MenuDigitProps) {
  if (index > 9) return null;
  const digit = String((index + 1) % 10);
  return (
    <span
      data-menu-digit={digit}
      className="w-2 text-center text-xs font-normal text-muted-foreground-2 tabular-nums pointer-coarse:hidden"
    >
      {digit}
    </span>
  );
}

export type MenuSearchRowProps = ComponentProps<"div"> & {
  pickOnEnter?: boolean;
  pickOnDigit?: boolean;
};

export function MenuSearchRow({
  className,
  children,
  pickOnEnter = false,
  pickOnDigit = false,
  onKeyDownCapture,
  ...props
}: MenuSearchRowProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event);
    if (event.defaultPrevented) return;
    const row = event.currentTarget;
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const container = menuContainerOf(row);
    if (
      pickOnDigit &&
      /^[0-9]$/.test(event.key) &&
      !window.matchMedia("(pointer: coarse)").matches &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      input.value === ""
    ) {
      const item = container
        ?.querySelector(`[data-menu-digit="${event.key}"]`)
        ?.closest<HTMLElement>(enabledMenuItemSelector);
      if (item == null) return;
      event.preventDefault();
      item.click();
      requestAnimationFrame(() => input.isConnected && input.focus());
      return;
    }
    if (
      !pickOnEnter ||
      event.key !== "Enter" ||
      event.nativeEvent.isComposing ||
      input.value.trim() === "" ||
      !container
    )
      return;
    const first = [
      ...container.querySelectorAll<HTMLElement>(enabledMenuItemSelector),
    ].find(
      (item) =>
        (row.compareDocumentPosition(item) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
        0,
    );
    if (first === undefined) return;
    event.preventDefault();
    first.click();
  };
  return (
    <>
      <div
        data-slot="menu-search-row"
        className={cx("flex shrink-0 items-center", className)}
        onKeyDownCapture={onKeyDown}
        {...props}
      >
        {children}
      </div>
      <div
        data-slot="menu-separator"
        className={cx(menuSeparatorClassName, "shrink-0")}
      />
    </>
  );
}
