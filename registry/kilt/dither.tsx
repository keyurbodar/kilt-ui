"use client";

import type { PaperShaderElement } from "@paper-design/shaders";
import { Dithering, type DitheringProps, ImageDithering } from "@paper-design/shaders-react";
import { type CSSProperties, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./effects.css";

/** Capy's dither parameters: the wallpaper image shader and the WebGL context it mounts with. */
export const WALLPAPER_DITHER = { type: "8x8", size: 2, colorSteps: 4, fit: "cover", speed: 0.4, fps: 30 } as const;
export const SHADER_CONTEXT: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
};
const INK_FALLBACK = "#778abd";

/** Resolve any CSS colour (vars included) to the #rrggbb Paper Shaders parses. */
export function resolveShaderColor(color: string): string | undefined {
  const probe = document.createElement("div");
  probe.style.color = color;
  document.body.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (ctx === null) return undefined;
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export interface ShaderEnvironment {
  /** Mounted with WebGL2 available. */
  ready: boolean;
  reducedMotion: boolean;
  dark: boolean;
  ink: string;
}

/** The theme and capability state every dither reads; re-reads on theme or mode change. */
export function useShaderEnvironment(): ShaderEnvironment {
  const [env, setEnv] = useState<ShaderEnvironment>({ ready: false, reducedMotion: false, dark: true, ink: INK_FALLBACK });
  useEffect(() => {
    const gl = document.createElement("canvas").getContext("webgl2", SHADER_CONTEXT);
    const webgl = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const read = () =>
      setEnv({
        ready: webgl,
        reducedMotion: motion.matches,
        dark: root.classList.contains("dark") || (!root.classList.contains("light") && scheme.matches),
        ink: resolveShaderColor("var(--kilt-color-shader-ink)") ?? INK_FALLBACK,
      });
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme", "data-color-theme"] });
    motion.addEventListener("change", read);
    scheme.addEventListener("change", read);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", read);
      scheme.removeEventListener("change", read);
    };
  }, []);
  return env;
}

/** Advance a shader's frame at a capped fps, only while it is on screen and the page is visible. */
export function useShaderClock(ref: RefObject<PaperShaderElement | null>, { animate, speed, fps = 30 }: { animate: boolean; speed: number; fps?: number }) {
  useEffect(() => {
    const element = ref.current;
    if (!animate || element === null) return;
    const step = 1000 / fps;
    let elapsed = 0;
    let raf = 0;
    let last: number | null = null;
    let painted = 0;
    let inView = false;
    const tick = (now: number) => {
      if (last !== null) elapsed += Math.min(now - last, step * 2) * speed;
      last = now;
      if (now - painted >= step) {
        element.paperShaderMount?.setFrame(elapsed);
        painted = now;
      }
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      last = null;
      if (inView && document.visibilityState === "visible") raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      sync();
    });
    io.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(raf);
    };
  }, [ref, animate, speed, fps]);
}

/** Cap the backing store so each dither cell covers `size` CSS pixels. */
function usePixelBudget(size: number) {
  const [max, setMax] = useState<number | null>(null);
  const observe = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      const measure = () => {
        const { width, height } = element.getBoundingClientRect();
        const next = Math.max(1, Math.ceil((width * height) / (size * size)));
        setMax((current) => (current === next ? current : next));
      };
      measure();
      const resize = new ResizeObserver(measure);
      resize.observe(element);
      return () => resize.disconnect();
    },
    [size]
  );
  return [max, observe] as const;
}

export type DitherProps = Omit<DitheringProps, "speed" | "frame" | "size" | "ref" | "colorFront"> & {
  /** Cell size in CSS pixels. */
  size?: number;
  animate?: boolean;
  speed?: number;
  /** Front colour; defaults to the theme's --kilt-color-shader-ink. */
  colorFront?: string;
};

