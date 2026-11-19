import { type ComponentProps, useState } from "react";
import { DiffFileCard } from "@/registry/kilt/app/components/diff-tab/diff-file-card";
import { type DiffFile, fileDomId } from "@/registry/kilt/app/components/diff-tab/model";

export type DiffCardsProps = ComponentProps<"div"> & { files?: ReadonlyArray<DiffFile> };

const sampleFiles: ReadonlyArray<DiffFile> = [
  {
    path: "registry/kilt/devin/devin.css",
    previousPath: null,
    kind: "modified",
    patch:
      "@@ -12,7 +12,8 @@\n .kilt-dv-session {\n   display: flex;\n-  height: 40px;\n+  height: 44px;\n+  border-radius: 6px;\n   padding: 0 4px;\n   color: var(--kilt-color-text-primary);\n }",
    additions: 2,
    deletions: 1,
    binary: false,
  },
  {
    path: "registry/kilt/devin/working-indicator.tsx",
    previousPath: null,
    kind: "added",
    patch:
      "@@ -0,0 +1,4 @@\n+export function WorkingIndicator() {\n+  return <svg viewBox=\"0 0 16 16\" />;\n+}\n+",
    additions: 4,
    deletions: 0,
    binary: false,
  },
];

export function DiffCards({ files = sampleFiles, className, ...props }: DiffCardsProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const onCollapsedChange = (path: string, next: boolean) =>
    setCollapsed((prev) => {
      const out = new Set(prev);
      if (next) out.add(path);
      else out.delete(path);
      return out;
    });
  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")} {...props}>
      {files.map((file) => (
        <DiffFileCard
          key={file.path}
          file={file}
          domId={fileDomId(file.path)}
          collapsible
          collapsed={collapsed.has(file.path)}
          onCollapsedChange={onCollapsedChange}
        />
      ))}
    </div>
  );
}
