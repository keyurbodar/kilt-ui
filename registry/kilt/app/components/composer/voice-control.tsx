// Vendored from Kiki (components/composer/voice-control.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/registry/kilt/app/primitives/button";
import { DotGridIcon } from "@/registry/kilt/app/primitives/dot-grid-icon";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { ShortcutTooltip } from "./shortcut-tooltip";

export type ComposerVoiceState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "recording"; startedAt: number }
  | { phase: "finalizing" }
  | { phase: "error"; code: string };

export type ComposerVoiceMode = "hold" | "toggle";

export type ComposerVoice = {
  state: ComposerVoiceState;
  supported: boolean;
  mode?: ComposerVoiceMode;
  shortcut?: string | null;
  audioLevelRef?: RefObject<number>;
  start: () => void;
  cancel: () => void;
  accept: () => void;
};

const VOICE_ERRORS: Record<string, string> = {
  connection_timeout:
    "This network could not reach ElevenLabs, the transcription service",
  microphone_permission_denied: "Microphone access is blocked for Capy",
  microphone_not_found: "No microphone found",
  microphone_unavailable: "The microphone could not start",
  microphone_silent: "The microphone sent no audio",
  token_unavailable: "Voice input is unavailable right now",
  empty_transcript: "Nothing was heard",
};

export const describeVoiceError = (code: string) => {
  const text =
    VOICE_ERRORS[code] ??
    (code.startsWith("websocket_1006")
      ? "This network could not keep a connection to ElevenLabs, the transcription service"
      : undefined);
  return text === undefined ? code : `${text} (${code})`;
};

export const formatElapsed = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export const isVoiceActive = (state: ComposerVoiceState) =>
  state.phase === "starting" ||
  state.phase === "recording" ||
  state.phase === "finalizing";

const IDLE: ComposerVoiceState = { phase: "idle" };

export function VoiceControl({
  empty,
  ready,
  voice,
}: {
  empty: boolean;
  ready: boolean;
  voice?: ComposerVoice;
}) {
  const look = empty
    ? ({ intent: "accent", size: "icon-sm" } as const)
    : ({ variant: "ghost", size: "icon-sm" } as const);
  const state = voice?.state ?? IDLE;
  if (state.phase === "starting")
    return (
      <Button {...look} aria-label="Cancel voice input" onClick={voice?.cancel}>
        <DotGridIcon />
      </Button>
    );
  if (state.phase === "error")
    return (
      <ShortcutTooltip
        label={`Voice input failed: ${describeVoiceError(state.code)}`}
        shortcut={ready ? voice?.shortcut : undefined}
      >
        <Button
          {...look}
          intent="danger"
          aria-label="Voice input failed, retry"
          onClick={voice?.start}
        >
          <Icon name="microphone-outline" size="sm" />
        </Button>
      </ShortcutTooltip>
    );
  const icon = (
    <Icon name={empty ? "microphone" : "microphone-outline"} size="sm" />
  );
  if (!ready || voice === undefined)
    return (
      <ShortcutTooltip label="Voice input coming soon">
        <span className="inline-flex">
          <Button {...look} aria-label="Voice input" disabled>
            {icon}
          </Button>
        </span>
      </ShortcutTooltip>
    );
  return (
    <ShortcutTooltip
      label={
        voice.shortcut != null && voice.mode === "hold"
          ? "Hold to talk"
          : "Voice input"
      }
      shortcut={voice.shortcut}
    >
      <Button {...look} aria-label="Voice input" onClick={voice.start}>
        {icon}
      </Button>
    </ShortcutTooltip>
  );
}

function Elapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
      {formatElapsed(now - startedAt)}
    </span>
  );
}

