// Vendored from Kiki (components/composer/drop-overlay.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { createPortal } from "react-dom";
import { Icon } from "@/registry/kilt/app/primitives/icon";

export type AttachmentDropOverlayProps = { open: boolean };

/**
 * The page-wide target shown while files are dragged over the app. Portalled to
 * `document.body` so it covers the shell, and never takes pointer events: the
 * drag itself is what tracks it.
 */
export function AttachmentDropOverlay({ open }: AttachmentDropOverlayProps) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-(--z-overlay-content) flex items-center justify-center bg-overlay p-6 transition-opacity duration-fast ease-out">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-(--radius-panel) border-(length:--border-width-hairline) border-dashed border-border-3 bg-popover px-12 py-10 text-center shadow-overlay">
        <span className="flex size-10 items-center justify-center rounded-(--radius) bg-secondary text-icon-muted">
          <Icon name="images-1" size="lg" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-foreground">
            Drop files to attach
          </span>
          <span className="text-sm text-muted-foreground-2">
            Up to 250 MB per file
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
