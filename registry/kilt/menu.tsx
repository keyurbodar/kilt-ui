"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { MenuRowContent, type MenuRowContentProps, type MenuRowDensity, type MenuRowIntent, menuRowAttrs } from "./menu-row";
import "./tokens.css";
import "./styles/menu.css";
import "./styles/menu-row.css";
import "./styles/live.css";

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export interface MenuContentProps extends ComponentProps<typeof BaseMenu.Popup> {
  side?: ComponentProps<typeof BaseMenu.Positioner>["side"];
  align?: ComponentProps<typeof BaseMenu.Positioner>["align"];
  sideOffset?: number;
}

export function MenuContent({ side = "bottom", align = "start", sideOffset = 4, className, ...props }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="kilt-positioner" side={side} align={align} sideOffset={sideOffset}>
        <BaseMenu.Popup data-slot="menu" className={cn("kilt-menu kilt-pop", className)} {...props} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export interface MenuItemProps extends Omit<ComponentProps<typeof BaseMenu.Item>, "children">, MenuRowContentProps {
  density?: MenuRowDensity;
  intent?: MenuRowIntent;
}

export function MenuItem({ density, intent, icon, description, keys, meta, checked, className, children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item {...menuRowAttrs({ density, intent })} className={cn("kilt-menu-row", className)} {...props}>
      <MenuRowContent icon={icon} description={description} keys={keys} meta={meta} checked={checked}>
        {children}
      </MenuRowContent>
    </BaseMenu.Item>
  );
}

export { MenuLabel } from "./menu-label";
export { MenuSeparator } from "./menu-separator";
