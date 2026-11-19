// Vendored from Kiki (primitives/icon/Icon.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cva, type VariantProps } from "class-variance-authority";
import type { SVGProps } from "react";
import type { IconId } from "./icon-ids";
import spriteUrl from "./sprite.svg?url";

const ICON_GRID = 24;

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-(--icon-xs)",
      sm: "size-(--icon-sm)",
      base: "size-(--icon-base)",
      lg: "size-(--icon-lg)",
    },
  },
});

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "name"> &
  VariantProps<typeof iconVariants> & {
    name: IconId;
    label?: string;
  };

export function Icon({ name, label, size, className, ...props }: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: the title renders when a label is given; unlabelled icons are aria-hidden
    <svg
      data-icon={name}
      aria-hidden={label === undefined}
      role={label === undefined ? undefined : "img"}
      width={ICON_GRID}
      height={ICON_GRID}
      viewBox={`0 0 ${ICON_GRID} ${ICON_GRID}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconVariants({ size, className })}
      {...props}
    >
      {label !== undefined && <title>{label}</title>}
      <use href={`${spriteUrl}#${name}`} />
    </svg>
  );
}
