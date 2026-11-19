// Vendored from Kiki (components/composer/command-rows.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { SKILLS_COMMAND } from "./command-menu";
import { filterByQuery, matchesQuery } from "./fuzzy";
import type {
  CommandRow,
  ComposerCommand,
  MentionItem,
  MentionSource,
} from "./types";

const SKILL_PREVIEW_LIMIT = 6;
const SKILL_LIST_LIMIT = 15;
const PICKER_LIMIT = 15;

export type PickerCommand = Extract<ComposerCommand, { kind: "picker" }>;

export function resolveCommandRows({
  commands,
  picker,
  skills,
  skillsMode,
  skillItems,
  term,
}: {
  commands: ComposerCommand[];
  picker: PickerCommand | undefined;
  skills: MentionSource | undefined;
  skillsMode: boolean;
  skillItems: MentionItem[];
  term: string;
}): { rows: CommandRow[]; headers: Map<number, string> } {
  if (skillsMode && skills !== undefined)
    return {
      rows: [
        { type: "back" },
        ...skillItems
          .slice(0, SKILL_LIST_LIMIT)
          .map((item) => ({ type: "skill" as const, source: skills, item })),
      ],
      headers: new Map(),
    };
  if (picker !== undefined) {
    const grouped =
      term === "" && picker.items.some((i) => i.group !== undefined);
    const items = grouped
      ? picker.items
      : filterByQuery(
          picker.items,
          (i) => [i.label, i.id, ...(i.searchTerms ?? [])],
          term,
          2,
        ).slice(0, PICKER_LIMIT);
    return {
      rows: [
        { type: "back" },
        ...items.map((item) => ({
          type: "item" as const,
          command: picker,
          item,
        })),
      ],
      headers: new Map(
        grouped
          ? items.flatMap((item, index) =>
              item.group !== undefined && item.group !== items[index - 1]?.group
                ? [[index + 1, item.group] as [number, string]]
                : [],
            )
          : [],
      ),
    };
  }
  const rows: CommandRow[] = filterByQuery(
    commands,
    (c) => [c.name, c.label, ...(c.aliases ?? []), ...(c.searchTerms ?? [])],
    term,
    2,
  ).map((command) => ({ type: "command", command }));
  if (skills === undefined) return { rows, headers: new Map() };
  if (matchesQuery([SKILLS_COMMAND, skills.label], term))
    rows.push({ type: "skills", source: skills });
  const preview =
    term === ""
      ? []
      : skillItems
          .slice(0, SKILL_PREVIEW_LIMIT)
          .map((item) => ({ type: "skill" as const, source: skills, item }));
  return {
    rows: [...rows, ...preview],
    headers: new Map(preview.length > 0 ? [[rows.length, skills.label]] : []),
  };
}

export function commandEmptyLabel(
  rows: CommandRow[],
  open: boolean,
  skillsMode: boolean,
  picker: PickerCommand | undefined,
) {
  if (rows.some((r) => r.type !== "back") || !open) return null;
  if (skillsMode) return "No skills found";
  return picker === undefined ? "No commands found" : picker.emptyLabel;
}
