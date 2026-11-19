// Vendored from Kiki (components/diff-tab/model.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export type DiffPair = { base: string; head: string };

export type PullRef = {
  id: string;
  orgId: string;
  repo: string;
  number: number;
  url: string;
  headSha: string;
  baseSha?: string;
  diffPair: DiffPair | null;
};

export type DiffFileKind = "added" | "modified" | "deleted" | "renamed";

export type DiffFile = {
  path: string;
  previousPath: string | null;
  kind: DiffFileKind;
  patch: string | null;
  additions: number | null;
  deletions: number | null;
  binary: boolean;
};

export type PullDiff = {
  baseSha: string;
  headSha: string;
  files: ReadonlyArray<DiffFile>;
  stale: boolean;
  truncated: number | null;
  unavailable: boolean;
};

type Fields = Readonly<Record<string, unknown>>;

const fieldsOf = (value: unknown): Fields =>
  typeof value === "object" && value !== null ? (value as Fields) : {};

export const stringField = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const numberField = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const fileKinds: ReadonlyArray<DiffFileKind> = [
  "added",
  "modified",
  "deleted",
  "renamed",
];

const kindOf = (value: unknown): DiffFileKind => {
  if (value === "removed") return "deleted";
  return fileKinds.find((kind) => kind === value) ?? "modified";
};

export const normalizeDiffFile = (value: unknown): DiffFile => {
  const raw = fieldsOf(value);
  return {
    path: stringField(raw.path) ?? "",
    previousPath: stringField(raw.previousPath),
    kind: kindOf(raw.kind ?? raw.status),
    patch: stringField(raw.patch) ?? stringField(raw.diff),
    additions: numberField(raw.additions),
    deletions: numberField(raw.deletions),
    binary: raw.binary === true,
  };
};

export const normalizePullDiff = (value: unknown): PullDiff | null => {
  if (value === null || value === undefined) return null;
  const raw = fieldsOf(value);
  const files = Array.isArray(raw.files) ? raw.files : [];
  return {
    baseSha: stringField(raw.baseSha) ?? "",
    headSha: stringField(raw.headSha) ?? "",
    files: files.map(normalizeDiffFile).filter((file) => file.path !== ""),
    stale: raw.stale === true,
    truncated: numberField(raw.truncated),
    unavailable: raw.unavailable === true,
  };
};

export const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

export const fileDomId = (path: string) =>
  `pull-diff-file-${encodeURIComponent(path)}`;
