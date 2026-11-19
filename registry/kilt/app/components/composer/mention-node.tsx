// Vendored from Kiki (components/composer/mention-node.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";
import type { ReactNode } from "react";
import { MentionChip } from "@/registry/kilt/app/components/markdown-chips";
import type { ComposerMentionKind } from "./types";

export type SerializedMentionNode = Spread<
  { kind: ComposerMentionKind; id: string; label: string; text?: string },
  SerializedLexicalNode
>;

export const userMentionText = (userId: string) => `<@${userId}>`;

export class MentionNode extends DecoratorNode<ReactNode> {
  __kind: ComposerMentionKind;
  __id: string;
  __label: string;
  __text: string | undefined;

  static getType() {
    return "capy-mention";
  }

  static clone(node: MentionNode) {
    return new MentionNode(
      node.__kind,
      node.__id,
      node.__label,
      node.__text,
      node.__key,
    );
  }

  static importJSON(json: SerializedMentionNode) {
    return new MentionNode(json.kind, json.id, json.label, json.text);
  }

  constructor(
    kind: ComposerMentionKind,
    id: string,
    label: string,
    text?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__kind = kind;
    this.__id = id;
    this.__label = label;
    this.__text = text;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      kind: this.__kind,
      id: this.__id,
      label: this.__label,
      text: this.__text,
    };
  }

  createDOM() {
    return document.createElement("span");
  }

  updateDOM() {
    return false;
  }

  exportDOM() {
    const element = document.createElement("span");
    element.textContent = this.getTextContent();
    return { element };
  }

  getTextContent() {
    if (this.__text !== undefined) return this.__text;
    return this.__kind === "user"
      ? userMentionText(this.__id)
      : `@${this.__label}`;
  }

  isInline() {
    return true;
  }

  isKeyboardSelectable() {
    return true;
  }

  decorate() {
    return (
      <MentionChip
        kind={this.__kind}
        label={this.__label}
        data-mention-kind={this.__kind}
        data-mention-id={this.__id}
        title={this.__text}
      />
    );
  }
}

export const $createMentionNode = (
  kind: ComposerMentionKind,
  id: string,
  label: string,
  text?: string,
) => $applyNodeReplacement(new MentionNode(kind, id, label, text));

export const $isMentionNode = (
  node: LexicalNode | null | undefined,
): node is MentionNode => node instanceof MentionNode;

export class VoiceTranscriptNode extends TextNode {
  static getType() {
    return "voice-transcript";
  }

  static clone(node: VoiceTranscriptNode) {
    return new VoiceTranscriptNode(node.__text, node.__key);
  }

  static importJSON(json: SerializedTextNode) {
    return $applyNodeReplacement(new VoiceTranscriptNode(json.text));
  }

  exportJSON(): SerializedTextNode {
    return { ...super.exportJSON(), type: "voice-transcript" };
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }
}

export const $createVoiceTranscriptNode = (text: string) =>
  $applyNodeReplacement(new VoiceTranscriptNode(text));
