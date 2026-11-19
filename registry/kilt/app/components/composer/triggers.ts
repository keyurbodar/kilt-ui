// Vendored from Kiki (components/composer/triggers.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
const MENTION_TRIGGER =
  /(?:^|[\s([{])@(?:([a-z-]+):)?((?:[^\s@:]+(?: [^\s@:]*){0,2})?)$/;

const SHORTHAND_TRIGGERS = [
  { category: "skills", pattern: /(?:^|[\s([{])\$([^\s@:$#]*)$/ },
  { category: "channels", pattern: /(?:^|[\s([{])#([^\s@:$#]*)$/ },
];

const COMMAND_TRIGGER = /(?:^|[\s([{])\/(?:([a-z-]+):)?([^\s/:]*)$/;

export type MentionTrigger = {
  start: number;
  category: string | null;
  term: string;
  length: number;
  shorthand: boolean;
};

export type CommandTrigger = {
  start: number;
  command: string | null;
  term: string;
};

export function findMentionTrigger(
  textBeforeCaret: string,
  categories: readonly string[],
): MentionTrigger | null {
  const match = MENTION_TRIGGER.exec(textBeforeCaret);
  if (match) {
    const category = match[1] ?? null;
    const term = match[2] ?? "";
    if (category !== null && !categories.includes(category)) return null;
    const length =
      1 + (category === null ? 0 : category.length + 1) + term.length;
    return {
      start: textBeforeCaret.length - length,
      category,
      term,
      length,
      shorthand: false,
    };
  }
  for (const { category, pattern } of SHORTHAND_TRIGGERS) {
    if (!categories.includes(category)) continue;
    const short = pattern.exec(textBeforeCaret);
    if (!short) continue;
    const term = short[1] ?? "";
    return {
      start: textBeforeCaret.length - 1 - term.length,
      category,
      term,
      length: 1 + term.length,
      shorthand: true,
    };
  }
  return null;
}

export function findCommandTrigger(
  textBeforeCaret: string,
  commands: readonly string[],
): CommandTrigger | null {
  const match = COMMAND_TRIGGER.exec(textBeforeCaret);
  if (!match) return null;
  const command = match[1] ?? null;
  const term = match[2] ?? "";
  if (command !== null && !commands.includes(command)) return null;
  const length = 1 + (command === null ? 0 : command.length + 1) + term.length;
  return { start: textBeforeCaret.length - length, command, term };
}

export const commandTriggerLength = (trigger: CommandTrigger) =>
  1 +
  (trigger.command === null ? 0 : trigger.command.length + 1) +
  trigger.term.length;

export const mentionTriggerKey = (trigger: MentionTrigger) =>
  `${trigger.start}:${trigger.category ?? ""}`;

export const commandTriggerKey = (trigger: CommandTrigger) =>
  `${trigger.start}:${trigger.command ?? ""}`;
