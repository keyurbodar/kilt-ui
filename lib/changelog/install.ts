import type { ChangeEntry } from "@/lib/changelog/parse";
import { systemList } from "@/lib/docs/components";
import registryFiles from "@/lib/registry-files.gen.json";

// What an entry installs, from the registry files the build wrote, so
// /changelog.md can tell an agent exactly what to re-install.

export type EntryInstall =
  /** A registry item, and whether it has a Base UI flavor at /r/base/. */
  | { kind: "item"; name: string; base: boolean }
  /** The agent skill, installed with `npx skills add`. */
  | { kind: "skill" }
  /** A change across every component. */
  | { kind: "all" }
  /** No single item: a docs-site feature, or a change the sentence spreads
   *  over several named components. */
  | { kind: "none" };

const ITEMS = new Set(registryFiles.items);
const BASE_ITEMS = new Set(registryFiles.base);

/** The registry name a doc page installs: its system entry's `installSlug`
 *  when it has one (Surfaces installs `elevated`), else the slug itself. The
 *  same lookup the page's install section and its Markdown use. */
function installNameForPage(slug: string): string {
  return systemList.find((s) => s.slug === slug)?.installSlug ?? slug;
}

const item = (name: string): EntryInstall =>
  ITEMS.has(name)
    ? { kind: "item", name, base: BASE_ITEMS.has(name) }
    : { kind: "none" };

export function entryInstall(entry: ChangeEntry): EntryInstall {
  const slug = entry.href ? /^\/docs\/([^/#]+)$/.exec(entry.href)?.[1] : undefined;
  if (slug === "skill") return { kind: "skill" };
  if (slug) return item(installNameForPage(slug));
  if (entry.href) return { kind: "none" };
  if (entry.name === "All components") return { kind: "all" };
  // A bold label naming one registry item (MobileDrawer → mobile-drawer).
  return item(entry.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase());
}
