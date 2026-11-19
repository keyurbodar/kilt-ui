# Capy Design System (CDS) — Foundations

Source of truth: Capy's production stylesheet and bundle (captured live, Classic theme). Every value below is copied from Capy, not invented. Colours, type, radii, spacing, sizes, containers and breakpoints are **canvas tokens** — always write var(--token). This guide holds the values Doop has no token type for (elevation, motion, z-index, focus, keyframes) as ready-to-paste CSS, plus the rules every sheet follows.

## Themes
- default = **Classic dark** (bg #09090a, fg #ebebec, primary #21a388). This is what Capy ships for this account.
- light = **Classic light** (bg #f2f2f4, fg #1e1e20, primary #3b5de8): put data-doop-theme="light" on <html>.
- touch = mobile/coarse-pointer sizing (Capy's --responsive-* values below 768px): data-doop-theme="touch". Colours stay dark.
- Surfaces are derived from bg by mixing white (dark) in oklab: panel 5%, card 7%, card-hover 10%, popover 11%, muted 21.5%. Text tiers mix fg into bg in oklch: muted-fg-1 68%, -2 52%, -3 38%, icon-muted 40%.

## Paste this into every frame's <style> (non-token values)
```css
:root{
  /* elevation — dark (default) */
  --sh-plate: 0 .5px 1px 1px rgb(0 0 0 / .3);
  --sh-card: 0 0 0 1px rgb(0 0 0 / .3);
  --sh-row-open: none;
  --sh-overlay: 0 3px 8px rgb(0 0 0 / .13), 0 2px 5px rgb(0 0 0 / .13), 0 1px 1px rgb(0 0 0 / .13);
  --sh-composer: 0 3px 8px rgb(0 0 0 / .09), 0 2px 5px rgb(0 0 0 / .09), 0 1px 1px rgb(0 0 0 / .1);
  --sh-sheet: var(--sh-overlay);
  /* motion */
  --duration-fast: 150ms; --duration-base: 200ms; --duration-slow: 300ms; --duration-slower: 500ms;
  --ease-out-quint: cubic-bezier(.23, 1, .32, 1);
  --ease-out: cubic-bezier(0, 0, .2, 1);
  --ease-in-out: cubic-bezier(.4, 0, .2, 1);
  --default-transition: 150ms cubic-bezier(.4, 0, .2, 1);
  /* z-index scale */
  --z-table-lead: 1; --z-chat-row-lift: 1; --z-preview-guest: 5; --z-top-bar: 10; --z-tile-divider: 15;
  --z-drop-preview: 20; --z-sidebar: 50; --z-drawer: 350; --z-dialog: 500; --z-overlay-content: 550;
  --z-toast: 600; --z-tooltip: 700;
  --blur-xs: 4px; --blur-sm: 8px;
}
[data-doop-theme="light"]{
  --sh-plate: 0 1px 2px rgb(0 0 0 / .05);
  --sh-card: 0 0 0 .5px rgb(0 0 0 / .11);
  --sh-row-open: inset 0 0 0 1px rgb(0 0 0 / .08);
  --sh-overlay: 0 6px 18px rgb(0 0 0 / .03), 0 3px 9px rgb(0 0 0 / .04), 0 1px 1px rgb(0 0 0 / .05);
  --sh-composer: 0 4px 12px rgb(0 0 0 / .025), 0 2px 6px rgb(0 0 0 / .03), 0 1px 1px rgb(0 0 0 / .04);
  --sh-sheet: 0 9px 48px rgb(0 0 0 / .08), 0 6px 24px rgb(0 0 0 / .1), 0 1px 1px rgb(0 0 0 / .04);
}
@media (prefers-reduced-motion: reduce){ *{ animation-duration:1ms!important; transition-duration:1ms!important } }
```

## Type rules (pair size + line-height + tracking, never mix)
| Role | size | line-height | tracking | weight |
|---|---|---|---|---|
| 2xs (counts, kbd) | --text-2xs 11 | --leading-xs 1.3 | --tracking-normal | 450/500 |
| xs (meta, timestamps) | --text-xs 12 | --leading-xs 1.3 | --tracking-normal | 450 |
| sm (default UI) | --text-sm 13 | --leading-tight 1.25 | --tracking-snug | 450, labels 500 |
| markdown (chat body) | --text-markdown 13 | --leading-normal 1.5 | --tracking-snug | 450, strong 560 |
| base (composer, larger UI) | --text-base 14 | 1.5 (inherited) | --tracking-tight | 450 |
| lg (section titles) | --text-lg 18 | inherited | --tracking-tight | 560 |
| xl / 2xl (page titles) | 22 / 26 | inherited | --tracking-tight | 560 |
Body: font-family var(--font-sans); weights are 450 / 500 / 560 (not 400/600). -webkit-font-smoothing: antialiased. Mono (Geist Mono) for code, branches, SHAs, ids.

## Sizing & alignment
- Spacing is a 4px grid (--spacing). Allowed gaps: 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 48.
- Control heights: xs 24 (message actions), sm 28 (top bar icon buttons, tabs, menu rows), base 32 (buttons, inputs), lg 44. Palette rows 40.
- Icon sizes: xs 12, sm 14 (rows, menus), base 16 (toolbars), lg 18. An icon button is square: icon-base inside control-sm (28) or icon-sm inside control-xs (24).
- Borders are hairlines: 0.5px solid var(--color-border-1) (border-2 on inputs/buttons). Never 1px.
- Radii: inner 2 · kbd 3 · button/input/row/tab 6 · card/menu/popover/palette 8 · panel/pane 12 · pill full.
- Icons and text share a centre line; rows put the leading icon in a fixed 16px lane so icon columns align.

## Focus
- Ring: outline: 1px solid var(--focus-ring, var(--color-ring)); outline-offset: -1px (Capy .outline-ring-inset). Used by Button, Input, Textarea, interactive Card and Badge on :focus-visible. Solid accent/danger buttons set --focus-ring to their on-colour text.

## Motion (measured from Capy, frame by frame)
- Default transition: 150ms cubic-bezier(.4,0,.2,1) on colour/background/opacity (hover states).
- Overlays (menu, popover, select, preview card): transition opacity+scale 150ms --ease-out-quint from data-starting-style scale .97 / opacity 0; exit to scale .97 / opacity 0 in 120ms; transform-origin follows the trigger side. data-instant disables it.
- Command palette: overlay opacity 200ms --ease-out; panel opacity + scale .95→1, 200ms --ease-out-quint; close reverses.
- Dialog: same as palette.
- Tooltip: open delay ~350ms, fade ~150ms, exit ~110ms; moving between triggers re-opens instantly (no delay).
- Preview card (hover card): 350ms delay, scale .97→1 + fade ~150ms; widths 288 / 320 / 384.
- Left sidebar (240px): collapse ~150ms, expand ~200ms.
- Right pane: open = opacity 0→1 + translateX 4px→0, 150ms --ease-out-quint; close instant. Expand/restore panes: instant. Tab switch: instant. Pane divider (8px) follows the pointer with no easing.
- Toasts (Sonner): sonner-fade-in scale .8→1; swipe-out 200ms.
- Skeleton: skeleton-pulse 2.4s ease-in-out infinite (opacity 1→.55). Spinner: spin 1s linear infinite. Text shimmer: text-shimmer-sweep for "working" labels.
- Reduced motion: all transitions collapse.

## Keyframes (verbatim from Capy)
```css
@keyframes fade-in{0%{opacity:0}100%{opacity:1}}
@keyframes fade-out{0%{opacity:1}100%{opacity:0}}
@keyframes spin{100%{transform:rotate(360deg)}}
@keyframes pulse{50%{opacity:.5}}
@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes text-shimmer-sweep{0%{background-position:100% 0}100%{background-position:-100% 0}}
@keyframes shimmer-sweep{0%{transform:translate(0)}100%{transform:translate(50%)}}
@keyframes shimmer-surface-sweep{0%{background-position:100% 0}100%{background-position:-100% 0}}
@keyframes setup-guide-ripple{0%{box-shadow:0 0 0 0 color-mix(in oklch,var(--color-ring) 45%,transparent)}100%{box-shadow:0 0 0 14px color-mix(in oklch,var(--color-ring) 0%,transparent)}}
@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}
@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}
@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}
```

## Structure rules for every sheet
1. Use tokens only (var(--…)); a missing value becomes a token first.
2. Use components (<doop-use>) for anything in the system; never redraw a Button, Row, Tab, Menu, Badge.
3. Every sheet shows Classic dark first, then light (data-doop-theme="light") where colour matters, and touch where size matters.
4. Every component documents: anatomy, sizes, states (rest / hover / active / focus-visible / disabled / selected / loading), motion, and its Capy source (data-slot / file).
5. Brand: Capy name, logo and avatars are used as-is for now (to be swapped for Kiki later).

## Components (read before composing a frame)
- Every primitive, overlay and pattern is a linked Doop component on the Components page. Compose screens with <doop-use>, never redraw them.
- Frame CSS is not scoped and leaks into instances. Never style generic class names (.col, .row, .t, .ct, .hd, .ft) in a frame: prefix sheet classes (e.g. .pcol, .x-row).
- Primitives: Button, Badge, Kbd, Input, Textarea, Card, Checkbox, Switch, Menu Row, Menu Label, Menu Separator.
- Overlays: Menu, Popover, Preview Card, Tooltip, Dialog, Command Palette, Toast, Alert.
- Patterns: User Message, Agent Message, Message Footer, Activity Line, Composer, Sidebar Thread Row, Sidebar Section Header, Sidebar Mode Toggle, Project Chip.
- Variants and states are enum props (variant, intent, size, state…). Slots: Menu Row icon/keys, Card content/actions, Dialog body/actions, Popover/Preview Card content, Sidebar Thread Row chip.
