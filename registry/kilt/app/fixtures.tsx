import { Icon } from "@/registry/kilt/app/primitives/icon";
import type { ComposerCommand } from "@/registry/kilt/app/components/composer";

const noop = () => {};

/** The slash menu from the Doop "mobile slash" frame, as sample data. */
export const sampleCommands: ComposerCommand[] = [
  { kind: "action", name: "plan", label: "Plan mode", icon: <Icon name="numbered-list" size="sm" />, run: noop },
  {
    kind: "picker",
    name: "model",
    label: "Model",
    icon: <Icon name="chat-bubbles" size="sm" />,
    items: [
      { id: "claude-opus-5.5", label: "Claude Opus 5.5", selected: true },
      { id: "claude-sonnet-5.5", label: "Claude Sonnet 5.5" },
      { id: "gpt-6-astra", label: "GPT-6 Astra" },
    ],
    select: noop,
    emptyLabel: "No models",
  },
  {
    kind: "picker",
    name: "reasoning",
    label: "Reasoning",
    icon: <Icon name="key-1" size="sm" />,
    items: ["Low", "Medium", "High"].map((label) => ({ id: label.toLowerCase(), label, selected: label === "Medium" })),
    select: noop,
    emptyLabel: "No levels",
  },
  { kind: "action", name: "fast", label: "Fast", icon: <Icon name="arrow-up" size="sm" />, run: noop },
  { kind: "action", name: "new", label: "New thread", icon: <Icon name="plus-medium" size="sm" />, run: noop },
  { kind: "action", name: "compact", label: "Compact", icon: <Icon name="list-bullets" size="sm" />, run: noop },
  { kind: "action", name: "side", label: "New side thread", icon: <Icon name="bubble-wide" size="sm" />, run: noop },
  { kind: "action", name: "fork", label: "Fork with full context", icon: <Icon name="square-behind-square-2" size="sm" />, run: noop },
];

import type { MentionItem, MentionSource } from "@/registry/kilt/app/components/composer";

const THREADS: MentionItem[] = [
  { kind: "thread", id: "xin-36", label: "Doop design thread", subtitle: "XIN-36" },
  { kind: "thread", id: "xin-41", label: "Ship the composer", subtitle: "XIN-41" },
];
const PEOPLE: MentionItem[] = [
  { kind: "user", id: "atlas", label: "Atlas", subtitle: "Captain" },
  { kind: "user", id: "bosun", label: "Bosun", subtitle: "Captain" },
];
const search = (items: MentionItem[]) => (term: string) =>
  items.filter((item) => item.label.toLowerCase().includes(term.toLowerCase()));

/** @-mention sources for the composer demos. */
export const sampleSources: MentionSource[] = [
  { category: "threads", kind: "thread", label: "Threads", icon: () => <Icon name="chat-bubbles" size="sm" />, search: search(THREADS), initial: () => THREADS },
  { category: "people", kind: "user", label: "People", icon: () => <Icon name="bubble-wide" size="sm" />, search: search(PEOPLE), initial: () => PEOPLE },
];
