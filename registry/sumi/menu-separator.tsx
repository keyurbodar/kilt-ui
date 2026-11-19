import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/menu-separator.css";

export function MenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="menu-separator" role="separator" className={cn("sumi-menu-separator", className)} {...props} />;
}
