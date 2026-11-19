import { createRootRoute, createRoute, createRouter, lazyRouteComponent, type AnyRoute } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import type { Metadata } from "@/lib/metadata";
import NotFound from "@/app/not-found";
import { Root } from "./root";

type PageModule = { default: ComponentType; metadata?: Metadata };
type LayoutModule = { default: ComponentType<{ children: ReactNode }>; metadata?: Metadata };

// Every app/**/page.tsx is a route, as its directory spells it: [slug] is a
// param, (group) and _private segments are not part of the path.
const pages = import.meta.glob<PageModule>("/app/**/page.tsx");
// A layout.tsx wraps every page at or below its directory, outermost first.
const layouts = import.meta.glob<LayoutModule>("/app/**/layout.tsx");

function layoutsFor(file: string): (() => Promise<LayoutModule>)[] {
  const dirs = file.split("/").slice(1, -1);
  return dirs.flatMap((_, i) => layouts[`/${dirs.slice(0, i + 1).join("/")}/layout.tsx`] ?? []);
}

async function loadRoute(file: string, load: () => Promise<PageModule>) {
  const [page, ...wrappers] = await Promise.all([load(), ...layoutsFor(file).map((l) => l())]);
  const Page = page.default;
  function Composed() {
    return wrappers.reduceRight<ReactNode>((child, { default: Layout }) => <Layout>{child}</Layout>, <Page />);
  }
  const metadata = [page, ...wrappers.toReversed()].find((m) => m.metadata?.title !== undefined)?.metadata;
  return { default: Composed, metadata };
}

export function pagePath(file: string): string | null {
  const segments = file.replace(/^\/app/, "").replace(/\/page\.tsx$/, "").split("/").filter(Boolean);
  if (segments.some((s) => s.startsWith("_"))) return null;
  const path = segments
    .filter((s) => !/^\(.+\)$/.test(s))
    .map((s) => s.replace(/^\[(\w+)\]$/, "$$$1"))
    .join("/");
  return `/${path}`;
}

const SITE_TITLE = "Kilt";

const rootRoute = createRootRoute({ component: Root, notFoundComponent: NotFound });

const routes: AnyRoute[] = Object.entries(pages).flatMap(([file, load]) => {
  const path = pagePath(file);
  if (path === null) return [];
  return [
    createRoute({
      getParentRoute: () => rootRoute,
      path,
      component: lazyRouteComponent(() => loadRoute(file, load)),
      loader: async () => {
        const { metadata } = await loadRoute(file, load);
        document.title = typeof metadata?.title === "string" ? metadata.title : SITE_TITLE;
      },
    }),
  ];
});

export const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  defaultPreload: "intent",
  scrollRestoration: true,
});
