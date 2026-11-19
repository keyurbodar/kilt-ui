// Vendored from Kiki (components/suggestion-block/patch.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
export type HunkRow = {
  marker: "+" | "-" | " ";
  text: string;
  oldNo: number;
  newNo: number;
};

export const parseHunkRows = (patch: string): HunkRow[] => {
  let oldNo = 0;
  let newNo = 0;
  let inHunk = false;
  const rows: HunkRow[] = [];
  for (const line of patch.split("\n")) {
    if (line.startsWith("@@")) {
      const match = /^@@ -(\d+)[^+]*\+(\d+)/.exec(line);
      if (match === null) continue;
      oldNo = Number(match[1]) - 1;
      newNo = Number(match[2]) - 1;
      inHunk = true;
      continue;
    }
    if (
      !inHunk ||
      line.startsWith("+++") ||
      line.startsWith("---") ||
      line.startsWith("\\")
    )
      continue;
    if (line.startsWith("+")) {
      newNo += 1;
      rows.push({ marker: "+", text: line.slice(1), oldNo, newNo });
    } else if (line.startsWith("-")) {
      oldNo += 1;
      rows.push({ marker: "-", text: line.slice(1), oldNo, newNo });
    } else {
      oldNo += 1;
      newNo += 1;
      rows.push({ marker: " ", text: line.slice(1), oldNo, newNo });
    }
  }
  return rows;
};

export const buildPatch = (
  file: string,
  rows: ReadonlyArray<HunkRow>,
): string | null => {
  const first = rows[0];
  if (first === undefined) return null;
  const oldCount = rows.filter((row) => row.marker !== "+").length;
  const newCount = rows.filter((row) => row.marker !== "-").length;
  const oldStart = first.marker === "+" ? first.oldNo + 1 : first.oldNo;
  const newStart = first.marker === "-" ? first.newNo + 1 : first.newNo;
  const body = rows
    .map((row) => `${row.marker === " " ? " " : row.marker}${row.text}`)
    .join("\n");
  return `diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n@@ -${oldStart},${oldCount} +${newStart},${newCount} @@\n${body}\n`;
};

export const originalLines = (
  rows: ReadonlyArray<HunkRow>,
  start: number,
  end: number,
): string[] | null => {
  const lines = rows.filter(
    (row) => row.marker !== "-" && row.newNo >= start && row.newNo <= end,
  );
  return lines.length === end - start + 1 ? lines.map((row) => row.text) : null;
};

export const suggestionRows = (
  code: string,
  original: ReadonlyArray<string> | null,
  startLine: number,
): HunkRow[] => [
  ...(original ?? []).map(
    (text, index): HunkRow => ({
      marker: "-",
      text,
      oldNo: startLine + index,
      newNo: startLine - 1,
    }),
  ),
  ...code.split("\n").map(
    (text, index): HunkRow => ({
      marker: "+",
      text,
      oldNo: startLine - 1 + (original?.length ?? 0),
      newNo: startLine + index,
    }),
  ),
];

export const anchorRows = (
  rows: ReadonlyArray<HunkRow>,
  line: number,
): HunkRow[] => {
  const index = rows.findLastIndex(
    (row) => row.marker !== "-" && row.newNo === line,
  );
  const slice = rows.slice(Math.max(0, index - 3), index + 1);
  while (
    slice.length > 1 &&
    slice[0] !== undefined &&
    slice[0].text.trim() === ""
  )
    slice.shift();
  return slice;
};
