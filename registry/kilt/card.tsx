import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/card.css";

export type CardVariant = "default" | "interactive" | "panel" | "ghost";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CardVariant;
  /** Hairline dividers between direct children of the content. */
  rows?: boolean;
  title?: ReactNode;
  /** Actions row under the content. */
  footer?: ReactNode;
}

export function Card({ variant = "default", rows = false, title, footer, className, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-rows={rows || undefined}
      tabIndex={variant === "interactive" ? 0 : undefined}
      className={cn("kilt-card", className)}
      {...props}
    >
      {title != null && (
        <div className="kilt-card__hd">
          <div className="kilt-card__tt">{title}</div>
        </div>
      )}
      <div className="kilt-card__ct">{children}</div>
      {footer != null && <div className="kilt-card__ft">{footer}</div>}
    </div>
  );
}
