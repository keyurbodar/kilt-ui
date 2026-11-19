import { Composer } from "@/registry/kilt/app/components/composer";
import { DiffCards } from "@/registry/kilt/app/components/diff-cards";
import { ModelPicker } from "@/registry/kilt/app/components/model-picker";
import type { Metadata } from "@/lib/metadata";

export const metadata: Metadata = { title: "System — Kilt" };

export default function KiltSystemPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="text-site-body text-muted-foreground">Kilt</p>
        <h1 className="text-display">System</h1>
        <p className="text-site-body text-muted-foreground">
          The CDS application layer: the composer with slash commands, @ mentions and attachments, the model and
          effort picker, and diff cards.
        </p>
      </header>
      <section className="kilt-app dark flex flex-col gap-4 rounded-xl bg-background p-6 text-foreground">
        <Composer onSubmit={() => true} leftControls={<ModelPicker compact />} />
      </section>
      <section className="kilt-app dark rounded-xl bg-background p-6 text-foreground">
        <DiffCards />
      </section>
    </div>
  );
}
