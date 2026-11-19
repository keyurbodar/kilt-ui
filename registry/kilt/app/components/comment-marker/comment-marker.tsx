// Vendored from Kiki (components/comment-marker/comment-marker.tsx) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { cx } from "class-variance-authority";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Icon } from "@/registry/kilt/app/primitives/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/kilt/app/primitives/popover";
import { type MarkerComment, markerLabel, markerTone } from "./marker";
import "./comment-marker.css";

export type CommentMarkerIconProps = { comment: MarkerComment };

export function CommentMarkerIcon({ comment }: CommentMarkerIconProps) {
  const tone = markerTone(comment);
  return (
    <span
      className={cx(
        "diff-comment-marker-icon",
        tone && `diff-comment-marker-${tone}`,
      )}
    >
      {comment.finding ? (
        <Icon name={tone === "note" ? "note-text" : "review"} size="sm" />
      ) : (
        <span
          data-slot="avatar"
          className="flex size-full items-center justify-center bg-secondary text-2xs font-medium text-muted-foreground-1"
        >
          {(comment.author?.name ?? "GitHub user").slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}

export type CommentMarkersProps = {
  comments: ReadonlyArray<MarkerComment>;
  activeId: string | null;
  onToggle: (id: string, keyboard: boolean) => void;
  placement?: "line" | "block";
};

export function CommentMarkers({
  comments,
  activeId,
  onToggle,
  placement = "line",
}: CommentMarkersProps) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickedRef = useRef(false);

  useEffect(() => {
    if (hoverEnabled) return;
    const onMove = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node))
        setHoverEnabled(true);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [hoverEnabled]);

  const close = (immediate: boolean) => {
    pickedRef.current = false;
    setHoverEnabled(false);
    setInstant(immediate);
    setOpen(false);
  };

  const buttons =
    comments.length > 1 ? (
      <Popover
        open={open}
        onOpenChange={(next, details) => {
          if (!next && pickedRef.current && details.reason === "trigger-hover")
            return;
          const keyboard =
            details.event instanceof KeyboardEvent ||
            details.reason === "focus-out" ||
            (details.reason === "trigger-press" &&
              details.event instanceof MouseEvent &&
              details.event.detail === 0);
          if (!next && details.reason !== "trigger-hover") {
            close(keyboard);
            return;
          }
          if (!next) pickedRef.current = false;
          setInstant(keyboard);
          setOpen(next);
        }}
      >
        <PopoverTrigger
          openOnHover={hoverEnabled}
          delay={0}
          render={
            <button
              ref={triggerRef}
              type="button"
              className="diff-comment-marker diff-comment-marker-stack focus-visible:outline-ring-inset"
              data-motion={instant ? "instant" : undefined}
              aria-label={`${comments.length} discussions`}
            >
              <span
                className="diff-comment-marker-stack-icons"
                aria-hidden="true"
              >
                {comments.slice(0, 2).map((comment) => (
                  <CommentMarkerIcon key={comment.id} comment={comment} />
                ))}
              </span>
              {comments.length > 2 && (
                <span className="diff-comment-marker-count" aria-hidden="true">
                  +{comments.length - 2}
                </span>
              )}
            </button>
          }
        />
        <PopoverContent
          variant="unstyled"
          side="bottom"
          sideOffset={({ anchor }) => -anchor.height}
          className="diff-comment-marker-fan"
          data-motion={instant ? "instant" : undefined}
          aria-label="Discussions"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            close(true);
            triggerRef.current?.focus();
          }}
        >
          <div className="diff-comment-marker-fan-items">
            {comments.map((comment, index) => (
              <button
                key={comment.id}
                type="button"
                className="diff-comment-marker focus-visible:outline-ring-inset"
                style={{ "--diff-comment-index": index } as CSSProperties}
                aria-label={markerLabel(comment)}
                title={markerLabel(comment)}
                aria-expanded={activeId === comment.id}
                onClick={(event) => {
                  pickedRef.current = true;
                  onToggle(comment.id, event.detail === 0);
                }}
              >
                <CommentMarkerIcon comment={comment} />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    ) : (
      comments.map((comment) => (
        <button
          key={comment.id}
          type="button"
          className="diff-comment-marker focus-visible:outline-ring-inset"
          aria-label={markerLabel(comment)}
          title={markerLabel(comment)}
          aria-expanded={activeId === comment.id}
          onClick={(event) => onToggle(comment.id, event.detail === 0)}
        >
          <CommentMarkerIcon comment={comment} />
        </button>
      ))
    );

  return (
    <div
      data-slot="comment-markers"
      className="diff-comment-markers"
      data-placement={placement}
    >
      <div className="diff-comment-marker-buttons">{buttons}</div>
    </div>
  );
}
