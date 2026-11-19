import { notFound } from "next/navigation";
import { kiltCatalog } from "@/lib/kilt/catalog.gen";
import { KiltDocPage } from "./kilt-doc-page";

export function generateStaticParams() {
  return kiltCatalog.map((c) => ({ slug: c.slug }));
}

export default async function KiltComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = kiltCatalog.find((c) => c.slug === slug);
  if (!entry) notFound();
  return <KiltDocPage entry={entry} />;
}
