import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PaneTabPiIcon } from "./icons";
import "./tokens.css";
import "./styles/pane-tab.css";

export interface PaneTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  selected?: boolean;
  /** Selected tab in a pane that does not have focus. */
  unfocused?: boolean;
}

export function PaneTab({ icon, selected = false, unfocused = false, className, children, ...props }: PaneTabProps) {
  return (
    <button
      type="button"
      role="tab"
      data-slot="pane-tab"
      data-state={selected ? (unfocused ? "selected-unfocused" : "selected") : undefined}
      aria-selected={selected && !unfocused}
      className={cn("sumi-pane-tab", className)}
      {...props}
    >
      <span className="sumi-pane-tab__pi">{icon ?? <PaneTabPiIcon />}</span>
      <span className="sumi-pane-tab__pl">{children}</span>
    </button>
  );
}
