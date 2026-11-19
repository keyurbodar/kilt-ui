// Vendored from Kiki (primitives/responsive-menu/responsive-menu.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { Menu as BaseMenu } from "@base-ui/react/menu";
import { useRender } from "@base-ui/react/use-render";
import { cx } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  type DrawerTriggerProps,
} from "@/registry/kilt/app/primitives/drawer";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  type MenuContentProps,
  MenuItem,
  type MenuRowVariants,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuTrigger,
  type MenuTriggerProps,
  menuRowVariants,
} from "@/registry/kilt/app/primitives/menu";
import {
  CheckmarkGlyph,
  ChevronLeftSmallGlyph,
  ChevronRightSmallGlyph,
} from "./glyphs";
import { createLevelStack, type LevelStack } from "./level-stack";
import { usePhone } from "./use-phone";

const rowIconClass =
  "flex size-(--icon-sm) shrink-0 items-center justify-center text-icon-muted in-data-[intent=danger]:text-destructive";
const rowTrailingClass =
  "ml-auto flex shrink-0 items-center gap-1.5 text-sm font-normal text-muted-foreground-1";
const rowChevronClass = "size-(--icon-sm) shrink-0 text-muted-foreground-3";
const checkboxBoxClass =
  "relative flex size-4 shrink-0 items-center justify-center rounded-(--radius-sm) border-hairline border-border-3 bg-input text-primary-foreground transition-colors duration-100 data-[checked]:border-transparent data-[checked]:bg-primary data-[checked]:[--focus-ring:var(--primary-text)] data-[indeterminate]:border-transparent data-[indeterminate]:bg-primary data-[indeterminate]:[--focus-ring:var(--primary-text)]";
const checkboxIndicatorClass = cx(
  checkboxBoxClass,
  "[&>*]:hidden data-[checked]:[&>*]:block",
);
const separatorClass = "-mx-1 my-1 h-px bg-border-1";
const separatorEdgeClass =
  "[[data-menu-list]>&:first-child]:hidden [[data-menu-list]>&:last-child]:hidden [[data-slot=menu-separator]+&]:hidden";
const rowLabelClass =
  "mask-fade-r min-w-0 flex-1 overflow-hidden whitespace-nowrap";
const groupLabelClass =
  "mt-1 flex min-h-5.5 items-center px-2 text-xs font-medium text-muted-foreground-2 first:mt-0";
const levelClass =
  "flex flex-col transition-[opacity,translate] duration-fast ease-out-quint data-[nav=push]:starting:translate-x-2 data-[nav=push]:starting:opacity-0 data-[nav=pop]:starting:-translate-x-2 data-[nav=pop]:starting:opacity-0";

type ResponsiveMenuContextValue = {
  phone: boolean;
  close: () => void;
  levels?: LevelStack;
};

const ResponsiveMenuContext = createContext<ResponsiveMenuContextValue | null>(
  null,
);

const desktopFallback: ResponsiveMenuContextValue = {
  phone: false,
  close: () => {},
};

function useResponsiveMenuContext() {
  return use(ResponsiveMenuContext) ?? desktopFallback;
}

type LevelContextValue = {
  portalNode: HTMLDivElement | null;
  covered: boolean;
  setChildOpen: (open: boolean) => void;
};

const LevelContext = createContext<LevelContextValue | null>(null);

const focusById = (id: string) =>
  requestAnimationFrame(() =>
    document.getElementById(id)?.focus({ preventScroll: true }),
  );

type OpenChangeDetails = { reason: string; cancel: () => void };

export type ResponsiveMenuProps = Omit<
  ComponentProps<typeof BaseMenu.Root>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void;
};

