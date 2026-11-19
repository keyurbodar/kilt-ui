"use client";

import Link from "next/link";
import { CopyPromptButton } from "@/lib/docs/copy-prompt-button";
import type { KiltCatalogEntry } from "@/lib/kilt/catalog.gen";
import { kiltDemos } from "@/lib/kilt/demos";
import { kiltInstallCommand, kiltInstallPrompt } from "@/lib/kilt/site";

export function KiltDocPage({ entry }: { entry: KiltCatalogEntry }) {
  const Demo = kiltDemos[entry.slug];
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/kilt" className="text-sm text-muted-foreground hover:text-foreground">
          Kilt
        </Link>
        <h1 className="mt-2 text-site-display text-foreground leading-none">{entry.name}</h1>
        <p className="mt-2 text-site-body text-muted-foreground">{entry.description}</p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <code className="min-w-0 truncate text-sm text-muted-foreground">{kiltInstallCommand(entry.slug)}</code>
        <CopyPromptButton prompt={kiltInstallPrompt(entry.name, entry.slug)} />
      </div>
      <section
        data-testid="kilt-preview"
        className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-[var(--kilt-color-background)] p-8 text-[var(--kilt-color-foreground)]"
      >
        {Demo ? <Demo /> : null}
      </section>
      {entry.props.length > 0 && (
        <section>
          <h2 className="text-site-body text-foreground">CDS props</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-normal">Prop</th>
                <th className="py-2 pr-4 font-normal">Values</th>
                <th className="py-2 font-normal">Default</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((p) => (
                <tr key={p.name} className="border-t border-border align-top">
                  <td className="py-2 pr-4 font-mono">{p.name}</td>
                  <td className="py-2 pr-4">{p.options?.join(" | ") ?? p.type}</td>
                  <td className="py-2 font-mono">{p.default ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