/** Capy's procedural dither (Paper Shaders' Dithering), pixelated and theme-inked. */
export function Dither({ size = 2, animate = true, speed = 0.5, colorFront, className, ...props }: DitherProps) {
  const ref = useRef<PaperShaderElement>(null);
  const env = useShaderEnvironment();
  const [max, observe] = usePixelBudget(size);
  useShaderClock(ref, { animate: animate && env.ready && !env.reducedMotion && max !== null, speed });
  return (
    <div ref={observe} data-slot="dither" className={cn("h-full w-full", className)}>
      {env.ready && max !== null && (
        <Dithering
          ref={ref}
          className="[&_canvas]:[image-rendering:pixelated]"
          width="100%"
          height="100%"
          minPixelRatio={1}
          maxPixelCount={max}
          webGlContextAttributes={SHADER_CONTEXT}
          colorBack="#00000000"
          colorFront={colorFront ?? env.ink}
          speed={0}
          frame={0}
          size={size}
          {...props}
        />
      )}
    </div>
  );
}

export type BackdropEffect = "none" | "dither" | "grain" | "vignette";

export interface WallpaperBackdropProps {
  image: string;
  effect?: BackdropEffect;
  /** 0-100, scaled by Capy's per-mode ceiling (0.7 dark, 0.6 light). */
  opacity?: number;
  brightness?: number;
  blur?: number;
  /** 0-100 wash of the background colour over the image. */
  overlay?: number;
  /** 0-100 fade of the image into the panel toward the bottom. */
  fade?: number;
  className?: string;
  style?: CSSProperties;
}

/** Capy's dashboard wallpaper: the image, dithered on the shared clock, then grain/vignette, wash and fade. */
export function WallpaperBackdrop({ image, effect = "dither", opacity = 100, brightness = 100, blur = 0, overlay = 0, fade = 100, className, style }: WallpaperBackdropProps) {
  const env = useShaderEnvironment();
  const [max, observe] = usePixelBudget(WALLPAPER_DITHER.size);
  const ref = useRef<PaperShaderElement>(null);
  const dither = effect === "dither" && env.ready && max !== null && !image.endsWith(".gif");
  useShaderClock(ref, { animate: dither && !env.reducedMotion, speed: WALLPAPER_DITHER.speed, fps: WALLPAPER_DITHER.fps });
  return (
    <div data-slot="kilt-backdrop" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={style}>
      <div
        ref={observe}
        className="absolute inset-0"
        style={{
          opacity: `calc(${opacity / 100} * var(${env.dark ? "--kilt-backdrop-opacity-dark" : "--kilt-backdrop-opacity-light"}))`,
          filter: `brightness(${brightness}%) blur(${blur / 16}rem)`,
        }}
      >
        <div className="kilt-backdrop-image" style={{ backgroundImage: `url("${image}")` }} />
        {dither && (
          <ImageDithering
            ref={ref}
            className="[&_canvas]:[image-rendering:pixelated]"
            width="100%"
            height="100%"
            minPixelRatio={1}
            maxPixelCount={max}
            webGlContextAttributes={SHADER_CONTEXT}
            image={image}
            fit={WALLPAPER_DITHER.fit}
            type={WALLPAPER_DITHER.type}
            size={WALLPAPER_DITHER.size}
            colorSteps={WALLPAPER_DITHER.colorSteps}
            originalColors
            speed={0}
            frame={0}
          />
        )}
        {effect !== "none" && effect !== "dither" && <div data-slot="kilt-effect" data-effect={effect} className="absolute inset-0" />}
      </div>
      <div className="absolute inset-0" style={{ background: "var(--kilt-color-background)", opacity: overlay / 100 }} />
      <div
        className="absolute inset-0"
        style={{
          opacity: fade / 100,
          backgroundImage:
            "linear-gradient(to bottom, transparent 20%, color-mix(in srgb, var(--kilt-color-panel) 40%, transparent) 40%, color-mix(in srgb, var(--kilt-color-panel) 80%, transparent) 60%, var(--kilt-color-panel) 85%)",
        }}
      />
    </div>
  );
}