export function ResponsiveMenu({
  open: openProp,
  defaultOpen,
  onOpenChange,
  highlightItemOnHover,
  children,
  ...menuProps
}: ResponsiveMenuProps) {
  const phone = usePhone();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  const [levels] = useState(createLevelStack);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const handleOpenChange = (next: boolean, details: OpenChangeDetails) => {
    if (!next && details.reason === "escape-key" && levels.popTop()) {
      details.cancel();
      return;
    }
    setOpen(next);
  };
  return (
    <ResponsiveMenuContext
      value={{ phone, close: () => setOpen(false), levels }}
    >
      {phone ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Menu
          {...menuProps}
          open={open}
          onOpenChange={handleOpenChange}
          highlightItemOnHover={highlightItemOnHover}
        >
          {children}
        </Menu>
      )}
    </ResponsiveMenuContext>
  );
}

export type ResponsiveMenuTriggerProps = MenuTriggerProps;

export function ResponsiveMenuTrigger(props: ResponsiveMenuTriggerProps) {
  const { phone } = useResponsiveMenuContext();
  if (phone) return <DrawerTrigger {...(props as DrawerTriggerProps)} />;
  return <MenuTrigger {...props} />;
}

export type ResponsiveMenuContentProps = Omit<MenuContentProps, "children"> & {
  children?: ReactNode | (() => ReactNode);
  drawerScrollFade?: boolean;
};

function RenderLazy({ render }: { render: () => ReactNode }) {
  return render();
}

export function ResponsiveMenuContent({
  className,
  children,
  drawerScrollFade: _drawerScrollFade,
  ...props
}: ResponsiveMenuContentProps) {
  const { phone } = useResponsiveMenuContext();
  const content =
    typeof children === "function" ? (
      <RenderLazy render={children} />
    ) : (
      children
    );
  if (!phone) {
    return (
      <MenuContent className={className} {...props}>
        <ResponsiveMenuLevel>{content}</ResponsiveMenuLevel>
      </MenuContent>
    );
  }
  return (
    <DrawerContent>
      <div className="flex flex-col px-2 pb-2">
        <ResponsiveMenuLevel>{content}</ResponsiveMenuLevel>
      </div>
    </DrawerContent>
  );
}

export type ResponsiveMenuLevelProps = ComponentProps<"div">;

export function ResponsiveMenuLevel({
  className,
  children,
  ...props
}: ResponsiveMenuLevelProps) {
  const [openChildren, setOpenChildren] = useState(0);
  const [popped, setPopped] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);
  const covered = openChildren > 0;
  const setChildOpen = (open: boolean) => {
    setOpenChildren((count) => count + (open ? 1 : -1));
    if (!open) setPopped(true);
  };
  return (
    <LevelContext value={{ portalNode, covered, setChildOpen }}>
      <div
        {...props}
        data-slot="responsive-menu-level"
        data-menu-list
        data-nav={popped ? "pop" : undefined}
        className={cx(levelClass, covered && "hidden", className)}
      >
        {children}
      </div>
      <div
        ref={setPortalNode}
        className={cx("flex flex-col", !covered && "hidden")}
      />
    </LevelContext>
  );
}

function PushedLevel({
  phone,
  children,
}: {
  phone: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (phone) return;
    const level = ref.current;
    if (level === null || level.contains(document.activeElement)) return;
    const target =
      level.querySelector("input") ?? level.querySelector('[role="menuitem"]');
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }, [phone]);
  return (
    <div
      ref={ref}
      data-slot="responsive-menu-level"
      data-nav="push"
      className={levelClass}
    >
      <ResponsiveMenuLevel>{children}</ResponsiveMenuLevel>
    </div>
  );
}

type ItemHandlers = {
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
};

export type ResponsiveMenuItemProps = Omit<
  ComponentProps<typeof BaseMenu.Item>,
  "className" | "render" | keyof ItemHandlers
> &
  ItemHandlers &
  Pick<MenuRowVariants, "intent" | "density"> & {
    className?: string;
    render?: ReactElement;
    /** The shortcut this row answers while the menu is open. */
    command?: string;
  };