const CELL = 2;
const STEP_SECONDS = 0.024;
const PEAK_FLOOR = 0.2;
const NOISE_FLOOR = 0.04;
const BAYER = Array.from({ length: 64 }, (_, i) => {
  const x = i % 8;
  const y = Math.floor(i / 8);
  return (
    ([0, 1, 2].reduce(
      (acc, bit) =>
        acc |
        ((((x ^ y) >> bit) & 1) << (5 - 2 * bit)) |
        (((y >> bit) & 1) << (4 - 2 * bit)),
      0,
    ) +
      0.5) /
    64
  );
});
const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function Waveform({ audioLevelRef }: { audioLevelRef?: RefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paint = { color: getComputedStyle(canvas).color };
    const themeWatch = new MutationObserver(() => {
      paint.color = getComputedStyle(canvas).color;
    });
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color-theme"],
    });
    const size = { width: 0, height: 0, ratio: 1 };
    const resize = new ResizeObserver(() => {
      const box = canvas.getBoundingClientRect();
      size.ratio = window.devicePixelRatio || 1;
      size.width = box.width;
      size.height = box.height;
      canvas.width = Math.round(box.width * size.ratio);
      canvas.height = Math.round(box.height * size.ratio);
    });
    resize.observe(canvas);
    let history = new Float32Array();
    let level = 0;
    let peak = PEAK_FLOOR;
    let last = -1;
    let stepAt = -1;
    let shift = 0;
    let frame = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      const seconds = time / 1000;
      const dt = last < 0 ? 1 / 60 : Math.min(seconds - last, 0.1);
      last = seconds;
      const raw = Math.max(0, Math.min(audioLevelRef?.current ?? 0, 1));
      peak = Math.max(raw, PEAK_FLOOR, peak * Math.exp(-dt / 3));
      const target = Math.min(
        Math.max((raw - NOISE_FLOOR) / (peak - NOISE_FLOOR), 0),
        1,
      );
      level +=
        (target - level) *
        (1 - Math.exp(-dt / (target > level ? 0.035 : 0.11)));
      if (size.width === 0) return;
      const cols = Math.max(1, Math.floor(size.width / CELL));
      const rows = Math.max(1, Math.floor(size.height / CELL));
      if (history.length !== cols) {
        const next = new Float32Array(cols);
        next.set(
          history.subarray(Math.max(0, history.length - cols)),
          Math.max(0, cols - history.length),
        );
        history = next;
      }
      const still = reduced.matches;
      if (still) history.fill(level);
      if (!still && stepAt < 0) stepAt = seconds;
      while (!still && seconds - stepAt >= STEP_SECONDS) {
        stepAt += STEP_SECONDS;
        history.copyWithin(0, 1);
        history[cols - 1] = level;
        shift += 1;
      }
      ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = paint.color;
      ctx.beginPath();
      const mid = (rows - 1) / 2;
      const offsetX = size.width - cols * CELL;
      const offsetY = (size.height - rows * CELL) / 2;
      for (let col = 0; col < cols; col += 1) {
        const value = history[col] ?? 0;
        const fade = still ? 1 : 0.4 + 0.6 * smoothstep(0, 0.6, col / cols);
        const reach = 0.08 + 0.97 * value;
        for (let row = 0; row < rows; row += 1) {
          const dist = Math.abs(row - mid) / (mid + 0.5);
          const density =
            (1 - smoothstep(0, reach, dist)) ** 0.75 * (0.4 + 0.75 * value);
          if (
            Math.max(density, dist < 0.12 ? 0.34 : 0) * fade >
            (BAYER[(row & 7) * 8 + ((col + shift) & 7)] ?? 0.5)
          )
            ctx.rect(offsetX + col * CELL, offsetY + row * CELL, CELL, CELL);
        }
      }
      ctx.fill();
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      themeWatch.disconnect();
      resize.disconnect();
    };
  }, [audioLevelRef]);
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-6 min-w-0 flex-1 text-primary"
    />
  );
}

export function VoiceRecording({
  startedAt,
  audioLevelRef,
}: {
  startedAt: number;
  audioLevelRef?: RefObject<number>;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
      <Waveform audioLevelRef={audioLevelRef} />
      <Elapsed startedAt={startedAt} />
    </div>
  );
}
