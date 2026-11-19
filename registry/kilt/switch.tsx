"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/switch.css";

export type SwitchProps = ComponentProps<typeof BaseSwitch.Root>;

/** CDS switch. FF's spring switch stays available as `@kilt/ff-switch`. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root data-slot="switch" className={cn("kilt-switch", className)} {...props}>
      <BaseSwitch.Thumb className="kilt-switch__th" />
    </BaseSwitch.Root>
  );
}
