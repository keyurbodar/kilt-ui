// Copies Kiki app modules (and everything they import inside Kiki) into
// registry/kilt/app/, rewriting Kiki's `@/` alias to the vendored tree.
// Usage: node scripts/kilt/vendor-kiki.mjs <kiki-src> [--dry] <entry...>
// An entry is a path under kiki/src, e.g. components/composer/index.ts.
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const [src, ...rest] = process.argv.slice(2);
const dry = rest.includes("--dry");
const entries = rest.filter((a) => a !== "--dry");
const OUT = new URL("../../registry/kilt/app/", import.meta.url).pathname;
// Line edits to Kiki modules too large to override whole.
const ROUTER_LINK = (t) => t.replace('import { Link } from "@tanstack/react-router";', 'import { Link } from "@/lib/route-link";');
const PATCHES = {
  "components/markdown-chips/chips.tsx": ROUTER_LINK,
  "primitives/dot-grid-icon/dot-grid-icon.tsx": (t) =>
    t.replace(
      "for (const a of animations) paused ? a.pause() : a.play();",
      "for (const a of animations) {\n      if (paused) a.pause();\n      else a.play();\n    }",
    ),
  "components/markdown-chips/previews.tsx": ROUTER_LINK,
  "components/markdown-chips/context.tsx": (t) =>
    t.replace(
      'import type { IssuePriority, IssueStatus } from "@/data/api/schemas/issue";',
      'type IssueStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "canceled";\ntype IssuePriority = "urgent" | "high" | "normal" | "low";',
    ),
  "components/model-picker/model-picker.tsx": (t) =>
    t
      .replace(/import \{ useAtomValue \} from "@effect\/atom-react";\n/, "")
      .replace(/import \{ AsyncResult \} from "effect\/reactivity";\n/, "")
      .replace(/import \{ modelsAtom \} from "@\/data\/atoms\/models";\n/, 'import { sampleCatalog } from "./sample-catalog";\n')
      .replace(
        /  const result = useAtomValue\(modelsAtom\(orgId\)\);\n  if \(entries !== undefined\) return \{ entries, loading: false \};\n  return AsyncResult[\s\S]*?;\n/,
        "  void orgId;\n  return { entries: entries ?? sampleCatalog, loading: false };\n",
      ),
};
const patch = (file, text) => {
  const fix = PATCHES[relative(src, file)];
  if (fix === undefined) return text;
  const out = fix(text);
  if (out === text) throw new Error(`patch for ${relative(src, file)} no longer applies`);
  return out;
};
const read = (file) => patch(file, readFileSync(overrideOf(file) ?? file, "utf8"));
const overrideOf = (file) => {
  const o = join(OVERRIDES, relative(src, file));
  return existsSync(o) ? o : null;
};
// A file here replaces the Kiki module at the same path and cuts Kiki's
// app wiring (data atoms, the shell's key dispatcher) out of the closure.
const OVERRIDES = new URL("./kiki-overrides/", import.meta.url).pathname;
const EXT = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

const resolveFile = (base) => {
  for (const ext of EXT) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
    // Modules Kilt adds beside Kiki's resolve from the overrides tree.
    const o = join(OVERRIDES, relative(src, p));
    if (!relative(src, p).startsWith("..") && existsSync(o) && statSync(o).isFile()) return p;
  }
  return null;
};
const specifiers = (text) =>
  [...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"'\n]+)["']/g)].map((m) => m[1]);

const seen = new Set();
const parent = new Map();
const external = new Set();
const assets = new Set();
const queue = entries.map((e) => resolveFile(join(src, e)) ?? (console.error(`missing entry ${e}`), process.exit(1)));
while (queue.length) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  for (const spec of specifiers(read(file))) {
    const local = spec.startsWith("@/") ? join(src, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(file), spec) : null;
    if (local === null) {
      external.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
      continue;
    }
    const clean = local.replace(/\?[\w]+$/, "");
    if (/\.(svg|css|woff2|png|json)$/.test(clean)) { assets.add(clean); continue; }
    const hit = resolveFile(clean);
    if (hit) { if (!parent.has(hit)) parent.set(hit, file); queue.push(hit); }
    else console.error(`unresolved ${spec} in ${relative(src, file)}`);
  }
}
const files = [...seen].filter((f) => !/\.test\.tsx?$/.test(f)).sort();
console.log(`kiki vendor: ${files.length} modules, ${assets.size} assets`);
console.log(`packages: ${[...external].sort().join(" ")}`);
if (dry) {
  const area = (f) => relative(src, f).split("/").slice(0, 2).join("/");
  const edges = new Set();
  for (const [child, from] of parent) {
    if (/^(data|features|tokens|lib\/appearance)/.test(relative(src, child)) && !/^(data|features)/.test(relative(src, from)))
      edges.add(`${relative(src, from)} -> ${area(child)}`);
  }
  console.log([...edges].join("\n"));
  const byDir = {};
  for (const f of files) { const d = relative(src, f).split("/").slice(0, 2).join("/"); byDir[d] = (byDir[d] ?? 0) + 1; }
  console.log(Object.entries(byDir).map(([d, n]) => `${d}:${n}`).join(" "));
  process.exit(0);
}
for (const f of [...files, ...assets]) {
  const to = join(OUT, relative(src, f));
  mkdirSync(dirname(to), { recursive: true });
  if (assets.has(f)) { cpSync(f, to); continue; }
  const text = read(f).replace(/(["'])@\/([^"'\n]+)\1/g, (_, q, p) => `${q}@/registry/kilt/app/${p}${q}`);
  const origin = overrideOf(f) ? `Kilt override of Kiki ${relative(src, f)}` : `Vendored from Kiki (${relative(src, f)})`;
  writeFileSync(to, `// ${origin} by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.\n${text}`);
}