export function ResponsiveMenuItem({
  render,
  className,
  intent,
  density,
  disabled,
  closeOnClick = true,
  command,
  onClick,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  "aria-keyshortcuts": ariaKeyshortcuts,
  "aria-current": ariaCurrent,
  id,
  children,
  ...itemProps
}: ResponsiveMenuItemProps) {
  const { phone, close } = useResponsiveMenuContext();
  const covered = use(LevelContext)?.covered ?? false;
  const element = useRender({
    defaultTagName: "button",
    render,
    props: {
      type: render === undefined ? "button" : undefined,
      id,
      onPointerEnter,
      onPointerLeave,
      "data-slot": "responsive-menu-item",
      "data-intent": intent === "danger" ? "danger" : undefined,
      "data-menu-command": command,
      className: cx(
        menuRowVariants({ interaction: "button", intent, density }),
        className,
      ),
      disabled,
      "aria-keyshortcuts": ariaKeyshortcuts,
      "aria-current": ariaCurrent,
      onKeyDown,
      onClick: (event: Parameters<MouseEventHandler<HTMLElement>>[0]) => {
        onClick?.(event);
        if (closeOnClick && !event.defaultPrevented) close();
      },
      children,
    },
  });
  if (phone) return element;
  return (
    <MenuItem
      {...itemProps}
      id={id}
      command={command}
      render={render}
      className={className}
      intent={intent}
      density={density}
      disabled={disabled || covered}
      closeOnClick={closeOnClick}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      aria-keyshortcuts={ariaKeyshortcuts}
      aria-current={ariaCurrent}
    >
      {children}
    </MenuItem>
  );
}

export type ResponsiveMenuCheckboxItemProps = Omit<
  ComponentProps<typeof BaseMenu.CheckboxItem>,
  "className" | "onCheckedChange"
> &
  Pick<MenuRowVariants, "density"> & {
    className?: string;
    onCheckedChange?: (checked: boolean) => void;
  };

export function ResponsiveMenuCheckboxItem({
  className,
  density,
  checked,
  disabled,
  onCheckedChange,
  children,
  ...itemProps
}: ResponsiveMenuCheckboxItemProps) {
  const { phone } = useResponsiveMenuContext();
  const covered = use(LevelContext)?.covered ?? false;
  if (!phone) {
    return (
      <MenuCheckboxItem
        {...itemProps}
        className={className}
        density={density}
        checked={checked}
        disabled={disabled || covered}
        onCheckedChange={(next) => onCheckedChange?.(next)}
      >
        {children}
      </MenuCheckboxItem>
    );
  }
  return (
    <button
      type="button"
      data-slot="responsive-menu-checkbox-item"
      className={cx(
        menuRowVariants({ interaction: "button", density }),
        className,
      )}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span
        className={cx(rowIconClass, density === "rich" && "h-5 self-start")}
      >
        <span
          className={checkboxIndicatorClass}
          data-checked={checked ? "" : undefined}
        >
          <CheckmarkGlyph className="size-3" />
        </span>
      </span>
      {children}
    </button>
  );
}

