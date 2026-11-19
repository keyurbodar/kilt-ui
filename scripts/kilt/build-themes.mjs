// Compiles Capy's colour themes into kilt tokens. Sources (vendored by
// scripts/kilt/vendor/): the 13 presets and the shared preset derivation from
// Capy's stylesheet, and the Explore theme palettes. Each theme becomes one
// [data-color-theme] block of light-dark() pairs over --kilt-color-* tokens, so
// it switches mode with the same color-scheme the CDS tokens use.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const VENDOR = join(ROOT, "scripts/kilt/vendor");
const OUT = join(ROOT, "registry/kilt");

const tokensCss = readFileSync(join(OUT, "tokens.css"), "utf8");
const colorTokens = new Set([...tokensCss.matchAll(/^@property --kilt-color-([\w-]+)/gm)].map((m) => m[1]));

const RENAME = { bg: "background", fg: "foreground", text: "foreground", "primary-text": "primary-foreground", "destructive-text": "destructive-foreground" };
const kiltName = (v) => RENAME[v] ?? v;
const mapValue = (value) => value.replace(/var\(--([\w-]+)\)/g, (m, v) => (colorTokens.has(kiltName(v)) ? `var(--kilt-color-${kiltName(v)})` : m));

function declarations(body) {
  const out = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const key = kiltName(name);
    if (colorTokens.has(key)) out[key] = mapValue(value.replace(/\s+/g, " ").trim());
  }
  return out;
}

function blocks(css) {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), decls: declarations(body) }));
}

const derive = { light: {}, dark: {} };
const presets = new Map();
for (const { sel, decls } of blocks(readFileSync(join(VENDOR, "default.css"), "utf8"))) {
  // The default theme's formulas (muted foregrounds, soft fills, washes) are
  // relative to --bg/--fg/--primary, so every preset inherits them.
  const formulas = Object.fromEntries(Object.entries(decls).filter(([, v]) => v.includes("var(")));
  if (sel.startsWith(":root")) derive.light = { ...formulas, ...derive.light };
  if (sel === ".dark") derive.dark = { ...formulas, ...derive.dark };
  if (sel === "[data-color-theme]:not(.dark)") Object.assign(derive.light, decls);
  if (sel === ".dark[data-color-theme]") Object.assign(derive.dark, decls);
}
for (const { sel, decls } of blocks(readFileSync(join(VENDOR, "presets.css"), "utf8"))) {
  const id = sel.match(/data-color-theme="([\w-]+)"/)?.[1];
  if (!id) continue;
  const theme = presets.get(id) ?? { light: {}, dark: {} };
  Object.assign(theme[sel.startsWith(".dark") ? "dark" : "light"], decls);
  presets.set(id, theme);
}

// Explore palettes: `const themeNLight = { "--bg": "#..." }` objects, bound to
// listing slugs by `slug: "..."` ... `theme: themeN`.
const explore = readFileSync(join(VENDOR, "explore-themes.ts"), "utf8");
const palettes = {};
for (const [, name, body] of explore.matchAll(/const (theme\d+(?:Light|Dark)) = \{([^}]*)\}/g)) {
  palettes[name] = declarations(body.replace(/"(--[\w-]+)":\s*"([^"]*)",?/g, "$1: $2;"));
}
const effects = {};
for (const [, n, effect] of explore.matchAll(/const theme(\d+): ThemeFixture = \{[\s\S]*?effect: "(\w+)"/g)) effects[n] = effect;
const wallpapers = new Set(readdirSync(join(ROOT, "public/kilt/wallpapers")).map((f) => f.replace(/\.\w+$/, "")));
const wallpaperFile = (slug) => readdirSync(join(ROOT, "public/kilt/wallpapers")).find((f) => f.replace(/\.\w+$/, "") === slug);
const listings = [...explore.matchAll(/slug: "([\w-]+)"[\s\S]*?theme: theme(\d+),/g)]
  .map(([, slug, n]) => ({ slug, n }))
  .filter(({ n }) => palettes[`theme${n}Light`] && palettes[`theme${n}Dark`]);

const CDS = {};
for (const [, name, value] of tokensCss.matchAll(/^\s*--kilt-color-([\w-]+):\s*light-dark\((.+)\);$/gm)) {
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (value[i] === "," && depth === 0) {
      CDS[name] = { light: value.slice(0, i).trim(), dark: value.slice(i + 1).trim() };
      break;
    }
  }
}

function themeBlock(id, theme) {
  const light = { ...derive.light, ...theme.light };
  const dark = { ...derive.dark, ...theme.dark };
  const keys = [...new Set([...Object.keys(light), ...Object.keys(dark)])].sort();
  const lines = keys.map((k) => {
    const l = light[k] ?? CDS[k]?.light;
    const d = dark[k] ?? CDS[k]?.dark;
    return `  --kilt-color-${k}: light-dark(${l}, ${d});`;
  });
  return `[data-color-theme="${id}"] {\n${lines.join("\n")}\n}`;
}

const title = (slug) => slug.replace(/-[a-z0-9]{6}$/, "").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const catalog = [{ id: "cds", label: "Capy", kind: "default" }];
const css = [];
for (const [id, theme] of presets) {
  css.push(themeBlock(id, theme));
  catalog.push({ id, label: title(id), kind: "preset" });
}
for (const { slug, n } of listings) {
  css.push(themeBlock(slug, { light: palettes[`theme${n}Light`], dark: palettes[`theme${n}Dark`] }));
  const file = wallpapers.has(slug) ? wallpaperFile(slug) : undefined;
  catalog.push({ id: slug, label: title(slug), kind: "explore", effect: effects[n] ?? "dither", ...(file ? { wallpaper: `/kilt/wallpapers/${file}` } : {}) });
}

writeFileSync(
  join(OUT, "themes.css"),
  `/* Generated by scripts/kilt/build-themes.mjs. Do not edit. */\n/* Set data-color-theme on <html> (or any subtree); no attribute is the CDS default. */\n\n${css.join("\n\n")}\n`
);
writeFileSync(
  join(OUT, "themes.ts"),
  `// Generated by scripts/kilt/build-themes.mjs. Do not edit.\n\nexport const kiltThemes = ${JSON.stringify(catalog, null, 2)} as const;\n\nexport type KiltTheme = (typeof kiltThemes)[number];\nexport type KiltThemeId = KiltTheme["id"];\n`
);
console.log(`kilt: ${presets.size} presets, ${listings.length} explore themes`);
