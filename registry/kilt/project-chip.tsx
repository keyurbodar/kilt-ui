import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/project-chip.css";

export type ProjectChipColor = `chart-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface ProjectChipProps extends HTMLAttributes<HTMLSpanElement> {
  color?: ProjectChipColor;
}

/** Two-letter project code on a chart-colour tile. */
export function ProjectChip({ color = "chart-2", className, children, ...props }: ProjectChipProps) {
  return (
    <span data-slot="project-chip" data-color={color} className={cn("kilt-project-chip", className)} {...props}>
      {children}
    </span>
  );
}
