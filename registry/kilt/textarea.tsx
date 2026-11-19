import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/textarea.css";

export type TextareaVariant = "default" | "blank" | "editor";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
}

export function Textarea({ variant = "default", className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      data-tone="placeholder"
      className={cn("kilt-textarea", className)}
      {...props}
    />
  );
}
