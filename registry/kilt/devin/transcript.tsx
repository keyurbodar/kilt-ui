import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "../tokens.css";
import "./devin.css";

export function Worklog({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dv-worklog" className={cn("kilt-dv kilt-dv-worklog", className)} {...props} />;
}

export function WorklogStep({ duration, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { duration?: ReactNode }) {
  return (
    <div data-slot="dv-step" className={cn("kilt-dv-step", className)} {...props}>
      {children}
      {duration != null && <span className="kilt-dv-step__dur">{duration}</span>}
    </div>
  );
}

export function MessageActions({ time, children }: { time?: ReactNode; children: ReactNode }) {
  return (
    <div data-slot="dv-actions" className="kilt-dv-actions">
      <div role="toolbar" className="kilt-dv-actions__bar">
        {time != null && <span className="kilt-dv-actions__time">{time}</span>}
        {children}
      </div>
    </div>
  );
}

export function ActionButton({ className, ...props }: HTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return <button type="button" className={cn("kilt-dv-actions__btn", className)} {...props} />;
}

export function SuggestionPopup({ group, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { group?: string }) {
  return (
    <div role="listbox" className={cn("kilt-dv kilt-dv-popup", className)} {...props}>
      {group != null && <div className="kilt-dv-group">{group}</div>}
      {children}
    </div>
  );
}

export function SuggestionOption({ highlighted, className, ...props }: HTMLAttributes<HTMLDivElement> & { highlighted?: boolean }) {
  return <div role="option" aria-selected={highlighted} data-highlighted={highlighted ? "" : undefined} className={cn("kilt-dv-option", className)} {...props} />;
}
