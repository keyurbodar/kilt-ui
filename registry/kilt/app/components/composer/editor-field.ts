// Vendored from Kiki (components/composer/editor-field.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cn } from "@/registry/kilt/app/lib/cn";

export type ComposerFieldHeight = "single" | "multi";

const EDITOR_BASE_CLASS =
  "max-h-56 w-full overflow-y-auto overscroll-contain p-1 text-base font-normal text-foreground outline-none md:scroll-fade-y md:supports-[animation-timeline:scroll()]:scrollbar-hide whitespace-pre-wrap [overflow-wrap:anywhere]";

export const EDITOR_FIELD_HEIGHT_CLASS: Record<ComposerFieldHeight, string> = {
  single: "min-h-6",
  multi: "min-h-16",
};

export const editorFieldClass = (
  fieldHeight: ComposerFieldHeight = "single",
  extra?: string,
) => cn(EDITOR_BASE_CLASS, EDITOR_FIELD_HEIGHT_CLASS[fieldHeight], extra);

export const EDITOR_CLASS = editorFieldClass();
