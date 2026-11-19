// Vendored from Kiki (primitives/kbd/kbd.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

export const kbdVariants = cva(
  "pointer-events-none inline-flex items-center justify-center gap-0.5 font-sans text-xs font-normal text-muted-foreground-1 select-none",
  {
    variants: {
      variant: {
        default: "",
        chip: "h-4 min-w-4 rounded-(--radius-kbd) bg-secondary px-1",
        onFill:
          "h-4 min-w-4 rounded-(--radius-kbd) bg-current/15 px-1 text-current/80",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type KbdProps = ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>;

export function Kbd({ className, variant, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={kbdVariants({ variant, className })}
      {...props}
    />
  );
}
