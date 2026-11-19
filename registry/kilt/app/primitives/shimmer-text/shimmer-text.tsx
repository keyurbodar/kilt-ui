// Vendored from Kiki (primitives/shimmer-text/shimmer-text.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cx } from "class-variance-authority";
import {
  type ComponentProps,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { observeActive, prefersReducedMotion } from "@/registry/kilt/app/lib/motion";

export type ShimmerTextState = "live" | "settling" | "rest";

export type ShimmerTextProps = ComponentProps<"span"> & {
  state?: ShimmerTextState;
};

const SWEEP = 2000;
const SETTLE = 300;
const SETTLE_EASING = "cubic-bezier(0.33, 0.67, 0.67, 1)";
const SETTLED_AFTER = 400;

const isCssAnimation = (a: Animation) =>
  typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation;

/** live while `active`, then settling (glide to rest), then rest. */
export function useShimmerState(active: boolean): ShimmerTextState | undefined {
  const [state, setState] = useState<ShimmerTextState | undefined>(
    active ? "live" : undefined,
  );
  if (active && state !== "live") setState("live");
  if (!active && state === "live") setState("settling");
  useEffect(() => {
    if (state !== "settling") return;
    const timer = setTimeout(() => setState("rest"), SETTLED_AFTER);
    return () => clearTimeout(timer);
  }, [state]);
  return state;
}

export function ShimmerText({
  state = "live",
  className,
  ...props
}: ShimmerTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(state);
  const settle = useRef<Animation | null>(null);
  const inView = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;
    el.style.animationDelay = `${-(Number(document.timeline?.currentTime ?? 0) % SWEEP)}ms`;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    let startTime: CSSNumberish | null = null;
    return observeActive(el, (active) => {
      inView.current = active;
      const sweep = el.getAnimations?.().find(isCssAnimation);
      if (sweep === undefined || previous.current !== "live") return;
      if (active) {
        if (startTime === null) sweep.play();
        else sweep.startTime = startTime;
      } else {
        if (sweep.playState !== "paused") startTime = sweep.startTime;
        sweep.pause();
      }
    });
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    const from = previous.current;
    previous.current = state;
    if (el === null || from === state) return;
    const sweep = el.getAnimations?.().find(isCssAnimation);
    if (state === "live") {
      settle.current?.cancel();
      settle.current = null;
      if (inView.current) sweep?.play();
      return;
    }
    if (from !== "live" || prefersReducedMotion()) return;
    const progress = sweep?.effect?.getComputedTiming().progress;
    if (sweep === undefined || progress == null) return;
    const position = 100 - 200 * progress;
    sweep.pause();
    settle.current = el.animate(
      [
        { backgroundPosition: `${position}% 0` },
        { backgroundPosition: `${position - (200 * SETTLE) / SWEEP / 2}% 0` },
      ],
      { duration: SETTLE, easing: SETTLE_EASING, fill: "forwards" },
    );
  }, [state]);

  return (
    <span
      ref={ref}
      data-slot="shimmer-text"
      data-state={state}
      className={cx("text-shimmer", className)}
      {...props}
    />
  );
}
