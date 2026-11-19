// Vendored from Kiki (components/finding-card/finding.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  type DiffFile,
  numberField,
  type PullDiff,
  stringField,
} from "@/registry/kilt/app/components/diff-tab/model";

export type FindingSeverity = "high" | "medium" | "low";
export type FindingStatus = "open" | "resolved" | "irrelevant";
export type FindingKind = "issue" | "note";
export type FindingConfidence = "confident" | "investigate";

export type FindingGithubAnchor = {
  file: string | null;
  line: number | null;
  startLine: number | null;
  side: "LEFT" | "RIGHT";
  headSha: string | null;
  outdated: boolean;
};

export type FindingMemory = { title: string };
export type FindingTelemetry = { window: string | null; note: string | null };
export type FindingRule = {
  body: string | null;
  file: { repo: string; path: string; covered: boolean } | null;
};

export type PullFinding = {
  id: string;
  kind: FindingKind;
  confidence: FindingConfidence | null;
  severity: FindingSeverity | null;
  status: FindingStatus;
  summary: string;
  detail: string | null;
  suggestion: string | null;
  statusReason: string | null;
  file: string | null;
  line: number | null;
  startLine: number | null;
  observingHeadSha: string | null;
  githubAnchor: FindingGithubAnchor | null;
  githubCommentId: string | null;
  githubDeliveryExpired: boolean;
  humanResolvedBy: string | null;
  createdAt: string;
  rule: FindingRule | null;
  memory: FindingMemory | null;
  telemetry: FindingTelemetry | null;
};

export type FindingAnchor = {
  file: string | null;
  line: number | null;
  startLine: number | null;
  side: "LEFT" | "RIGHT";
  outdated: boolean;
};

type Fields = Readonly<Record<string, unknown>>;

const fieldsOf = (value: unknown): Fields | null =>
  typeof value === "object" && value !== null ? (value as Fields) : null;

const pick = <T extends string>(
  value: unknown,
  options: ReadonlyArray<T>,
): T | null => options.find((option) => option === value) ?? null;

const normalizeAnchor = (value: unknown): FindingGithubAnchor | null => {
  const raw = fieldsOf(value);
  if (raw === null) return null;
  return {
    file: stringField(raw.file),
    line: numberField(raw.line),
    startLine: numberField(raw.startLine),
    side: raw.side === "LEFT" ? "LEFT" : "RIGHT",
    headSha: stringField(raw.headSha),
    outdated: raw.outdated === true,
  };
};

const normalizeRule = (value: unknown): FindingRule | null => {
  const raw = fieldsOf(value);
  if (raw === null) return null;
  const file = fieldsOf(raw.file);
  return {
    body: stringField(raw.body),
    file:
      file === null
        ? null
        : {
            repo: stringField(file.repo) ?? "",
            path: stringField(file.path) ?? "",
            covered: file.covered !== false,
          },
  };
};

export const normalizeFinding = (value: unknown): PullFinding | null => {
  const raw = fieldsOf(value);
  const id = raw === null ? null : stringField(raw.id);
  if (raw === null || id === null) return null;
  const memory = fieldsOf(raw.memory);
  const telemetry = fieldsOf(raw.telemetry);
  return {
    id,
    kind: raw.kind === "note" ? "note" : "issue",
    confidence: pick(raw.confidence, ["confident", "investigate"] as const),
    severity: pick(raw.severity, ["high", "medium", "low"] as const),
    status:
      pick(raw.status, ["open", "resolved", "irrelevant"] as const) ?? "open",
    summary: stringField(raw.summary) ?? stringField(raw.title) ?? "",
    detail: stringField(raw.detail) ?? stringField(raw.body),
    suggestion: stringField(raw.suggestion),
    statusReason: stringField(raw.statusReason),
    file: stringField(raw.file) ?? stringField(raw.path),
    line: numberField(raw.line),
    startLine: numberField(raw.startLine),
    observingHeadSha: stringField(raw.observingHeadSha),
    githubAnchor: normalizeAnchor(raw.githubAnchor),
    githubCommentId:
      stringField(raw.githubCommentId) ??
      (numberField(raw.githubCommentId) === null
        ? null
        : String(raw.githubCommentId)),
    githubDeliveryExpired: raw.githubDeliveryExpired === true,
    humanResolvedBy: stringField(raw.humanResolvedBy),
    createdAt: stringField(raw.createdAt) ?? "",
    rule: normalizeRule(raw.rule),
    memory: memory === null ? null : { title: stringField(memory.title) ?? "" },
    telemetry:
      telemetry === null
        ? null
        : {
            window: stringField(telemetry.window),
            note: stringField(telemetry.note),
          },
  };
};

