import { kiltCatalog } from "@/lib/kilt/catalog.gen";
import { notFound, useParams } from "@/lib/router";
import { KiltDocPage } from "./kilt-doc-page";

export default function KiltComponentPage() {
  const { slug } = useParams();
  const entry = kiltCatalog.find((c) => c.slug === slug);
  if (!entry) notFound();
  return <KiltDocPage entry={entry} />;
}
