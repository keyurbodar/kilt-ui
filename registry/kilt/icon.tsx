import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import type { IconId } from "./icon-ids";

/** Capy's icon sprite (350 glyphs on a 24px grid), served from public/. */
export const KILT_ICON_SPRITE = "/kilt/icons.svg";

const SIZE = { xs: "var(--kilt-spacing-icon-xs)", sm: "var(--kilt-spacing-icon-sm)", base: "var(--kilt-spacing-icon-base)", lg: "var(--kilt-spacing-icon-lg)" } as const;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "name"> & {
  name: IconId;
  size?: keyof typeof SIZE;
  /** Accessible name; without it the icon is decorative. */
  label?: string;
};

export function Icon({ name, size = "base", label, className, style, ...props }: IconProps) {
  return (
    <svg
      data-icon={name}
      aria-hidden={label === undefined}
      role={label === undefined ? undefined : "img"}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      style={{ width: SIZE[size], height: SIZE[size], ...style }}
      {...props}
    >
      {label !== undefined && <title>{label}</title>}
      <use href={`${KILT_ICON_SPRITE}#${name}`} />
    </svg>
  );
}

export type { IconId };
