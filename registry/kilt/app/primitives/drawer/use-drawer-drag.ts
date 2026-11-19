// Vendored from Kiki (primitives/drawer/use-drawer-drag.ts) by scripts/kilt/vendor-kiki.mjs. Do not edit; rerun the script.
import { type PointerEvent, type RefObject, useCallback, useRef } from "react";

export type DrawerDragContext = {
  contentRef: RefObject<HTMLElement | null>;
  actionsRef: RefObject<{ close: () => void }>;
};

type DragState = {
  pointerId: number;
  startY: number;
  lastY: number;
  lastT: number;
  velocity: number;
  offset: number;
  fromScroller: boolean;
  dragging: boolean;
};

export const DRAG_START_DISTANCE = 4;
export const DISMISS_HEIGHT_FRACTION = 0.25;
export const DISMISS_VELOCITY = 0.4;
export const OVERDRAG_RESISTANCE = 8;

export function dragOffset(delta: number) {
  return delta >= 0 ? delta : delta / OVERDRAG_RESISTANCE;
}

export function shouldDismiss(
  distance: number,
  height: number,
  velocity: number,
) {
  return (
    distance > height * DISMISS_HEIGHT_FRACTION ||
    (distance > 0 && velocity > DISMISS_VELOCITY)
  );
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clearDragStyles(content: HTMLElement) {
  content.style.removeProperty("translate");
  content.style.removeProperty("transition");
}

export function useDrawerDrag(
  context: DrawerDragContext | null,
  scrollerRef: RefObject<HTMLElement | null>,
) {
  const drag = useRef<DragState | null>(null);
  const frame = useRef(0);

  const blockTouchMove = useCallback((event: TouchEvent) => {
    if (drag.current?.dragging) event.preventDefault();
  }, []);

  const release = (content: HTMLElement) => {
    drag.current = null;
    content.removeEventListener("touchmove", blockTouchMove);
    if (frame.current !== 0) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
  };

  const snapBack = (content: HTMLElement) => {
    if (prefersReducedMotion()) {
      clearDragStyles(content);
      return;
    }
    content.style.removeProperty("transition");
    content.style.setProperty("transition-duration", "var(--duration-fast)");
    content.style.setProperty("translate", "0 0");
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== content || event.propertyName !== "translate") {
        return;
      }
      content.removeEventListener("transitionend", onTransitionEnd);
      if (drag.current?.dragging) return;
      content.style.removeProperty("translate");
      content.style.removeProperty("transition-duration");
    };
    content.addEventListener("transitionend", onTransitionEnd);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const content = context?.contentRef.current;
    if (
      !content ||
      event.button !== 0 ||
      (drag.current?.dragging &&
        content.hasPointerCapture(drag.current.pointerId))
    ) {
      return;
    }
    const scroller = scrollerRef.current;
    const fromScroller = scroller?.contains(event.target as Node) === true;
    if (fromScroller && (scroller?.scrollTop ?? 0) > 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
      offset: 0,
      fromScroller,
      dragging: false,
    };
    content.addEventListener("touchmove", blockTouchMove, { passive: false });
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const content = context?.contentRef.current;
    if (!state || !content || event.pointerId !== state.pointerId) return;
    const elapsed = event.timeStamp - state.lastT;
    if (elapsed > 0) {
      state.velocity =
        0.6 * ((event.clientY - state.lastY) / elapsed) + 0.4 * state.velocity;
      state.lastY = event.clientY;
      state.lastT = event.timeStamp;
    }
    const delta = event.clientY - state.startY;
    if (!state.dragging) {
      if (Math.abs(delta) < DRAG_START_DISTANCE) return;
      if (state.fromScroller && delta < 0) {
        release(content);
        return;
      }
      state.dragging = true;
      content.setPointerCapture(state.pointerId);
      content.setAttribute("data-dragging", "");
      content.style.setProperty("transition", "none");
    }
    state.offset = dragOffset(delta);
    if (frame.current !== 0) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const current = drag.current;
      if (current?.dragging) {
        content.style.setProperty(
          "translate",
          `0 ${current.offset}px`,
          "important",
        );
      }
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const content = context?.contentRef.current;
    if (!context || !state || !content || event.pointerId !== state.pointerId) {
      return;
    }
    release(content);
    if (!state.dragging) return;
    content.removeAttribute("data-dragging");
    if (
      !shouldDismiss(
        event.clientY - state.startY,
        content.offsetHeight,
        state.velocity,
      )
    ) {
      snapBack(content);
      return;
    }
    if (prefersReducedMotion()) {
      clearDragStyles(content);
    } else {
      content.style.removeProperty("transition");
      content.style.setProperty("transition-duration", "var(--duration-fast)");
      content.style.setProperty("translate", "0 100%");
    }
    context.actionsRef.current.close();
  };

  const onPointerCancel = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const content = context?.contentRef.current;
    if (!state || !content || event.pointerId !== state.pointerId) return;
    release(content);
    if (!state.dragging) return;
    content.removeAttribute("data-dragging");
    snapBack(content);
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
