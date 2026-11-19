import type { AnchorHTMLAttributes } from "react";

export type RouteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** A route pattern such as `/thread/$threadId`; each `$name` reads from params. */
  to: string;
  params?: Record<string, string | number>;
};

/** A plain anchor for chip links, so the chips work under any router. */
export function Link({ to, params = {}, ...props }: RouteLinkProps) {
  const href = to.replace(/\$(\w+)/g, (_, name: string) => encodeURIComponent(String(params[name] ?? "")));
  return <a href={href} {...props} />;
}
