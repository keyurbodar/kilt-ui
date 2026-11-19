// Vendored from Kiki (components/composer/caret.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { $dfs } from "@lexical/utils";
import {
  $createRangeSelection,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
} from "lexical";

export function $caretOffset(domRange?: Range): number | null {
  let selection =
    domRange === undefined ? $getSelection() : $createRangeSelection();
  if (domRange !== undefined && $isRangeSelection(selection)) {
    selection.anchor.set("root", 0, "element");
    selection.applyDOMRange(domRange);
  }
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
  const probe = $createRangeSelection();
  probe.anchor.set("root", 0, "element");
  probe.focus.set(
    selection.anchor.key,
    selection.anchor.offset,
    selection.anchor.type,
  );
  selection = probe;
  return selection.getTextContent().length;
}

export function $restoreCaret(offset: number | null) {
  if (offset !== null) {
    let position = 0;
    let first = true;
    for (const { node } of $dfs()) {
      if ($isElementNode(node) && !node.isInline()) {
        if (!first) position++;
        first = !node.isEmpty();
        if (node.isEmpty() && offset === position) {
          node.select(0, 0);
          return;
        }
        continue;
      }
      first = false;
      if ($isElementNode(node)) continue;
      const end = position + node.getTextContentSize();
      if ($isTextNode(node) && offset >= position && offset <= end) {
        const selection = node.select(offset - position, offset - position);
        selection.setFormat(node.getFormat());
        selection.setStyle(node.getStyle());
        return;
      }
      if (!$isTextNode(node) && (offset === position || offset === end)) {
        const index = node.getIndexWithinParent() + Number(offset === end);
        node.getParentOrThrow().select(index, index);
        return;
      }
      position = end;
    }
  }
  const selection = $getRoot().selectEnd();
  const anchor = selection.anchor.getNode();
  if ($isTextNode(anchor)) {
    selection.setFormat(anchor.getFormat());
    selection.setStyle(anchor.getStyle());
  }
}