function SubRow({
  icon,
  label,
  value,
  valueClassName,
  after,
}: {
  icon?: ReactNode;
  label: ReactNode;
  value?: ReactNode;
  valueClassName?: string;
  after?: ReactNode;
}) {
  return (
    <span
      data-slot="menu-row"
      className="flex min-w-0 flex-1 items-center gap-2 text-left"
    >
      {icon ? <span className={rowIconClass}>{icon}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="line-clamp-1 min-w-0 text-sm font-normal text-foreground in-data-[intent=danger]:text-destructive">
          {label}
        </span>
      </span>
      <span className={rowTrailingClass}>
        {value ? (
          <span className={cx("min-w-0 max-w-32 truncate", valueClassName)}>
            {value}
          </span>
        ) : null}
        <ChevronRightSmallGlyph className={rowChevronClass} />
        {after}
      </span>
    </span>
  );
}

export type ResponsiveMenuSubProps = {
  icon?: ReactNode;
  label: ReactNode;
  value?: ReactNode;
  valueClassName?: string;
  trailing?: ReactNode;
  contentClassName?: string;
  contentHeight?: string;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children?: ReactNode;
};

export function ResponsiveMenuSub({
  icon,
  label,
  value,
  valueClassName,
  trailing,
  contentClassName,
  contentHeight: _contentHeight,
  onOpenChange,
  defaultOpen,
  children,
}: ResponsiveMenuSubProps) {
  const { phone } = useResponsiveMenuContext();
  if (!phone) {
    return (
      <MenuSub onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
        <MenuSubTrigger>
          <SubRow
            icon={icon}
            label={label}
            value={value}
            valueClassName={valueClassName}
            after={trailing}
          />
        </MenuSubTrigger>
        <MenuContent
          className={contentClassName}
          sideOffset={0}
          alignOffset={-4}
        >
          {children}
        </MenuContent>
      </MenuSub>
    );
  }
  return (
    <ResponsiveMenuPage
      label={label}
      trailing={trailing}
      onOpenChange={onOpenChange}
      trigger={
        <SubRow
          icon={icon}
          label={label}
          value={value}
          valueClassName={valueClassName}
        />
      }
    >
      {children}
    </ResponsiveMenuPage>
  );
}

export type ResponsiveMenuPageProps = {
  label: ReactNode;
  trigger: ReactNode;
  density?: MenuRowVariants["density"];
  trailing?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function ResponsiveMenuPage({
  label,
  trigger,
  density,
  trailing,
  onOpenChange,
  children,
}: ResponsiveMenuPageProps) {
  const { phone, levels } = useResponsiveMenuContext();
  const level = use(LevelContext);
  const id = useId();
  const [open, setOpen] = useState(false);
  const notifyOpenChange = useEffectEvent((next: boolean) =>
    onOpenChange?.(next),
  );
  const setChildOpen = level?.setChildOpen;
  useEffect(() => {
    if (!open) return;
    setChildOpen?.(true);
    notifyOpenChange(true);
    const remove = levels?.push(() => {
      setOpen(false);
      if (!phone) focusById(id);
    });
    return () => {
      remove?.();
      setChildOpen?.(false);
      notifyOpenChange(false);
    };
  }, [open, setChildOpen, levels, phone, id]);
  const pop = () => {
    setOpen(false);
    if (!phone) focusById(id);
  };
  const item = (
    <ResponsiveMenuItem
      id={id}
      density={density}
      closeOnClick={false}
      className={trailing === undefined ? undefined : "min-w-0 flex-1"}
      onClick={() => setOpen(true)}
    >
      {trigger}
    </ResponsiveMenuItem>
  );
  return (
    <>
      {trailing === undefined ? (
        item
      ) : (
        <div className="flex min-w-0 items-center">
          {item}
          <span className="flex shrink-0 items-center pr-2">{trailing}</span>
        </div>
      )}
      {open && level?.portalNode
        ? createPortal(
            <PushedLevel phone={phone}>
              <ResponsiveMenuItem closeOnClick={false} onClick={pop}>
                <span className={rowIconClass}>
                  <ChevronLeftSmallGlyph />
                </span>
                <span className={cx(rowLabelClass, "font-medium")}>
                  {label}
                </span>
              </ResponsiveMenuItem>
              <div
                data-slot="menu-separator"
                className={cx(
                  separatorClass,
                  separatorEdgeClass,
                  phone && "mx-1",
                )}
              />
              {children}
            </PushedLevel>,
            level.portalNode,
          )
        : null}
    </>
  );
}

export type ResponsiveMenuLabelProps = {
  className?: string;
  children?: ReactNode;
};

export function ResponsiveMenuLabel({
  className,
  children,
}: ResponsiveMenuLabelProps) {
  const { phone } = useResponsiveMenuContext();
  return (
    <div
      data-slot={phone ? undefined : "menu-label"}
      className={cx(groupLabelClass, className)}
    >
      {children}
    </div>
  );
}

export type ResponsiveMenuSeparatorProps = { className?: string };

export function ResponsiveMenuSeparator({
  className,
}: ResponsiveMenuSeparatorProps) {
  const { phone } = useResponsiveMenuContext();
  if (!phone) return <MenuSeparator className={className} />;
  return (
    <div
      data-slot="menu-separator"
      className={cx(separatorClass, separatorEdgeClass, "mx-1", className)}
    />
  );
}