export const normalizeFindings = (value: unknown): PullFinding[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const finding = normalizeFinding(item);
        return finding === null ? [] : [finding];
      })
    : [];

export const findingAnchor = (
  finding: PullFinding,
  head: string | undefined,
): FindingAnchor => {
  const source = finding.githubAnchor ?? finding;
  const outdated =
    (finding.githubAnchor?.outdated ?? false) ||
    (head !== undefined &&
      (finding.githubAnchor?.headSha ?? finding.observingHeadSha) !== head);
  return {
    file: source.file,
    line: outdated ? null : source.line,
    startLine: outdated ? null : source.startLine,
    side: finding.githubAnchor?.side ?? "RIGHT",
    outdated,
  };
};

export const lineLabel = (anchor: {
  line: number | null;
  startLine: number | null;
}) => {
  if (anchor.line === null) return null;
  if (anchor.startLine === null || anchor.startLine === anchor.line)
    return `Line ${anchor.line}`;
  return `Lines ${anchor.startLine}-${anchor.line}`;
};

export const findingLabel = (finding: PullFinding) => {
  if (finding.kind === "note") return "Note";
  if (finding.confidence === "investigate") return "Investigate";
  if (finding.severity === "high") return "High";
  if (finding.severity === "low") return "Low";
  return "Medium";
};

const severityRank: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const compareFindings = (a: PullFinding, b: PullFinding) =>
  (a.severity === null ? 3 : severityRank[a.severity]) -
  (b.severity === null ? 3 : severityRank[b.severity]);

export const findingTone = (finding: PullFinding) => {
  if (finding.kind === "note" || finding.confidence === "investigate")
    return "text-muted-foreground-2";
  if (finding.severity === "high") return "text-destructive";
  if (finding.severity === "medium") return "text-warning-fg";
  return "text-muted-foreground-1";
};

const promptSafe = (text: string) =>
  text
    .replace(/[ \t]+$/gm, "")
    .replace(/<\/(finding|suggested_code|file|diff_excerpt)\s*>/gi, "<\\/$1>");

const stripComments = (text: string) =>
  text.replace(/<!--[\s\S]*?(?:-->|$)/g, "").trim();

export const promptGuidance =
  "Line numbers are from the reviewed commit and may have moved. Fix with a minimal change and run the relevant checks. Adapt any suggested code to the current code.";

const patchFor = (finding: PullFinding, diff: PullDiff | null) => {
  const paths = new Set([finding.file, finding.githubAnchor?.file ?? null]);
  return diff?.files.find(
    (file: DiffFile) =>
      paths.has(file.path) ||
      (file.previousPath !== null && paths.has(file.previousPath)),
  )?.patch;
};

const diffExcerpt = (finding: PullFinding, diff: PullDiff | null) => {
  if (
    diff === null ||
    diff.unavailable ||
    diff.headSha !== finding.observingHeadSha ||
    finding.githubAnchor?.outdated
  )
    return "";
  const anchor =
    finding.githubAnchor?.headSha === diff.headSha
      ? finding.githubAnchor
      : finding;
  if (anchor.file === null || anchor.line === null) return "";
  const patch = patchFor(finding, diff);
  if (patch == null) return "";
  const start = anchor.startLine ?? anchor.line;
  const lines: string[] = [];
  let newNo = 0;
  for (const line of patch.split("\n")) {
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (header !== null) {
      newNo = Number(header[1]) - 1;
      continue;
    }
    if (line.startsWith("-")) continue;
    newNo += 1;
    if (newNo >= start && newNo <= anchor.line) lines.push(line.slice(1));
  }
  return lines.length === 0
    ? ""
    : `<diff_excerpt>\n${promptSafe(lines.join("\n"))}\n</diff_excerpt>`;
};

const findingBody = (finding: PullFinding, diff: PullDiff | null) =>
  [
    promptSafe(
      [stripComments(finding.summary), stripComments(finding.detail ?? "")]
        .filter(Boolean)
        .join("\n\n"),
    ),
    diffExcerpt(finding, diff),
  ]
    .filter(Boolean)
    .join("\n\n");

export const findingPrompt = (finding: PullFinding, diff: PullDiff | null) => {
  const label = lineLabel(finding);
  const where =
    finding.file === null
      ? ""
      : `In ${promptSafe(finding.file)}${label === null ? "" : `, ${label.toLowerCase()}`}:\n\n`;
  const suggestion =
    finding.suggestion === null
      ? ""
      : `\n\n<suggested_code>\n${promptSafe(finding.suggestion)}\n</suggested_code>`;
  return `Verify and fix the following finding if it still applies. If it no longer applies, say why and change nothing. ${promptGuidance}\n\n${where}<finding>\n${findingBody(finding, diff)}\n</finding>${suggestion}`;
};
