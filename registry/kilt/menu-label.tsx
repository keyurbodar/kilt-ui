import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/menu-label.css";

export function MenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="menu-label" className={cn("kilt-menu-label", className)} {...props} />;
}
