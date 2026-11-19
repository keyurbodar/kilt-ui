"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { SidebarModeToggleAIcon, SidebarModeToggleCIcon } from "./icons";
import "./tokens.css";
import "./styles/sidebar-mode-toggle.css";

export type SidebarMode = "captains" | "threads";

export interface SidebarModeToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  mode: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
}

export function SidebarModeToggle({ mode, onModeChange, className, ...props }: SidebarModeToggleProps) {
  return (
    <div role="radiogroup" aria-label="Sidebar mode" data-slot="sidebar-mode-toggle" data-mode={mode} className={cn("sumi-sidebar-mode-toggle", className)} {...props}>
      <button type="button" role="radio" aria-checked={mode === "captains"} aria-label="Captains" className="sumi-sidebar-mode-toggle__b sumi-sidebar-mode-toggle__a" onClick={() => onModeChange?.("captains")}>
        <SidebarModeToggleAIcon />
      </button>
      <button type="button" role="radio" aria-checked={mode === "threads"} aria-label="Threads" className="sumi-sidebar-mode-toggle__b sumi-sidebar-mode-toggle__c" onClick={() => onModeChange?.("threads")}>
        <SidebarModeToggleCIcon />
      </button>
    </div>
  );
}
