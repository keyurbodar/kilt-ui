// Vendored from Kiki (components/markdown-chips/references.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { Element, ElementContent, Root, RootContent, Text } from "hast";

/**
 * Reference detection ported from Capy's shared/markdown/chips.tsx and the
 * code/link parsers it imports. Everything here is pure so the markdown
 * pipeline can run it as a hast transform and tests can drive it directly.
 */

export type ChipKind =
  | "file"
  | "path"
  | "drive"
  | "pull"
  | "task"
  | "thread"
  | "issue";

export type CodeMatch =
  | { kind: "thread"; start: number; end: number; authored: string }
  | {
      kind: "task";
      start: number;
      end: number;
      authored: string;
      index: number;
    }
  | { kind: "pull"; start: number; end: number; authored: string };

const threadCodePattern = /[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-[1-9]\d*/g;
const taskPattern = /(?:Task|Subagent) ([1-9]\d*)/g;
const pullCodePattern = /[A-Za-z\d][\w.-]*(?:\/[\w.-]+)?#[1-9]\d*/g;
const isCodeStart = (char: string | undefined) =>
  char === undefined || !/[A-Za-z0-9_./@#-]/.test(char);
const isCodeEnd = (char: string | undefined) =>
  char === undefined || !/[A-Za-z0-9_/@#-]/.test(char);

/** Thread codes (XIN-12), Task/Subagent N and owner/repo#N in plain text. */
export function parseCodes(text: string, offset = 0): CodeMatch[] {
  const matches: CodeMatch[] = [];
  const scan = (
    pattern: RegExp,
    build: (value: string, start: number) => CodeMatch,
  ) => {
    pattern.lastIndex = 0;
    for (const m of text.matchAll(pattern)) {
      const value = m[0];
      if (
        isCodeStart(text[m.index - 1]) &&
        isCodeEnd(text[m.index + value.length])
      )
        matches.push(build(value, offset + m.index));
    }
  };
  scan(threadCodePattern, (value, start) => ({
    kind: "thread",
    start,
    end: start + value.length,
    authored: value,
  }));
  scan(taskPattern, (value, start) => ({
    kind: "task",
    start,
    end: start + value.length,
    authored: value,
    index: Number(value.slice(value.indexOf(" ") + 1)),
  }));
  scan(pullCodePattern, (value, start) => ({
    kind: "pull",
    start,
    end: start + value.length,
    authored: value,
  }));
  return matches.sort((a, b) => a.start - b.start);
}

const driveHrefPattern = /^drive:(?:\/\/([a-z][a-z\d-]*)\/)?(.+)$/i;

export type DriveReference = { location: string | undefined; path: string };

/** drive:path and drive://location/path references. */
export function parseDriveReference(href: string): DriveReference | undefined {
  const m = driveHrefPattern.exec(href);
  if (m === null) return;
  const path = (m[2] ?? "").replace(/^\/+/, "");
  if (path === "" || path.includes("..")) return;
  return { location: m[1]?.toLowerCase(), path };
}

const relativeFilePattern =
  /^([^/\s`:\\][^\s`:\\]*?)(?::([1-9]\d*))?(?::([1-9]\d*))?$/;
const paperPattern =
  /^https:\/\/app\.paper\.design\/(?:file|embed)\/([A-Za-z0-9_-]{8,255})(?:\/([A-Za-z0-9_-]{1,255}))?(?:[/?#].*)?$/;
const absoluteFilePattern =
  /^((?:~\/|\/(?!\/))[^\s?#`:\\]*\/[^\s?#`:\\/]+\.[a-z\d]{1,8})(?::([1-9]\d*))?(?::([1-9]\d*))?$/i;

export type LinkCandidate =
  | ({ kind: "drive"; href: string } & DriveReference)
  | {
      kind: "pull_request";
      href: string;
      repositoryFullName: string;
      number: number;
    }
  | { kind: "commit"; href: string; repositoryFullName: string; sha: string }
  | { kind: "paper"; href: string; fileId: string; pageId: string | undefined }
  | {
      kind: "file";
      href: string;
      path: string;
      line: number | undefined;
      column: number | undefined;
    };

const optionalNumber = (value: string | undefined) =>
  value === undefined ? undefined : Number(value);

/**
 * Classifies a link target (Capy's een + van). Capy also recognises its own
 * service-preview and preview-domain URLs; kiki has no preview hosts yet, so
 * those stay plain links.
 */
export function classifyHref(href: string): LinkCandidate | undefined {
  const drive = parseDriveReference(href);
  if (drive !== undefined) return { kind: "drive", href, ...drive };
  const pull =
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/([1-9]\d*)\/?$/i.exec(
      href,
    );
  if (pull !== null)
    return {
      kind: "pull_request",
      href,
      repositoryFullName: `${pull[1]}/${pull[2]}`,
      number: Number(pull[3]),
    };
  const commit =
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f\d]{7,64})\/?$/i.exec(
      href,
    );
  if (commit !== null)
    return {
      kind: "commit",
      href,
      repositoryFullName: `${commit[1]}/${commit[2]}`,
      sha: commit[3] ?? "",
    };
  const paper = paperPattern.exec(href);
  if (paper !== null)
    return { kind: "paper", href, fileId: paper[1] ?? "", pageId: paper[2] };
  const absolute = absoluteFilePattern.exec(href);
  if (absolute !== null)
    return {
      kind: "file",
      href,
      path: absolute[1] ?? href,
      line: optionalNumber(absolute[2]),
      column: optionalNumber(absolute[3]),
    };
  if (
    /^(?:[A-Za-z][A-Za-z\d+.-]*:\/\/|mailto:|data:|javascript:)/i.test(href) ||
    href.startsWith("/") ||
    href.includes("?")
  )
    return;
  const file = relativeFilePattern.exec(href.split("#", 1)[0] ?? "");
  if (file === null) return;
  return {
    kind: "file",
    href,
    path: file[1] ?? href,
    line: optionalNumber(file[2]),
    column: optionalNumber(file[3]),
  };
}

const textPatterns: ReadonlyArray<{
  kind: "file" | "drive" | "pull";
  pattern: RegExp;
}> = [
  {
    kind: "file",
    pattern:
      /(?:^|(?<=[\s([]))((?:~\/|\/(?!\/))?(?:[\w@.-]+\/)+[\w@.-]+\.[a-z\d]{1,8}(?::\d+(?::\d+)?)?)(?=[\s,.;)\]]|$)/g,
  },
  {
    kind: "drive",
    pattern:
      /(?:^|(?<=[\s([]))(drive:(?:\/\/[a-z][a-z\d-]*\/)?[\w@/-](?:[\w@./-]*[\w@/-])?)(?=[\s,.;:)\]]|$)/gi,
  },
  {
    kind: "pull",
    pattern:
      /(?:^|(?<=[\s([]))((?:[A-Za-z\d][\w.-]*(?:\/[\w.-]+)?)?#[1-9]\d*)(?=[\s,.;:)\]]|$)/g,
  },
];

const skippedParents = new Set(["code", "pre", "a", "script", "style"]);
const blockScopes = new Set([
  "p",
  "li",
  "td",
  "th",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);
const inlineCodePatterns = textPatterns.filter(
  (entry) => entry.kind === "file" || entry.kind === "drive",
);
const bareDirectoryPattern = /^(?:~\/|\/)?(?:[\w@.-]+\/)+[\w@.-]*$/;
const linkChipKinds = new Set([
  "pull_request",
  "commit",
  "file",
  "drive",
  "paper",
]);

export const chipElement = (
  kind: ChipKind,
  value: string,
  label?: string,
): Element => ({
  type: "element",
  tagName: "span",
  properties: { dataChip: kind, dataChipValue: value, dataChipLabel: label },
  children: [{ type: "text", value }],
});

type Segment = { kind: ChipKind; start: number; end: number; value: string };

/** Splits one text node into text and chip spans, or undefined when nothing matched. */
export function splitText(
  text: string,
  issuePrefix?: string,
): Array<Text | Element> | undefined {
  const segments: Segment[] = [];
  for (const { kind, pattern } of textPatterns) {
    pattern.lastIndex = 0;
    for (const m of text.matchAll(pattern)) {
      const value = m[1];
      if (value === undefined) continue;
      const start = m.index + m[0].indexOf(value);
      segments.push({ kind, start, end: start + value.length, value });
    }
  }
  for (const code of parseCodes(text)) {
    if (code.kind !== "task" && code.kind !== "thread") continue;
    const isIssue =
      code.kind === "thread" &&
      issuePrefix !== undefined &&
      code.authored.startsWith(`${issuePrefix}-`) &&
      /^\d+$/.test(code.authored.slice(issuePrefix.length + 1));
    segments.push({
      kind: isIssue ? "issue" : code.kind,
      start: code.start,
      end: code.end,
      value: code.authored,
    });
  }
  if (segments.length === 0) return;
  const out: Array<Text | Element> = [];
  let cursor = 0;
  for (const segment of segments.toSorted((a, b) => a.start - b.start)) {
    if (segment.start < cursor) continue;
    if (segment.start > cursor)
      out.push({ type: "text", value: text.slice(cursor, segment.start) });
    out.push(chipElement(segment.kind, segment.value));
    cursor = segment.end;
  }
  if (cursor < text.length)
    out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

function inlineCodeChip(code: Element): Element | undefined {
  const only = code.children.length === 1 ? code.children[0] : undefined;
  if (only?.type !== "text") return;
  for (const { kind, pattern } of inlineCodePatterns) {
    pattern.lastIndex = 0;
    const m = pattern.exec(only.value);
    pattern.lastIndex = 0;
    if (m?.[1] === only.value) return chipElement(kind, only.value);
  }
  return bareDirectoryPattern.test(only.value)
    ? chipElement("path", only.value)
    : undefined;
}

type Parent = Root | Element;

const isChipHost = (parent: Parent) =>
  parent.type === "element" &&
  (skippedParents.has(parent.tagName) ||
    Boolean(parent.properties.dataChip) ||
    parent.properties.dataMention !== undefined);

function walk(parent: Parent, issuePrefix: string | undefined) {
  const children = parent.children as Array<RootContent | ElementContent>;
  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (node === undefined) continue;
    if (node.type === "text") {
      if (isChipHost(parent)) continue;
      const parts = splitText(node.value, issuePrefix);
      if (parts === undefined) continue;
      children.splice(index, 1, ...parts);
      index += parts.length - 1;
      continue;
    }
    if (node.type !== "element") continue;
    if (node.tagName === "a" && typeof node.properties.href === "string") {
      const candidate = classifyHref(node.properties.href);
      if (candidate !== undefined && linkChipKinds.has(candidate.kind))
        node.properties.dataChip = candidate.kind;
    }
    // Anchors are never descended into: an authored link owns all of its
    // content, and a chip inside one would nest anchors.
    if (node.tagName === "a") continue;
    if (node.tagName === "code" && !isChipHost(parent)) {
      const chip = inlineCodeChip(node);
      if (chip !== undefined) {
        children[index] = chip;
        continue;
      }
    }
    if (node.properties.dataChip || node.properties.dataMention !== undefined)
      continue;
    walk(node, issuePrefix);
  }
}

/** Short #N pull refs inherit the repository of an earlier owner/repo#N in the same block. */
function inheritPullRepositories(parent: Parent, scope: { repo?: string }) {
  for (const node of parent.children) {
    if (node.type !== "element") continue;
    const kind = node.properties.dataChip;
    const value = node.properties.dataChipValue;
    if (kind === "pull" && typeof value === "string") {
      if (value.startsWith("#")) {
        if (scope.repo !== undefined) {
          node.properties.dataChipValue = `${scope.repo}${value}`;
          node.properties.dataChipLabel = value;
        }
      } else scope.repo = value.slice(0, value.lastIndexOf("#"));
    } else if (
      kind === "pull_request" &&
      typeof node.properties.href === "string"
    ) {
      const candidate = classifyHref(node.properties.href);
      if (candidate?.kind === "pull_request")
        scope.repo = candidate.repositoryFullName;
    } else
      inheritPullRepositories(node, blockScopes.has(node.tagName) ? {} : scope);
  }
}

export type ChipTransformOptions = {
  /** Thread codes with this prefix (the project's issue prefix) become issue chips. */
  issuePrefix?: string;
};

/** Builds the hast pass that marks chip-able references (Capy's chip detection). */
export function createChipTransform(options: ChipTransformOptions = {}) {
  return (tree: Root) => {
    walk(tree, options.issuePrefix);
    inheritPullRepositories(tree, {});
  };
}

export const chipTransform = createChipTransform();
