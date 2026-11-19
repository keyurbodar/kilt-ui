import type { Metadata } from "next";
import "@/registry/kilt/tokens.css";
import "@/registry/kilt/themes.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Kilt — Capy Design System on Base UI",
  description: "30 CDS components matched 1:1 to the Doop canvas, installable with the shadcn CLI.",
};

export default function KiltLayout({ children }: { children: React.ReactNode }) {
  return <div className="py-20 sm:py-28 w-full max-w-[760px] mx-auto mt-12 lg:mt-0 px-6">{children}</div>;
}
