import { Hono } from "hono";
import { prefersMarkdown } from "@/lib/accept";
import { entryInstall } from "@/lib/changelog/install";
import { loadReleases } from "@/lib/changelog/load";
import { releasesToMarkdown } from "@/lib/changelog/markdown";
import { componentList, systemNavList, UNLISTED_SLUGS } from "@/lib/docs/components";
import { docMarkdown, llmsFullTxt, llmsTxt } from "@/lib/docs/markdown";
import { robotsTxt } from "@/lib/docs/robots";
import { getGitHubStars } from "@/lib/github-stars";
import { kiltCatalog } from "@/lib/kilt/catalog.gen";
import { KILT_SITE_URL } from "@/lib/kilt/site";
import { presetRoute } from "@/lib/preset/route";
import { starterRoute } from "@/lib/starter/route";

type Env = { Bindings: { ASSETS: { fetch: (request: Request) => Promise<Response> } } };

const app = new Hono<Env>();

const text = (body: string, type: string, headers: Record<string, string> = {}) =>
  new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8`, ...headers } });

/** /docs and /docs/<slug> as Markdown: the .md URL, or the page URL asked for with Accept: text/markdown. */
function markdownPage(slug: string) {
  const body = slug === "index" ? llmsTxt() : docMarkdown(slug);
  if (body === null) return new Response("Not found\n", { status: 404 });
  const page = slug === "index" ? `${KILT_SITE_URL}/docs` : `${KILT_SITE_URL}/docs/${slug}`;
  return text(body, "text/markdown", { Vary: "Accept", Link: `<${page}>; rel="canonical"` });
}

const wantsMarkdown = (accept: string | undefined) => (accept ?? "").includes("text/markdown");

app.get("/api/stars", async () =>
  Response.json({ stars: await getGitHubStars() }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } })
);

for (const hover of ["fluid", "standard"] as const) {
  const prefix = hover === "standard" ? "/r/standard" : "/r";
  const preset = presetRoute(hover);
  const starter = starterRoute("starter", hover);
  const setup = starterRoute("setup", hover);
  app.get(`${prefix}/preset/:code`, (c) => preset(c.req.param("code")));
  app.get(`${prefix}/starter/:slug`, (c) => starter(c.req.param("slug")));
  app.get(`${prefix}/setup/:slug`, (c) => setup(c.req.param("slug")));
}

app.get("/r/use-proximity-hover.json", (c) => c.redirect("/r/use-fluid-hover.json", 308));
app.get("/r/tabs-subtle.json", (c) => c.redirect("/r/tabs.json", 308));
app.get("/r/:flavor{base|radix}/tabs-subtle.json", (c) => c.redirect(`/r/${c.req.param("flavor")}/tabs.json`, 308));
app.get("/docs/tabs-subtle", (c) => c.redirect("/docs/tabs", 308));
app.get("/docs/tabs-subtle.md", (c) => c.redirect("/docs/tabs.md", 308));
app.get("/skill", (c) => c.redirect("/docs/skill", 307));

app.get("/llms.txt", () => text(llmsTxt(), "text/plain"));
app.get("/llms-full.txt", () => text(llmsFullTxt(), "text/plain"));
app.get("/docs.md", () => markdownPage("index"));
app.get("/changelog.md", () => text(releasesToMarkdown(loadReleases(), entryInstall), "text/markdown"));

app.get("/docs/:page", async (c, next) => {
  const page = c.req.param("page");
  if (page.endsWith(".md")) return markdownPage(page.slice(0, -3));
  if (wantsMarkdown(c.req.header("accept"))) return markdownPage(page);
  await next();
});
app.get("/docs", async (c, next) => {
  if (wantsMarkdown(c.req.header("accept"))) return markdownPage("index");
  await next();
});
app.get("/changelog", async (c, next) => {
  if (prefersMarkdown(c.req.header("accept") ?? "")) {
    return text(releasesToMarkdown(loadReleases(), entryInstall), "text/markdown", { Vary: "Accept" });
  }
  await next();
  c.res.headers.set("Vary", "Accept");
});

app.get("/robots.txt", () => text(robotsTxt(), "text/plain"));
app.get("/sitemap.xml", () => {
  const docs = [...systemNavList, ...componentList].filter((e) => !UNLISTED_SLUGS.has(e.slug)).map((e) => `/docs/${e.slug}`);
  const routes = ["/", "/docs", "/changelog", "/kilt", ...kiltCatalog.map((e) => `/kilt/${e.slug}`), ...docs];
  const urls = routes.map((r) => `  <url><loc>${KILT_SITE_URL}${r}</loc></url>`).join("\n");
  return text(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "application/xml");
});

app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
