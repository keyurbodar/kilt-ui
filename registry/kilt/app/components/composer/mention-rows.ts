// Vendored from Kiki (components/composer/mention-rows.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { boostScore, matchFields, normalizeQuery } from "./fuzzy";
import type {
  MentionItem,
  MentionMenuState,
  MentionRow,
  MentionSource,
} from "./types";

export const EMPTY_MENTION_STATE: MentionMenuState = {
  rows: [],
  headers: new Map(),
  empty: null,
  loading: false,
  notice: null,
};

const MIXED_LIMIT = 12;
const PER_SOURCE_FLOOR = 2;
const SOURCE_LIMIT = 15;
const RECENT_HEADER = "Recent";
const UNMATCHED_SCORE = 150;
const EXACT_CODE_SCORE = 1001;

const isCodeQuery = (term: string) => /^(?:[a-z]{1,8}-\d+|#?\d+)$/.test(term);

const itemScore = (item: MentionItem, term: string) => {
  if (isCodeQuery(term)) {
    const head = item.label.toLowerCase().split(" ", 1)[0];
    if (head === term || head === `#${term}`) return EXACT_CODE_SCORE;
  }
  return matchFields([item.label, item.subtitle ?? ""], term)?.score;
};

const itemMatches = (item: MentionItem, term: string) =>
  normalizeQuery(term) === "" || itemScore(item, term) !== undefined;

const rankItems = (items: MentionItem[], term: string) =>
  items
    .map((item, index) => ({
      item,
      index,
      score:
        term.length === 0
          ? 0
          : boostScore(
              itemScore(item, term) ?? UNMATCHED_SCORE,
              item.boost ?? 0,
            ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((e) => e.item);

const filterAndRank = (items: MentionItem[], term: string) =>
  rankItems(
    items.filter((i) => itemMatches(i, term)),
    term,
  );

const sourceItems = (
  source: MentionSource,
  items: MentionItem[],
  term: string,
) => {
  const spaced = /\s/.test(term);
  if (source.ranked === true)
    return spaced ? items.filter((i) => itemMatches(i, term)) : items;
  return source.onQuery !== undefined && !spaced
    ? rankItems(items, term)
    : filterAndRank(items, term);
};

function categoryState(
  source: MentionSource,
  items: MentionItem[],
  term: string,
): MentionMenuState {
  const rows: MentionRow[] = sourceItems(source, items, term)
    .slice(0, SOURCE_LIMIT)
    .map((item) => ({ type: "item", item, source }));
  const failure = source.failure?.() ?? null;
  const sectioned =
    new Set(rows.map((r) => (r.type === "item" ? r.item.section : undefined)))
      .size > 1;
  const sectionOf = (row: MentionRow) =>
    sectioned && row.type === "item"
      ? (row.item.section ?? source.label)
      : source.label;
  const headers = new Map<number, string>();
  rows.forEach((row, index) => {
    const label = sectionOf(row);
    const prev = rows[index - 1];
    if (prev === undefined || label !== sectionOf(prev))
      headers.set(index, label);
  });
  return {
    rows,
    headers,
    empty:
      rows.length === 0
        ? (failure ?? `No ${source.label.toLowerCase()} found`)
        : null,
    loading: source.settling?.(term) ?? false,
    notice: (rows.length === 0 ? null : failure) ?? source.notice?.() ?? null,
  };
}

function mixedState(
  sources: MentionSource[],
  results: MentionItem[][],
  term: string,
): MentionMenuState {
  const categories: MentionRow[] = sources
    .filter((s) => matchFields([s.label], term) !== undefined)
    .map((source) => ({ type: "category", source }));
  const scored = sources
    .flatMap((source, sourceIndex) =>
      sourceItems(source, results[sourceIndex] ?? [], term).flatMap(
        (item, itemIndex) => {
          const score = itemScore(item, term);
          if (score === undefined && source.ranked !== true) return [];
          return [
            {
              item,
              source,
              score: boostScore(score ?? UNMATCHED_SCORE, item.boost ?? 0),
              sourceIndex,
              itemIndex,
            },
          ];
        },
      ),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.sourceIndex - b.sourceIndex ||
        a.itemIndex - b.itemIndex,
    );
  const perSource = new Map<number, number>();
  const floor = scored.filter((e) => {
    const seen = perSource.get(e.sourceIndex) ?? 0;
    perSource.set(e.sourceIndex, seen + 1);
    return seen < PER_SOURCE_FLOOR;
  });
  const floorSet = new Set(floor);
  const kept = new Set(
    [...floor, ...scored.filter((e) => !floorSet.has(e))].slice(0, MIXED_LIMIT),
  );
  const rows: MentionRow[] = [
    ...categories,
    ...scored
      .filter((e) => kept.has(e))
      .map((e) => ({ type: "item" as const, item: e.item, source: e.source })),
  ];
  return {
    rows,
    headers: new Map(),
    empty: rows.length === 0 ? "No matches" : null,
    loading: sources.some((s) => s.settling?.(term) ?? false),
    notice: null,
  };
}

export type RecentMention = {
  category: string;
  id: string;
  label: string;
  subtitle?: string;
};

export function resolveMentionState(
  sources: MentionSource[],
  category: string | null,
  rawTerm: string,
  recents: RecentMention[] = [],
): MentionMenuState | Promise<MentionMenuState> {
  const term = rawTerm.trim().toLowerCase();
  if (category !== null) {
    const source = sources.find((s) => s.category === category);
    if (!source) return EMPTY_MENTION_STATE;
    const result =
      term.length === 0
        ? (source.initial?.() ?? source.search(""))
        : source.search(term);
    return result instanceof Promise
      ? result.then((items) => categoryState(source, items, term))
      : categoryState(source, result, term);
  }
  if (term.length === 0) {
    const recentRows = recents.flatMap<MentionRow>((recent) => {
      const source = sources.find((s) => s.category === recent.category);
      if (source === undefined) return [];
      const known = source.lookup?.(recent.id);
      if (known === undefined && source.closed === true) return [];
      return [
        {
          type: "item",
          item: known ?? {
            kind: source.kind,
            id: recent.id,
            label: recent.label,
            subtitle: recent.subtitle,
          },
          source,
        },
      ];
    });
    return {
      rows: [
        ...recentRows,
        ...sources.map((source) => ({ type: "category" as const, source })),
      ],
      headers: new Map(recentRows.length > 0 ? [[0, RECENT_HEADER]] : []),
      empty: null,
      loading: false,
      notice: null,
    };
  }
  const results = sources.map((s) => s.search(term));
  return results.some((r) => r instanceof Promise)
    ? Promise.all(results.map((r) => Promise.resolve(r))).then((all) =>
        mixedState(sources, all, term),
      )
    : mixedState(sources, results as MentionItem[][], term);
}

const RECENTS_KEY = "capy:mention-recents";
const RECENTS_PER_ENTRY = 10;
const RECENTS_LIMIT = 39;
const RECENTS_SHOWN = 3;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type RecentEntry = RecentMention & { count: number; timestamps: number[] };

const recency = (age: number) =>
  age < 4 * HOUR
    ? 100
    : age < DAY
      ? 80
      : age < 3 * DAY
        ? 60
        : age < 7 * DAY
          ? 40
          : age < 30 * DAY
            ? 20
            : age < 90 * DAY
              ? 10
              : 0;

export const frecency = (entry: RecentEntry, now: number) =>
  (entry.count *
    entry.timestamps.reduce((sum, t) => sum + recency(now - t), 0)) /
  Math.max(entry.timestamps.length, 1);

const readRecents = (storage: Storage | undefined): RecentEntry[] => {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(RECENTS_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (e): e is RecentEntry =>
            typeof e === "object" &&
            e !== null &&
            typeof e.category === "string" &&
            typeof e.id === "string" &&
            typeof e.label === "string" &&
            typeof e.count === "number" &&
            Array.isArray(e.timestamps),
        )
      : [];
  } catch {
    return [];
  }
};

const defaultStorage = () =>
  typeof globalThis.localStorage === "undefined"
    ? undefined
    : globalThis.localStorage;

export function readMentionRecents(
  now: number,
  storage = defaultStorage(),
): RecentMention[] {
  return readRecents(storage)
    .map((entry) => ({ entry, score: frecency(entry, now) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RECENTS_SHOWN)
    .map(({ entry }) => ({
      category: entry.category,
      id: entry.id,
      label: entry.label,
      subtitle: entry.subtitle,
    }));
}

export function recordMentionRecent(
  category: string,
  item: Pick<MentionItem, "id" | "label" | "subtitle">,
  now: number,
  storage = defaultStorage(),
) {
  const entries = readRecents(storage);
  const existing = entries.find(
    (e) => e.category === category && e.id === item.id,
  );
  const next: RecentEntry = {
    category,
    id: item.id,
    label: item.label,
    subtitle: item.subtitle,
    count: (existing?.count ?? 0) + 1,
    timestamps: [now, ...(existing?.timestamps ?? [])].slice(
      0,
      RECENTS_PER_ENTRY,
    ),
  };
  const rest = entries
    .filter((e) => e !== existing)
    .filter((e) => frecency(e, now) > 0)
    .slice(0, RECENTS_LIMIT);
  try {
    storage?.setItem(RECENTS_KEY, JSON.stringify([next, ...rest]));
  } catch {}
}
