import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SidebarSectionHeaderCvIcon } from "./icons";
import "./tokens.css";
import "./styles/sidebar-section-header.css";

export interface SidebarSectionHeaderProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  count?: ReactNode;
}

export function SidebarSectionHeader({ count, className, children, ...props }: SidebarSectionHeaderProps) {
  return (
    <button type="button" data-slot="sidebar-section-header" className={cn("kilt-sidebar-section-header", className)} {...props}>
      <span className="kilt-sidebar-section-header__lb">{children}</span>
      {count != null && <span className="kilt-sidebar-section-header__ct">{count}</span>}
      <span className="kilt-sidebar-section-header__cv">
        <SidebarSectionHeaderCvIcon />
      </span>
    </button>
  );
}
