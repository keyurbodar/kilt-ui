/** Where the Kilt registry is served (Cloudflare Workers). */
export const KILT_SITE_URL = process.env.NEXT_PUBLIC_KILT_SITE_URL ?? "https://kilt-ui.keyurbodar18.workers.dev";

export const kiltInstallUrl = (slug: string) => `${KILT_SITE_URL}/r/kilt-${slug}.json`;

export const kiltInstallCommand = (slug: string) => `npx shadcn@latest add ${kiltInstallUrl(slug)}`;

export function kiltInstallPrompt(name: string, slug: string) {
  return [
    `Install the Kilt ${name} component (Capy Design System on Base UI) into this project.`,
    "",
    `1. Run: ${kiltInstallCommand(slug)}`,
    "   It writes components/kilt/, pulls kilt-tokens and @base-ui/react, and needs the shadcn `utils` helper.",
    `2. Import it from "@/components/kilt/${slug}". Each component imports its own stylesheet and the typed tokens; do not restyle it with Tailwind classes.`,
    "3. Theme: add `dark` or `light` to <html> (or data-theme), and data-density=\"touch\" for touch sizes. Without either it follows the OS.",
    `Docs and live examples: ${KILT_SITE_URL}/kilt/${slug}`,
  ].join("\n");
}
