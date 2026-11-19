// Vendored from Kiki (components/model-picker/provider-icon.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { CapyMark } from "@/registry/kilt/app/components/capy-logo";
import { providerMarks } from "./provider-marks";

export type ProviderIconProps = { provider: string; className?: string };

export function ProviderIcon({ provider, className }: ProviderIconProps) {
  if (provider === "capy") return <CapyMark className={className} />;
  const mark = providerMarks[provider];
  if (mark === undefined)
    return (
      <span
        className={[
          "flex size-(--icon-base) items-center justify-center rounded-(--radius-inner) bg-popover-hover text-2xs font-medium text-muted-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {provider.charAt(0).toUpperCase()}
      </span>
    );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={mark.svg.viewBox}
      fill={mark.svg.fill}
      fillRule={mark.svg.fillRule}
      className={className ?? "size-(--icon-base)"}
    >
      <title>{mark.title}</title>
      {mark.body}
    </svg>
  );
}
