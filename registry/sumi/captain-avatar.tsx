import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./tokens.css";
import "./styles/captain-avatar.css";

export type CaptainAvatarSize = "2xs" | "xs" | "sm" | "base" | "xl" | "2xl";

export interface CaptainAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src: string;
  size?: CaptainAvatarSize;
  /** Tile colour behind the portrait. */
  background?: string;
  alt?: string;
}

export function CaptainAvatar({ src, size = "sm", background, alt = "", className, style, ...props }: CaptainAvatarProps) {
  return (
    <span
      data-slot="captain-avatar"
      data-size={size}
      role="img"
      aria-label={alt || undefined}
      className={cn("sumi-captain-avatar", className)}
      style={{ ...(background ? { "--bg": background } : null), ...style } as CSSProperties}
      {...props}
    >
      <img src={src} alt="" />
    </span>
  );
}
