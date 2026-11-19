import { ActionButton, MessageActions, SessionRow, SuggestionOption, SuggestionPopup, Worklog, WorklogStep } from "@/registry/kilt/devin/transcript";
import type { Metadata } from "@/lib/metadata";

export const metadata: Metadata = { title: "Devin system — Kilt" };

const steps = [
  ["Thought for 7s", undefined],
  ["Ran bun run build", "12s"],
  ["Read registry/kilt/tokens.css", undefined],
  ["Searched app for data-slot", undefined],
  ["Edited registry/kilt/devin/devin.css", undefined],
] as const;

export default function KiltDevinPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="text-site-body text-muted-foreground">Kilt</p>
        <h1 className="text-display">Devin system</h1>
        <p className="text-site-body text-muted-foreground">
          Work log, message actions and composer suggestion menus, sized from app.devin.ai.
        </p>
      </header>
      <section className="flex w-[300px] flex-col gap-0.5 rounded-xl border p-3">
        <SessionRow title="Build Kilt UI library" meta="Working" working active />
        <SessionRow title="Fix registry drift" meta="Waiting for review" />
      </section>
      <section className="kilt-dv-turn flex flex-col gap-3 rounded-xl border p-6">
        <Worklog>
          {steps.map(([label, duration]) => (
            <WorklogStep key={label} duration={duration}>
              {label}
            </WorklogStep>
          ))}
        </Worklog>
        <MessageActions time="2:20 PM">
          <ActionButton aria-label="Copy">⧉</ActionButton>
          <ActionButton aria-label="Copy link">↗</ActionButton>
        </MessageActions>
      </section>
      <section className="rounded-xl border p-6">
        <SuggestionPopup group="Commands">
          <SuggestionOption highlighted>/btw</SuggestionOption>
          <SuggestionOption>/queue</SuggestionOption>
          <SuggestionOption>/scan</SuggestionOption>
        </SuggestionPopup>
      </section>
    </div>
  );
}
