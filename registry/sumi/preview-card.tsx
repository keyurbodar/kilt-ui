"use client";

import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { sumiMotion } from "./tokens";
import "./tokens.css";
import "./styles/preview-card.css";
import "./styles/live.css";

export const PreviewCard = BasePreviewCard.Root;

export function PreviewCardTrigger({ delay = sumiMotion["delay-hover"].ms, ...props }: ComponentProps<typeof BasePreviewCard.Trigger>) {
  return <BasePreviewCard.Trigger delay={delay} {...props} />;
}

export type PreviewCardWidth = 288 | 320 | 384;

export interface PreviewCardContentProps extends ComponentProps<typeof BasePreviewCard.Popup> {
  width?: PreviewCardWidth;
  side?: ComponentProps<typeof BasePreviewCard.Positioner>["side"];
  sideOffset?: number;
}

export function PreviewCardContent({ width = 288, side = "bottom", sideOffset = 6, className, children, ...props }: PreviewCardContentProps) {
  return (
    <BasePreviewCard.Portal>
      <BasePreviewCard.Positioner className="sumi-positioner" side={side} sideOffset={sideOffset}>
        <BasePreviewCard.Popup data-slot="preview-card" data-width={width} className={cn("sumi-preview-card sumi-pop", className)} {...props}>
          <div className="sumi-preview-card__ct">{children}</div>
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
}
