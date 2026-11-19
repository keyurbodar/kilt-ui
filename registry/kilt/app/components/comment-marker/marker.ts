// Vendored from Kiki (components/comment-marker/marker.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import type {
  FindingConfidence,
  FindingSeverity,
} from "@/registry/kilt/app/components/finding-card/finding";

export type MarkerComment = {
  id: string;
  finding?: {
    kind: "issue" | "note";
    severity: FindingSeverity | null;
    confidence: FindingConfidence | null;
    summary: string;
  };
  author?: { name: string; avatar?: string };
};

export const markerTone = (comment: MarkerComment) =>
  comment.finding?.kind === "note" ? "note" : comment.finding?.severity;

export const markerLabel = (comment: MarkerComment) => {
  const { finding } = comment;
  if (finding === undefined)
    return `Comment by ${comment.author?.name ?? "GitHub user"}`;
  const level =
    finding.kind === "note" ? "note" : (finding.severity ?? "medium");
  const investigate =
    finding.confidence === "investigate" ? ", investigate" : "";
  return `Capy ${level}${investigate}: ${finding.summary}`;
};
