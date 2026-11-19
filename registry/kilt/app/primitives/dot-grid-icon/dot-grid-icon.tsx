// Vendored from Kiki (primitives/dot-grid-icon/dot-grid-icon.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ComponentProps,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { onReducedMotionChange } from "@/registry/kilt/app/lib/motion";

export const dotGridIconVariants = cva("dot-grid shrink-0", {
  variants: {
    size: {
      xs: "size-(--icon-xs)",
      sm: "size-(--icon-sm)",
      base: "size-(--icon-base)",
      inherit: "",
    },
  },
  defaultVariants: { size: "base" },
});

export type DotGridIconState = "working" | "waiting" | "needs-you" | "failed";

export type DotGridIconProps = Omit<ComponentProps<"svg">, "ref"> &
  VariantProps<typeof dotGridIconVariants> & {
    ref?: Ref<SVGSVGElement>;
    state?: DotGridIconState;
    label?: string;
  };

type Keyframes = ReadonlyArray<readonly [offset: number, opacity: number]>;

const WORKING: Keyframes = [
  [0, 1],
  [0.125, 0.7],
  [0.25, 0.45],
  [0.375, 0.25],
  [0.875, 0.25],
  [1, 1],
];
const WAITING: Keyframes = [
  [0, 0.35],
  [0.5, 1],
  [1, 0.35],
];
const ATTENTION: readonly [Keyframes, Keyframes, Keyframes] = [
  [
    [0, 0.25],
    [0.18, 1],
    [0.7, 1],
    [1, 0.25],
  ],
  [
    [0, 0.25],
    [0.12, 0.25],
    [0.34, 1],
    [0.56, 1],
    [0.82, 0.25],
    [1, 0.25],
  ],
  [
    [0, 0.25],
    [0.24, 0.25],
    [0.46, 1],
    [0.5, 1],
    [0.72, 0.25],
    [1, 0.25],
  ],
];

const RING: ReadonlyArray<readonly [number, number]> = [
  [3, 3],
  [7, 3],
  [11, 3],
  [11, 7],
  [11, 11],
  [7, 11],
  [3, 11],
  [3, 7],
];
const DOTS = [...RING, [7, 7] as const];

function animateDots(svg: SVGSVGElement, state: DotGridIconState) {
  const chat = svg.closest("[data-thread-chat]");
  let animations: Animation[] = [];
  let inView = false;

  const sync = () => {
    const paused = !inView || chat?.getAttribute("aria-hidden") === "true";
    for (const a of animations) {
      if (paused) a.pause();
      else a.play();
    }
  };

  const stopReduced = onReducedMotionChange((reduced) => {
    for (const a of animations) a.cancel();
    if (reduced) {
      animations =
        state === "working"
          ? [
              svg.animate(
                [0.55, 1, 0.55].map((opacity) => ({
                  opacity,
                  easing: "ease-in-out",
                })),
                { duration: 2000, iterations: Number.POSITIVE_INFINITY },
              ),
            ]
          : [];
    } else {
      animations = Array.from(
        svg.querySelectorAll<SVGElement>("[data-dot]"),
      ).flatMap((dot) => {
        if (state === "working" && !dot.hasAttribute("data-ring")) return [];
        if (state === "waiting" && dot.dataset.row !== "middle") return [];
        const frames =
          state === "working"
            ? WORKING
            : state === "waiting"
              ? WAITING
              : ATTENTION[
                  dot.dataset.tier === "0"
                    ? 0
                    : dot.dataset.tier === "1"
                      ? 1
                      : 2
                ];
        return [
          dot.animate(
            frames.map(([offset, opacity]) => ({
              offset,
              opacity,
              easing: "ease-in-out",
            })),
            {
              duration:
                state === "working" ? 800 : state === "waiting" ? 1600 : 1400,
              delay:
                state === "working"
                  ? Number(dot.dataset.ring) * 100 - 800
                  : state === "waiting"
                    ? ((Number(dot.getAttribute("cx")) - 3) / 4) * 200 - 1600
                    : 0,
              iterations: Number.POSITIVE_INFINITY,
            },
          ),
        ];
      });
    }
    for (const a of animations) a.finished.catch(() => {});
    sync();
  });

  const mutations = new MutationObserver(sync);
  if (chat)
    mutations.observe(chat, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry === undefined) return;
    inView = entry.isIntersecting;
    sync();
  });
  visibility.observe(svg);

  return () => {
    mutations.disconnect();
    visibility.disconnect();
    stopReduced();
    for (const a of animations) a.cancel();
  };
}

export function DotGridIcon({
  className,
  size,
  state = "working",
  label = "Loading",
  role = "status",
  ref,
  ...props
}: DotGridIconProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => svgRef.current as SVGSVGElement);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) return animateDots(svg, state);
  }, [state]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 14 14"
      role={role}
      aria-label={label}
      data-state={state}
      className={dotGridIconVariants({ size, className })}
      {...props}
    >
      {DOTS.map(([cx, cy], i) => (
        <circle
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed geometry
          key={i}
          data-dot=""
          data-ring={i < 8 ? i : undefined}
          data-row={cy === 7 ? "middle" : undefined}
          data-tier={i === 8 ? 0 : i % 2 === 1 ? 1 : 2}
          cx={cx}
          cy={cy}
          r="1"
          fill="currentColor"
          opacity={0}
        />
      ))}
    </svg>
  );
}
