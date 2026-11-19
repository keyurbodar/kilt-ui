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

export function SessionRow({ title, meta, working, active }: { title: ReactNode; meta?: ReactNode; working?: boolean; active?: boolean }) {
  return (
    <div data-slot="dv-session" data-active={active ? "" : undefined} className="kilt-dv kilt-dv-session">
      <div className="kilt-dv-session__body">
        <span className="kilt-dv-session__status">{working && <WorkingIndicator />}</span>
        <span className="kilt-dv-session__lines">
          <span className="kilt-dv-session__title">{title}</span>
          {meta != null && <span className={cn("kilt-dv-session__meta", working && "kilt-dv-shimmer")}>{meta}</span>}
        </span>
      </div>
    </div>
  );
}

const WORKING_DOTS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * 2 * Math.PI;
  return { cx: 8 + 6.5 * Math.sin(a), cy: 8 - 6.5 * Math.cos(a), delay: `${-(10 - i) / 10}s` };
});

export function WorkingIndicator() {
  return (
    <svg viewBox="0 0 16 16" className="kilt-dv-working" aria-hidden>
      {WORKING_DOTS.map((d) => (
        <circle key={d.delay} cx={d.cx} cy={d.cy} r={0.9} fill="currentColor" style={{ animationDelay: d.delay }} />
      ))}
    </svg>
  );
}
