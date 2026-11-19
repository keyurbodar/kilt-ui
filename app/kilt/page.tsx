import { Link } from "@/lib/router";
import { kiltCatalog } from "@/lib/kilt/catalog.gen";
import { KILT_SITE_URL } from "@/lib/kilt/site";

export default function KiltIndex() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-site-display text-foreground leading-none">Kilt</h1>
        <p className="mt-2 text-site-body text-muted-foreground">
          The Capy Design System on Base UI. Every component is compiled from the CDS Doop canvas, so its
          markup, tokens and states match the source 1:1. Fluid Functionalism components stay available under /docs.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border p-3 text-sm">
          <code>npx shadcn@latest add {KILT_SITE_URL}/r/kilt.json</code>
        </pre>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {kiltCatalog.map((c) => (
          <li key={c.slug}>
            <Link href={`/kilt/${c.slug}`} className="block rounded-lg border border-border p-3 hover:bg-hover">
              <span className="text-foreground">{c.name}</span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">{c.signature}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
