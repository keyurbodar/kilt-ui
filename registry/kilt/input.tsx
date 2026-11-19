"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/input.css";

export type InputVariant = "default" | "ghost" | "blank";
export type InputSize = "xs" | "sm" | "base";
export type InputFont = "sans" | "mono" | "numeric";

export interface InputProps extends Omit<ComponentProps<typeof BaseInput>, "size"> {
  variant?: InputVariant;
  size?: InputSize;
  font?: InputFont;
}

export function Input({ variant = "default", size = "base", font = "sans", className, ...props }: InputProps) {
  return (
    <BaseInput
      data-slot="input"
      data-variant={variant}
      data-size={size}
      data-font={font}
      className={cn("kilt-input", className)}
      {...props}
    />
  );
}
