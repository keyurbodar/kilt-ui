// Vendored from Kiki (primitives/responsive-menu/glyphs.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type { SVGProps } from "react";

type GlyphProps = Omit<SVGProps<SVGSVGElement>, "children">;

function Glyph({ d, ...props }: GlyphProps & { d: string }) {
  return (
    <svg
      aria-hidden
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckmarkGlyph(props: GlyphProps) {
  return <Glyph d="M5 12.75L10 19L19 5" {...props} />;
}

export function ChevronLeftSmallGlyph(props: GlyphProps) {
  return (
    <Glyph
      d="M13.3787 16L10.4393 13.0607C9.85355 12.4749 9.85355 11.5251 10.4393 10.9393L13.3787 8"
      {...props}
    />
  );
}

export function ChevronRightSmallGlyph(props: GlyphProps) {
  return (
    <Glyph
      d="M10 16L12.9393 13.0607C13.5251 12.4749 13.5251 11.5251 12.9393 10.9393L10 8"
      {...props}
    />
  );
}
