import { ChangelogFormatError, parseRelease, releaseEntries, type ChangeKind, type Release } from "@/lib/changelog/parse";
import type { ReleaseMarks } from "@/lib/changelog/marks";

/** Every release file under content/changelog/, by file name, bundled at build. */
export type ChangelogFiles = Record<string, string>;
export const CHANGELOG_FILES: ChangelogFiles = Object.fromEntries(
  Object.entries(import.meta.glob<string>("/content/changelog/*.md", { query: "?raw", import: "default", eager: true })).map(
    ([path, text]) => [path.split("/").pop()!, text]
  )
);
const FILE = /^(\d{4}-\d{2})\.md$/;

/** Every release, newest month first. Throws on a malformed file. */
export function loadReleases(files: ChangelogFiles = CHANGELOG_FILES): Release[] {
  return Object.keys(files)
    .filter((name) => FILE.test(name))
    .sort()
    .reverse()
    .map((name) => {
      const release = parseRelease(files[name]!, `content/changelog/${name}`);
      if (release.month !== FILE.exec(name)![1]) {
        throw new ChangelogFormatError(`content/changelog/${name}`, 2, "`month` does not match the file name");
      }
      return release;
    });
}

export interface AheadOfRelease {
  /** The month the pages landed in: `YYYY-MM`. */
  month: string;
  slugs: string[];
}

/** Docs pages that landed after the latest release, badged New ahead of the
 *  release that will list them. An entry lapses on its own once a release
 *  for its month exists, so nothing needs undoing on release day. The
 *  sidebar dots them too, so a new page is marked from the day it lands. */
export const AHEAD_OF_RELEASE: AheadOfRelease[] = [
  // Merged in October 2026; the October release ships Friday 2026-11-06.
  { month: "2026-10", slugs: ["banner", "typography", "reveal", "calendar", "date-picker"] },
  { month: "2026-11", slugs: ["field", "checkbox", "input", "textarea", "breadcrumb", "context-menu", "data-table"] },
];

/** The first month whose new pages the sidebar dots (recentNew below). */
export const NEW_SINCE = "2026-10";

let marksCache: ReleaseMarks | null = null;

/** The doc slugs the latest release marks: Updated for its Updated and
 *  Breaking entries (a page it lists as New is not also Updated), plus the
 *  pages listed ahead of the next release. Only the ahead pages get a New
 *  dot or badge (useReleaseMarks in lib/changelog/marks.tsx), so New means
 *  landed this month. Read once per server in production, where release
 *  files only change with a deploy; every request in development, so an
 *  edited release shows. */
export function latestMarks(files: ChangelogFiles = CHANGELOG_FILES, ahead = AHEAD_OF_RELEASE): ReleaseMarks {
  if (marksCache && import.meta.env.PROD) return marksCache;
  let marks: ReleaseMarks = { updated: [], ahead: [] };
  try {
    const latest = loadReleases(files)[0];
    const pending = ahead.filter((a) => !latest || a.month > latest.month).flatMap((a) => a.slugs);
    if (latest) {
      const slugs = (kinds: ChangeKind[]) =>
        releaseEntries(latest)
          .filter((e) => kinds.includes(e.kind))
          .map((e) => (e.href ? /^\/docs\/([^/#?]+)/.exec(e.href)?.[1] : undefined))
          .filter((slug): slug is string => !!slug);
      const added = slugs(["new"]);
      marks = {
        updated: slugs(["updated", "breaking"]).filter((s) => !added.includes(s) && !pending.includes(s)),
        ahead: pending,
      };
    } else marks = { updated: [], ahead: pending };
  } catch (error) {
    // Every route's layout calls this: a missing or malformed release
    // costs the site its markers, never the page, and logs once per server.
    // tests/changelog.test.ts still fails the build on a malformed file.
    console.error("[changelog] New and Updated markers skipped:", error);
  }
  marksCache = marks;
  return marks;
}

let recentCache: string[] | null = null;

/** Every docs page added since NEW_SINCE: the New entries of each release
 *  from that month on, plus the pages listed ahead of a release. The sidebar
 *  dots these, so a page stays marked past its own release; the New badges
 *  elsewhere keep the narrower latestMarks().ahead. */
export function recentNew(
  files: ChangelogFiles = CHANGELOG_FILES,
  since = NEW_SINCE,
  ahead = AHEAD_OF_RELEASE
): string[] {
  if (recentCache && import.meta.env.PROD) return recentCache;
  const slugs = new Set<string>();
  try {
    for (const release of loadReleases(files)) {
      if (release.month < since) continue;
      for (const e of releaseEntries(release)) {
        const slug = e.kind === "new" && e.href ? /^\/docs\/([^/#?]+)/.exec(e.href)?.[1] : undefined;
        if (slug) slugs.add(slug);
      }
    }
  } catch (error) {
    console.error("[changelog] Recent New dots skipped:", error);
  }
  for (const a of ahead) if (a.month >= since) a.slugs.forEach((slug) => slugs.add(slug));
  recentCache = [...slugs];
  return recentCache;
}
