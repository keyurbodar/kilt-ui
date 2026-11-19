// Vendored from Kiki (components/composer/fuzzy.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
type Tier = "exact" | "prefix" | "word" | "substring" | "fuzzy";

export type FuzzyMatch = {
  tier: Tier;
  score: number;
  ranges: { start: number; end: number }[];
  field?: number;
};

const TIER_SCORE: Record<Tier, number> = {
  exact: 1000,
  prefix: 800,
  word: 600,
  substring: 400,
  fuzzy: 200,
};
const SECONDARY_WEIGHT = 0.5;
const BOOST_SCALE = 90;
const MAX_FUZZY_RUNS = 3;

export const normalizeQuery = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const isWordChar = (c: string | undefined) =>
  c !== undefined && /[\p{L}\p{N}]/u.test(c);

const isBoundary = (text: string, index: number) => {
  if (index === 0) return true;
  const prev = text[index - 1];
  const cur = text[index] ?? "";
  if (prev === undefined || !isWordChar(prev)) return true;
  if (/\p{Lu}/u.test(cur) && /\p{Ll}/u.test(prev)) return true;
  return /\p{N}/u.test(cur) !== /\p{N}/u.test(prev);
};

const indicesOf = (text: string, query: string) => {
  const out: number[] = [];
  for (let i = text.indexOf(query); i !== -1; i = text.indexOf(query, i + 1))
    out.push(i);
  return out;
};

const lengthBonus = (query: string, text: string, at: number) =>
  Math.round((query.length / Math.max(text.length, 1)) * 60) +
  Math.max(0, 20 - Math.min(at, 20));

const matchSingle = (
  original: string,
  lower: string,
  query: string,
): FuzzyMatch | undefined => {
  if (lower === query)
    return {
      tier: "exact",
      score: TIER_SCORE.exact,
      ranges: [{ start: 0, end: original.length }],
    };
  const hits = indicesOf(lower, query);
  const firstHit = hits[0];
  if (firstHit === undefined) return undefined;
  const boundary = hits.find((i) => isBoundary(original, i));
  const tier: Tier =
    firstHit === 0
      ? "prefix"
      : boundary === undefined
        ? query.length >= 2
          ? "substring"
          : "fuzzy"
        : "word";
  if (tier === "fuzzy") return undefined;
  const at = tier === "word" && boundary !== undefined ? boundary : firstHit;
  return {
    tier,
    score: TIER_SCORE[tier] + lengthBonus(query, original, at),
    ranges: [{ start: at, end: at + query.length }],
  };
};

const matchAcronym = (
  original: string,
  lower: string,
  query: string,
): FuzzyMatch | undefined => {
  if (query.length < 2 || query.includes(" ")) return undefined;
  const runs: { start: number; end: number }[] = [];
  let from = 0;
  let q = 0;
  while (q < query.length) {
    const ch = query[q] ?? "";
    let start = -1;
    for (
      let i = lower.indexOf(ch, from);
      i !== -1;
      i = lower.indexOf(ch, i + 1)
    )
      if (isBoundary(original, i)) {
        start = i;
        break;
      }
    if (start === -1) return undefined;
    let end = start;
    while (q < query.length && lower[end] === query[q]) {
      end += 1;
      q += 1;
    }
    runs.push({ start, end });
    if (runs.length > MAX_FUZZY_RUNS) return undefined;
    from = end;
  }
  if (
    runs.slice(0, -1).some((r) => r.end - r.start < 2) &&
    runs.some((r) => r.end - r.start > 1)
  )
    return undefined;
  return {
    tier: "fuzzy",
    score:
      TIER_SCORE.fuzzy +
      Math.max(0, 60 - runs.length * 15) +
      Math.round(lengthBonus(query, original, runs[0]?.start ?? 0) / 2),
    ranges: runs,
  };
};

const matchWords = (
  original: string,
  lower: string,
  query: string,
): FuzzyMatch | undefined => {
  const words = query.split(" ").filter((w) => w !== "");
  if (words.length < 2) return undefined;
  const parts = words.flatMap((w) => matchSingle(original, lower, w) ?? []);
  if (parts.length < words.length) return undefined;
  const tier: Tier = parts.some((p) => p.tier === "substring")
    ? "substring"
    : "word";
  return {
    tier,
    score: TIER_SCORE[tier] + Math.round(lengthBonus(query, original, 0) / 2),
    ranges: parts.flatMap((p) => p.ranges).sort((a, b) => a.start - b.start),
  };
};

export const matchText = (
  text: string,
  rawQuery: string,
): FuzzyMatch | undefined => {
  const query = normalizeQuery(rawQuery);
  if (query === "" || text === "") return undefined;
  const lower = text.toLowerCase();
  if (lower.length !== text.length)
    return lower.includes(query) ? matchText(lower, query) : undefined;
  return (
    matchSingle(text, lower, query) ??
    matchWords(text, lower, query) ??
    matchAcronym(text, lower, query)
  );
};

const matchAcrossFields = (
  fields: string[],
  rawQuery: string,
  primary: number,
): FuzzyMatch | undefined => {
  const words = normalizeQuery(rawQuery).split(" ");
  if (words.length < 2) return undefined;
  const found = words.map(
    (word) =>
      fields.flatMap((field, index) => {
        const m = matchText(field, word);
        return m === undefined || m.tier === "substring" || m.tier === "fuzzy"
          ? []
          : [{ field: index, match: m }];
      })[0],
  );
  if (found.some((f) => f === undefined)) return undefined;
  const hits = found as { field: number; match: FuzzyMatch }[];
  const field = Math.max(...hits.map((h) => h.field));
  return {
    tier: "word",
    score:
      field < primary
        ? TIER_SCORE.word
        : Math.round(TIER_SCORE.word * SECONDARY_WEIGHT),
    ranges: hits
      .filter((h) => h.field === field)
      .flatMap((h) => h.match.ranges),
    field,
  };
};

export const matchFields = (
  fields: string[],
  query: string,
  primary = 1,
): FuzzyMatch | undefined =>
  fields.reduce<FuzzyMatch | undefined>((best, field, index) => {
    const m = matchText(field, query);
    if (
      m === undefined ||
      (index >= primary && (m.tier === "substring" || m.tier === "fuzzy"))
    )
      return best;
    const score =
      index < primary ? m.score : Math.round(m.score * SECONDARY_WEIGHT);
    return best !== undefined && best.score >= score
      ? best
      : { ...m, score, field: index };
  }, undefined) ?? matchAcrossFields(fields, query, primary);

export const boostScore = (score: number, boost: number) =>
  score + Math.round(Math.min(Math.max(boost, 0), 1) * BOOST_SCALE);

export const matchesQuery = (fields: string[], query: string) =>
  normalizeQuery(query) === "" ||
  matchFields(fields, query, fields.length) !== undefined;

export const filterByQuery = <T>(
  items: readonly T[],
  fields: (item: T) => string[],
  query: string,
  primary = 1,
): T[] => {
  if (normalizeQuery(query) === "") return [...items];
  return items
    .flatMap((item, index) => {
      const m = matchFields(fields(item), query, primary);
      return m === undefined ? [] : [{ item, index, score: m.score }];
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((e) => e.item);
};
