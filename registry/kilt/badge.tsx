import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/badge.css";

export type BadgeVariant = "default" | "ghost" | "filled";
export type BadgeColor = "neutral" | "accent" | "danger" | "warning" | "success" | "info" | "purple" | "pink" | "orange" | "lime";
export type BadgeSize = "base" | "sm" | "xs" | "count";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  /** Leading status dot in the badge colour. */
  dot?: boolean;
}

export function Badge({ variant = "default", color = "neutral", size = "base", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" data-variant={variant} data-color={color} data-size={size} className={cn("kilt-badge", className)} {...props}>
      {dot && <span className="kilt-badge__dot" />}
      <span>{children}</span>
    </span>
  );
}
