import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SidebarThreadRowMcIcon } from "./icons";
import "./tokens.css";
import "./styles/sidebar-thread-row.css";

export interface SidebarThreadRowProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  title: ReactNode;
  time?: ReactNode;
  /** A ProjectChip. */
  chip?: ReactNode;
  project?: ReactNode;
  machine?: ReactNode;
  active?: boolean;
}

export function SidebarThreadRow({ title, time, chip, project, machine, active = false, className, ...props }: SidebarThreadRowProps) {
  return (
    <a
      data-slot="sidebar-thread-row"
      data-state={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn("kilt-sidebar-thread-row", className)}
      {...props}
    >
      <span className="kilt-sidebar-thread-row__col">
        <span className="kilt-sidebar-thread-row__l1">
          <span className="kilt-sidebar-thread-row__tt">{title}</span>
          {time != null && <span className="kilt-sidebar-thread-row__tm">{time}</span>}
        </span>
        <span className="kilt-sidebar-thread-row__l2">
          {chip != null && <span className="kilt-sidebar-thread-row__pc">{chip}</span>}
          {project != null && <span className="kilt-sidebar-thread-row__pn">{project}</span>}
          {machine != null && (
            <span className="kilt-sidebar-thread-row__mc">
              <SidebarThreadRowMcIcon />
              <span>{machine}</span>
            </span>
          )}
        </span>
      </span>
    </a>
  );
}
