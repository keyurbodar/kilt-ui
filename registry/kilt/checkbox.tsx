"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { CheckboxCkIcon, CheckboxMiIcon } from "./icons";
import "./tokens.css";
import "./styles/checkbox.css";

export type CheckboxProps = ComponentProps<typeof BaseCheckbox.Root>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root data-slot="checkbox" className={cn("kilt-checkbox", className)} {...props}>
      <span className="kilt-checkbox__ind">
        <CheckboxCkIcon className="kilt-checkbox__ck" />
        <CheckboxMiIcon className="kilt-checkbox__mi" />
      </span>
    </BaseCheckbox.Root>
  );
}
