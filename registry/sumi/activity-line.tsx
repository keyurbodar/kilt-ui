"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ActivityLineCvIcon } from "./icons";
import "./tokens.css";
import "./styles/activity-line.css";

export interface ActivityLineProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Draws the rails out and turns the chevron; pair with a Collapsible. */
  open?: boolean;
}

/** "Worked for 54s" divider that toggles a collapsed run of agent steps. */
export function ActivityLine({ open = false, className, children, ...props }: ActivityLineProps) {
  return (
    <div data-slot="activity-line" data-state={open ? "open" : undefined} className="sumi-activity-line">
      <span className="sumi-activity-line__rl sumi-activity-line__l" />
      <button type="button" aria-expanded={open} className={cn("sumi-activity-line__bt", className)} {...props}>
        <span>{children}</span>
        <span className="sumi-activity-line__cv">
          <ActivityLineCvIcon />
        </span>
      </button>
      <span className="sumi-activity-line__rl sumi-activity-line__r" />
    </div>
  );
}
