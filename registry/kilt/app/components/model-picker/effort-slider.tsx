// Vendored from Kiki (components/model-picker/effort-slider.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { type PointerEvent, useEffect, useRef } from "react";
import { type Effort, effortLabel } from "./catalog";

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const thumbTravel = 20;

const join = (...parts: ReadonlyArray<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export type DitherProps = {
  from: number;
  to: number;
  start?: number;
  slant?: number;
  cell?: number;
  className?: string;
};

export function Dither({
  from,
  to,
  start = 0,
  slant = 0,
  cell = 2,
  className,
}: DitherProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (canvas == null || context == null) return;
    const paint = () => {
      const columns = Math.ceil(canvas.offsetWidth / cell);
      const rows = Math.ceil(canvas.offsetHeight / cell);
      if (columns === 0 || rows === 0) return;
      canvas.width = columns;
      canvas.height = rows;
      context.fillStyle = getComputedStyle(canvas).color;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < columns; x++) {
          const v = (y + 0.5) / rows;
          const along =
            (1 - Math.abs(slant)) * ((x + 0.5) / columns) +
            Math.abs(slant) * (slant < 0 ? 1 - v : v);
          const t = Math.min(1, Math.max(0, (along - start) / (1 - start)));
          if (
            from + (to - from) * t * t * (3 - 2 * t) >
            ((bayer[(y % 4) * 4 + (x % 4)] ?? 8) + 0.5) / 16
          )
            context.fillRect(x, y, 1, 1);
        }
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [from, to, start, slant, cell]);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className={join(
        "pointer-events-none absolute [image-rendering:pixelated]",
        className,
      )}
    />
  );
}

export type EffortSliderProps = {
  efforts: ReadonlyArray<Effort>;
  value: Effort | undefined;
  onChange: (effort: Effort) => void;
  onCommit?: () => void;
  touch?: boolean;
  off?: boolean;
};

const keepFocus = (event: { preventDefault: () => void }) =>
  event.preventDefault();

export function EffortSlider({
  efforts,
  value,
  onChange,
  onCommit,
  touch = false,
  off = false,
}: EffortSliderProps) {
  const index = Math.max(0, value === undefined ? 0 : efforts.indexOf(value));
  const last = Math.max(1, efforts.length - 1);
  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(
        0,
        (event.clientX - box.left - thumbTravel / 2) /
          (box.width - thumbTravel),
      ),
    );
    const next = efforts[Math.round(ratio * (efforts.length - 1))];
    if (next !== undefined && (off || next !== value)) onChange(next);
  };
  const tick = (step: number) =>
    `calc(var(--spacing) * 2.5 + (100% - var(--spacing) * 5) * ${step / last})`;
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Reasoning"
      aria-valuemin={0}
      aria-valuemax={efforts.length - 1}
      aria-valuenow={index}
      aria-valuetext={
        efforts[index] === undefined
          ? undefined
          : effortLabel(efforts[index] as Effort)
      }
      className={join(
        "group/slider w-full cursor-pointer touch-none rounded focus-visible:outline-ring-inset",
        touch && "-my-3 py-3",
      )}
      onMouseDown={keepFocus}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) pick(event);
      }}
      onLostPointerCapture={onCommit}
    >
      <div
        className={join(
          "relative w-full overflow-hidden rounded bg-secondary",
          touch ? "h-10" : "h-(--h-control-sm)",
        )}
      >
        {efforts.map((effort, step) =>
          step <= index ? null : (
            <span
              key={effort}
              className="absolute top-1/2 h-2 w-px -translate-1/2 bg-border-3"
              style={{ left: tick(step) }}
            />
          ),
        )}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden rounded bg-primary transition-[width] duration-base ease-out motion-reduce:transition-none"
          style={{
            width: `calc(var(--spacing) * 5 + (100% - var(--spacing) * 5) * ${index / last})`,
          }}
        >
          <span className="absolute inset-0 bg-linear-to-r from-overlay-media/30 to-transparent" />
          <Dither
            from={0}
            to={0.5}
            className="inset-y-0 left-0 h-full w-[calc(100%-var(--spacing)*5.5)] text-primary-foreground opacity-45"
          />
          <span className="absolute inset-y-0.5 right-0.5 w-4 rounded-sm bg-primary-foreground shadow-plate transition-[scale] duration-fast ease-out group-active/slider:scale-95 motion-reduce:transition-none" />
        </div>
      </div>
    </div>
  );
}
