/** A page's head: its title sets document.title on navigation; the rest is read by the Worker for crawlers. */
export interface Metadata {
  title?: string;
  description?: string;
  alternates?: { canonical?: string; types?: Record<string, string> };
  openGraph?: Record<string, unknown>;
  twitter?: Record<string, unknown>;
  robots?: Record<string, unknown> | string;
  [key: string]: unknown;
}
