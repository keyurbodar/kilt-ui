"use client";

import { notFound as routerNotFound, useParams as useRouteParams, useRouter as useTanstackRouter, useRouterState } from "@tanstack/react-router";
import { type AnchorHTMLAttributes, type MouseEvent, useMemo } from "react";

/** The site's navigation surface over TanStack Router: a plain anchor that routes on an unmodified primary click. */
export function Link({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useTanstackRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const external = /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//");
    if (event.defaultPrevented || external || props.target === "_blank" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void router.navigate({ href });
  };
  return <a href={href} onClick={handleClick} {...props} />;
}

export function usePathname(): string {
  return useRouterState({ select: (s) => s.location.pathname });
}

export function useSearchParams(): URLSearchParams {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams(): Record<string, string> {
  return useRouteParams({ strict: false }) as Record<string, string>;
}

export function useRouter() {
  const router = useTanstackRouter();
  return useMemo(
    () => ({
      push: (href: string) => router.navigate({ href }),
      replace: (href: string, options?: { scroll?: boolean }) => router.navigate({ href, replace: true, resetScroll: options?.scroll ?? true }),
    }),
    [router]
  );
}

export function notFound(): never {
  throw routerNotFound();
}
