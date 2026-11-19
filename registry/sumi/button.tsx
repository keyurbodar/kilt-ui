"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/button.css";

export type ButtonVariant = "solid" | "soft" | "ghost" | "outline" | "link" | "bare" | "inverse" | "segmented";
export type ButtonIntent = "neutral" | "accent" | "danger";
export type ButtonSize = "xs" | "sm" | "base" | "lg" | "icon-xs" | "icon-sm" | "icon-base";
export type ButtonShape = "default" | "segment-start" | "segment-end";

export interface ButtonProps extends ComponentProps<typeof BaseButton> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Selected state for ghost, bare and segmented buttons. */
  selected?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant = "solid",
  intent = "neutral",
  size = "sm",
  shape = "default",
  selected,
  iconStart,
  iconEnd,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      data-slot="button"
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      data-shape={shape}
      data-selected={selected || undefined}
      aria-pressed={selected}
      className={cn("sumi-button", className)}
      {...props}
    >
      {iconStart != null && <span className="sumi-button__i0">{iconStart}</span>}
      {children != null && <span className="sumi-button__lbl">{children}</span>}
      {iconEnd != null && <span className="sumi-button__i1">{iconEnd}</span>}
    </BaseButton>
  );
}
