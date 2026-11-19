import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/kbd.css";

export type KbdVariant = "default" | "chip" | "on-fill";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  variant?: KbdVariant;
}

export function Kbd({ variant = "chip", className, children, ...props }: KbdProps) {
  return (
    <kbd data-slot="kbd" data-variant={variant} className={cn("kilt-kbd", className)} {...props}>
      <span>{children}</span>
    </kbd>
  );
}
