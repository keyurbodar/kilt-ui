import { KILT_SITE_URL } from "@/lib/kilt/site";

type RobotsRule = { userAgent: string; allow?: string; disallow?: string };



// Training and bulk-scraping crawlers. Well-behaved bots honor this; abusive
// ones won't, so Vercel Firewall is the real enforcement.
// Agents fetching a page because a person asked (ChatGPT-User, Claude-User,
// Perplexity-User) and AI search indexes (OAI-SearchBot, Claude-SearchBot,
// PerplexityBot) stay allowed: they are how people find and use the docs,
// and /llms.txt exists for them.
const BLOCKED_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "FacebookBot",
  "meta-externalagent",
];

export function robots(): { rules: RobotsRule[]; sitemap: string; host: string } {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${KILT_SITE_URL}/sitemap.xml`,
    host: KILT_SITE_URL,
  };
}

/** robots() as the robots.txt the Worker serves. */
export function robotsTxt(): string {
  const { rules, sitemap, host } = robots();
  const groups = rules.map((r) => [`User-agent: ${r.userAgent}`, r.allow ? `Allow: ${r.allow}` : `Disallow: ${r.disallow}`].join("\n"));
  return `${groups.join("\n\n")}\n\nHost: ${host}\nSitemap: ${sitemap}\n`;
}
