import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MenuRowChkIcon, MenuRowIcoIcon } from "./icons";
import "./tokens.css";
import "./styles/menu-row.css";

export type MenuRowDensity = "default" | "rich" | "palette";
export type MenuRowIntent = "neutral" | "danger";

export interface MenuRowContentProps {
  /** Leading 16px icon lane; `null` drops the lane. */
  icon?: ReactNode;
  description?: ReactNode;
  /** Keys shown as Kbd chips, e.g. `["⌘", "N"]`. */
  keys?: string[];
  meta?: ReactNode;
  checked?: boolean;
  children: ReactNode;
}

export interface MenuRowProps extends MenuRowContentProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  density?: MenuRowDensity;
  intent?: MenuRowIntent;
  highlighted?: boolean;
  disabled?: boolean;
}

export function menuRowAttrs({ density = "default", intent = "neutral" }: { density?: MenuRowDensity; intent?: MenuRowIntent }) {
  return { "data-slot": "menu-row", "data-density": density, "data-intent": intent } as const;
}

/** Inner anatomy shared by MenuRow, MenuItem and CommandPalette rows. */
export function MenuRowContent({ icon, description, keys, meta, checked, children }: MenuRowContentProps) {
  return (
    <>
      {icon !== null && <span className="sumi-menu-row__ico">{icon ?? <MenuRowIcoIcon />}</span>}
      <span className="sumi-menu-row__lb">
        <span>{children}</span>
        {description != null && <span className="sumi-menu-row__ds">{description}</span>}
      </span>
      {keys != null && keys.length > 0 && (
        <span className="sumi-menu-row__tr">
          <span className="sumi-menu-row__kg">
            {keys.map((k) => (
              <kbd key={k} className="sumi-menu-row__k">
                {k}
              </kbd>
            ))}
          </span>
        </span>
      )}
      {meta != null && <span className="sumi-menu-row__meta">{meta}</span>}
      {checked && (
        <span className="sumi-menu-row__chk">
          <MenuRowChkIcon />
        </span>
      )}
    </>
  );
}

/** Static row. Inside a Menu use MenuItem, which adds keyboard behaviour. */
export function MenuRow({ density, intent, highlighted, disabled, icon, description, keys, meta, checked, className, children, ...props }: MenuRowProps) {
  return (
    <div
      {...menuRowAttrs({ density, intent })}
      data-highlighted={highlighted || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn("sumi-menu-row", className)}
      {...props}
    >
      <MenuRowContent icon={icon} description={description} keys={keys} meta={meta} checked={checked}>
        {children}
      </MenuRowContent>
    </div>
  );
}
