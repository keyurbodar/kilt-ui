// Vendored from Kiki (components/directory-view/file-icon.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  createFileTreeIconResolver,
  getBuiltInSpriteSheet,
} from "@pierre/trees";
import { cx } from "class-variance-authority";
import { useEffect } from "react";
import { Icon } from "@/registry/kilt/app/primitives/icon";

const iconSet = "complete";
const spriteId = "capy-file-icon-sprite";
const resolver = createFileTreeIconResolver(iconSet);

const ensureSprite = () => {
  const existing = document.getElementById(spriteId);
  if (existing?.dataset.iconSet === iconSet) return;
  const host = existing ?? document.createElement("div");
  host.id = spriteId;
  host.dataset.iconSet = iconSet;
  host.style.display = "none";
  host.innerHTML = getBuiltInSpriteSheet(iconSet);
  if (existing === null) document.body.append(host);
};

export const folderIconClass = "text-info";

export type FileIconProps = { name: string; className?: string };

export function FileIcon({ name, className }: FileIconProps) {
  useEffect(ensureSprite, []);
  if (name.endsWith("/"))
    return (
      <Icon
        name="folder-1"
        className={cx("size-4 shrink-0", folderIconClass, className)}
      />
    );
  const icon = resolver.resolveIcon("file-tree-icon-file", name);
  return (
    <svg
      aria-hidden
      data-slot="file-icon"
      viewBox={icon.viewBox ?? "0 0 16 16"}
      className={cx("size-4 shrink-0 text-icon-muted", className)}
    >
      <use href={`#${icon.name}`} />
    </svg>
  );
}
