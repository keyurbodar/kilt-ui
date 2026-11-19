// Vendored from Kiki (components/composer/payload.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  ORDERED_LIST,
  TEXT_FORMAT_TRANSFORMERS,
  type TextMatchTransformer,
  type Transformer,
  UNORDERED_LIST,
} from "@lexical/markdown";
import { $dfs } from "@lexical/utils";
import { $createTextNode, $isTextNode, type LexicalNode } from "lexical";
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from "./mention-node";
import type { ComposerMention, ComposerPayload } from "./types";

const placeholder = (key: string) => `\uE000${key}\uE000`;

const MENTION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [MentionNode],
  export: (node: LexicalNode) =>
    $isMentionNode(node)
      ? node.__text === undefined
        ? node.getTextContent()
        : placeholder(node.getKey())
      : null,
  importRegExp: /$^/,
  regExp: /$^/,
  replace: () => {},
  type: "text-match",
};

export const COMPOSER_TRANSFORMERS: Transformer[] = [
  ORDERED_LIST,
  UNORDERED_LIST,
  ...TEXT_FORMAT_TRANSFORMERS,
  MENTION_TRANSFORMER,
];

const INLINE_CODE = /(^|[^\\`])(`)((?:\\`|[^`\r\n])+?)(`)(?!`)/;

export const escapeOutsideCode = (text: string) => {
  let out = "";
  let rest = text;
  for (;;) {
    const match = INLINE_CODE.exec(rest);
    if (match === null) return out + rest.replace(/\\/g, "\\\\");
    const start = match.index + (match[1]?.length ?? 0);
    const end = match.index + match[0].length;
    out += rest.slice(0, start).replace(/\\/g, "\\\\") + rest.slice(start, end);
    rest = rest.slice(end);
  }
};

export const unescapeMarkdown = (text: string) =>
  text.replace(/\\([*_`~\\])|(`+)[^\r\n]*?\2/g, (whole, escaped) =>
    escaped === undefined ? whole : escaped,
  );

export const isPayloadEmpty = (payload: ComposerPayload | null | undefined) =>
  (payload?.text ?? "").trim().length === 0;

export const payloadSignature = (
  payload: ComposerPayload | null | undefined,
) =>
  payload === null || payload === undefined
    ? ""
    : JSON.stringify([
        payload.text,
        payload.mentions.map((m) => [m.kind, m.id, m.start]),
      ]);

export function $readPayload(): ComposerPayload {
  let text = unescapeMarkdown(
    $convertToMarkdownString(COMPOSER_TRANSFORMERS, undefined, true),
  );
  for (const { node } of $dfs()) {
    if (!$isMentionNode(node)) continue;
    const excerpt = node.__text;
    if (excerpt !== undefined)
      text = text.replace(placeholder(node.getKey()), () => excerpt);
  }
  const mentions: ComposerMention[] = [];
  let from = 0;
  for (const { node } of $dfs()) {
    if (!$isMentionNode(node)) continue;
    const content = node.getTextContent();
    const start = text.indexOf(content, from);
    if (start === -1) continue;
    mentions.push({
      kind: node.__kind,
      id: node.__id,
      label: node.__label,
      start,
      end: start + content.length,
      text: content,
    });
    from = start + content.length;
  }
  return { text, mentions, files: [] };
}

function $findText(needle: string, from: number) {
  let offset = 0;
  for (const { node } of $dfs()) {
    if ($isMentionNode(node)) {
      offset += node.getTextContent().length;
      continue;
    }
    if (!$isTextNode(node)) continue;
    const content = node.getTextContent();
    const at = content.indexOf(needle, Math.max(0, from - offset));
    if (at !== -1) return { node, start: at, end: offset + at + needle.length };
    offset += content.length;
  }
  return null;
}

export function $writePayload(payload: ComposerPayload) {
  const excerpts = payload.mentions
    .filter((m) => m.kind === "excerpt")
    .toSorted((a, b) => a.start - b.start);
  let seeded = "";
  let cursor = 0;
  for (const [index, mention] of excerpts.entries()) {
    const at =
      payload.text.slice(mention.start, mention.end) === mention.text
        ? mention.start
        : payload.text.indexOf(mention.text, cursor);
    if (at < cursor) continue;
    seeded += payload.text.slice(cursor, at) + placeholder(`seed-${index}`);
    cursor = at + mention.text.length;
  }
  seeded += payload.text.slice(cursor);
  $convertFromMarkdownString(
    escapeOutsideCode(seeded),
    COMPOSER_TRANSFORMERS,
    undefined,
    true,
  );
  let from = 0;
  for (const mention of payload.mentions) {
    const needle =
      mention.kind === "excerpt"
        ? placeholder(`seed-${excerpts.indexOf(mention)}`)
        : mention.text;
    const hit = $findText(needle, from);
    if (hit === null) continue;
    from = hit.end;
    if (mention.kind === "secret") continue;
    const parts = hit.node.splitText(hit.start, hit.start + needle.length);
    parts[hit.start === 0 ? 0 : 1]?.replace(
      $createMentionNode(
        mention.kind,
        mention.id,
        mention.label,
        mention.kind === "excerpt" ? mention.text : undefined,
      ),
    );
  }
}

export type MentionLine = {
  mention: Pick<ComposerMention, "kind" | "id" | "label"> & { text?: string };
  text: string;
};

export const mentionLinesPayload = (lines: MentionLine[]): ComposerPayload =>
  lines.reduce<ComposerPayload>(
    (acc, line) => {
      const prefix = acc.text === "" ? "" : `${acc.text}\n`;
      const token = line.mention.text ?? `@${line.mention.label}`;
      return {
        text: `${prefix}${token} ${line.text}`,
        mentions: [
          ...acc.mentions,
          {
            kind: line.mention.kind,
            id: line.mention.id,
            label: line.mention.label,
            start: prefix.length,
            end: prefix.length + token.length,
            text: token,
          },
        ],
        files: [],
      };
    },
    { text: "", mentions: [], files: [] },
  );

export const $createMentionText = (label: string) =>
  $createTextNode(`@${label}`).setMode("token");
