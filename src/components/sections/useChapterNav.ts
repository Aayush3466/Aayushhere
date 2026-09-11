"use client";

import { useEffect, type RefObject } from "react";

/**
 * THE VOYAGE GESTURES
 * -------------------
 * One place that decides when the map sails to the next chapter, for every
 * input a visitor might have: trackpad, mouse wheel, finger, keyboard.
 *
 * The rule the whole thing is built around: VERTICAL SCROLL FINISHES THE CHAPTER
 * FIRST. While a chapter still has content below the fold, a downward scroll is
 * an ordinary scroll and we do not touch it. Only once the column has bottomed
 * out does further downward intent start filling an "overscroll budget"; when
 * that budget is spent, the map sails onward. Scrolling up at the very top does
 * the same in reverse. A chapter that fits on one screen has no budget to build,
 * so it hands over immediately — which is what "the section is complete" means.
 *
 * The budget matters. Paging the instant you touch the bottom edge makes a site
 * feel like it is fighting you; requiring a real push past the edge means a
 * chapter change is always something you meant.
 */

/** Wheel distance past a chapter's edge before the map sails onward. */
const WHEEL_BUDGET = 190;
/** Sideways trackpad distance that commits a chapter change. */
const WHEEL_SIDEWAYS = 80;
/** A page turn is locked in for at least this long, whatever the input does. */
const HARD_LOCK_MS = 260;
/** Wheel events closer together than this are still the same flick coasting. */
const MOMENTUM_GAP_MS = 160;
/**
 * A flick's momentum only ever decays. A delta this much bigger than the
 * smallest one seen since the page turned means fingers are back on the glass —
 * a new gesture, not the tail of the old one.
 */
const REACCEL_RATIO = 1.5;
/** Below this, a delta is too small to trust as deliberate re-acceleration. */
const REACCEL_FLOOR = 10;
/** A gap this long with no wheel events means the visitor stopped pushing. */
const IDLE_RESET_MS = 260;
/** Finger travel that commits a sideways swipe. */
const SWIPE_COMMIT = 52;
/** ...or this much speed, so a short sharp flick counts as much as a long drag. */
const SWIPE_VELOCITY = 0.45; // px per ms
/** Finger travel past a chapter's edge that commits a vertical hand-over. */
const PULL_COMMIT = 76;
/** Axis lock: this much travel decides whether a gesture is a page or a scroll. */
const AXIS_LOCK = 9;
/** How hard the sheet pulls back when you drag beyond the first / last chapter. */
const EDGE_RESISTANCE = 0.32;
/** How far the sheet leans toward the next chapter at a full overscroll budget. */
const PEEK_PX = 42;

/** True when a scrolling column has nothing left below the fold. */
function atBottom(el: HTMLElement | null): boolean {
  if (!el) return true; // a chapter with no column (Home) is always "finished"
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
}

function atTop(el: HTMLElement | null): boolean {
  if (!el) return true;
  return el.scrollTop <= 2;
}

/** Typing in the contact form or the chat must never move the map. */
function inTextField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return false;
  return !!el.closest("input, textarea, select, [contenteditable='true']");
}

/** Anything marked `data-nav-ignore` (the chat panel, open sheets) is off-limits. */
function isShielded(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el?.closest?.("[data-nav-ignore]");
}

export interface ChapterNavOptions {
  /** The pager's own element — every listener hangs off this. */
  root: RefObject<HTMLDivElement | null>;
  /** The active chapter's scrolling column, read fresh on every event. */
  scroller: () => HTMLDivElement | null;
  /** Current chapter, read fresh so listeners never need re-binding. */
  index: () => number;
  count: number;
  /** Width of one chapter in px — the drag works in real pixels. */
  width: () => number;
  /** Commit a chapter change. */
  page: (dir: 1 | -1) => void;
  /** Live sideways drag offset in px; `null` means the finger let go. */
  drag: (px: number | null) => void;
  /** Suspend everything (e.g. while the intro loader is still up). */
  enabled?: boolean;
}

export function useChapterNav({
  root,
  scroller,
  index,
  count,
  width,
  page,
  drag,
  enabled = true,
}: ChapterNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    let lastPage = 0;
    let lastWheel = 0;
    let budget = 0;
    let sideways = 0;
    // Set the moment a page turn commits, cleared once the flick that caused it
    // is genuinely over — see the note in `onWheel`.
    let coasting = false;
    /** Smallest wheel delta seen since the page turned, for decay detection. */
    let coastFloor = Infinity;
    /** Releases the overscroll lean when the visitor simply stops pushing. */
    let relax = 0;
    const relaxSoon = () => {
      window.clearTimeout(relax);
      relax = window.setTimeout(() => {
        if (budget) {
          budget = 0;
          drag(null);
        }
      }, IDLE_RESET_MS);
    };

    /** Commit a page turn if it is legal and we are not still riding momentum. */
    const commit = (dir: 1 | -1): boolean => {
      const now = Date.now();
      if (now - lastPage < HARD_LOCK_MS || coasting) return false;
      const next = index() + dir;
      if (next < 0 || next > count - 1) return false;
      lastPage = now;
      coasting = true;
      coastFloor = Infinity;
      budget = 0;
      sideways = 0;
      page(dir);
      return true;
    };

    // ---- wheel & trackpad ------------------------------------------------
    const onWheel = (e: WheelEvent) => {
      if (isShielded(e.target)) return;
      const now = Date.now();
      const gap = now - lastWheel;
      lastWheel = now;

      const ax = Math.abs(e.deltaX);
      const ay = Math.abs(e.deltaY);
      const mag = Math.max(ax, ay);

      // Swallow the rest of the flick that just turned the page. A trackpad
      // coasts for up to a second, and left alone that momentum either skips
      // straight through the next chapter or scrolls it halfway down before the
      // visitor has seen its title.
      //
      // Ending the coast on a TIME GAP alone is not enough, and this was a real
      // bug: swipe sideways twice in a row and the second swipe arrives before
      // any gap appears, so it gets eaten as if it were still momentum — and it
      // keeps getting eaten for as long as you keep swiping. Moving the mouse
      // appeared to fix it only because moving takes longer than the gap.
      //
      // So also watch the SHAPE of the deltas. Momentum decays monotonically; a
      // delta clearly larger than the smallest one seen since the page turned
      // means a hand is driving it again.
      if (now - lastPage < HARD_LOCK_MS) {
        e.preventDefault();
        return;
      }
      if (coasting) {
        const stopped = gap > MOMENTUM_GAP_MS;
        const pushedAgain = mag > coastFloor * REACCEL_RATIO && mag > REACCEL_FLOOR;
        if (stopped || pushedAgain) {
          coasting = false;
        } else {
          coastFloor = Math.min(coastFloor, mag);
          e.preventDefault();
          return;
        }
      }

      // A deliberate sideways swipe sails directly — this is the trackpad's
      // natural "next page" gesture and shouldn't need a boundary.
      if (ax > ay * 1.5 && ax > 14) {
        e.preventDefault();
        if (gap > IDLE_RESET_MS) sideways = 0;
        sideways += e.deltaX;
        if (Math.abs(sideways) > WHEEL_SIDEWAYS) commit(sideways > 0 ? 1 : -1);
        return;
      }

      if (ay < 1) return;

      const sc = scroller();
      const down = e.deltaY > 0;
      const edge = down ? atBottom(sc) : atTop(sc);

      if (!edge) {
        // There is still chapter left — this is an ordinary scroll, hands off.
        if (budget) drag(null);
        budget = 0;
        return;
      }

      if (index() + (down ? 1 : -1) < 0 || index() + (down ? 1 : -1) > count - 1) {
        return; // nowhere to sail; let the browser rubber-band as it likes
      }

      if (gap > IDLE_RESET_MS) budget = 0;
      budget += ay;
      // Stop the overscroll bounce so the edge feels like a held door, not a wall.
      e.preventDefault();

      if (budget > WHEEL_BUDGET) {
        window.clearTimeout(relax);
        commit(down ? 1 : -1);
        drag(null);
        return;
      }
      // Show the door opening. Without this the threshold is invisible — you
      // push at a dead edge and the page changes at some moment you cannot
      // predict. Letting the sheet lean toward the next chapter in proportion
      // to how hard you have pushed makes the whole gesture legible.
      drag(-(budget / WHEEL_BUDGET) * PEEK_PX * (down ? 1 : -1));
      relaxSoon();
    };

    // ---- keyboard --------------------------------------------------------
    const onKey = (e: KeyboardEvent) => {
      if (inTextField(document.activeElement) || isShielded(document.activeElement)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        commit(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        commit(-1);
      }
    };

    // ---- touch -----------------------------------------------------------
    // The column is `touch-action: pan-y`, so the browser owns vertical scroll
    // (which keeps it buttery and native) and hands us horizontal gestures as
    // cancelable events. That split is why the vertical hand-over is measured on
    // release rather than fought for mid-gesture: during a native scroll the
    // touchmove is not cancelable, but its coordinates are still perfectly
    // readable.
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let axis: "x" | "y" | null = null;
    let startedAtBottom = false;
    let startedAtTop = false;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      // A finger on the glass is always a fresh, deliberate gesture.
      coasting = false;
      if (e.touches.length !== 1 || isShielded(e.target)) {
        tracking = false;
        return;
      }
      const t = e.touches[0];
      x0 = t.clientX;
      y0 = t.clientY;
      t0 = Date.now();
      axis = null;
      tracking = true;
      const sc = scroller();
      startedAtBottom = atBottom(sc);
      startedAtTop = atTop(sc);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;

      if (axis === null) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      }

      if (axis !== "x") return;
      if (e.cancelable) e.preventDefault();

      // Let the sheet follow the finger, with real resistance at the two ends
      // of the voyage so the map feels like paper rather than a slideshow.
      const i = index();
      const overshoot = (dx > 0 && i === 0) || (dx < 0 && i === count - 1);
      drag(overshoot ? dx * EDGE_RESISTANCE : dx);
    };

    const endTouch = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) {
        drag(null);
        return;
      }
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;

      if (axis === "x") {
        // Distance OR speed. Judging a swipe on distance alone punishes the
        // quick confident flick — the gesture of someone who already knows
        // where they are going — and rewards a slow drag nobody performs.
        const speed = Math.abs(dx) / Math.max(1, Date.now() - t0);
        const decisive = Math.abs(dx) > SWIPE_COMMIT || speed > SWIPE_VELOCITY;
        // Commit FIRST. If it takes, the pager is already springing toward the
        // new chapter, and telling it to spring back to the old one — even for
        // a single frame — reads as a stutter at exactly the moment the visitor
        // is watching most closely.
        const sailed = decisive && Math.abs(dx) > 12 && commit(dx < 0 ? 1 : -1);
        if (!sailed) drag(null);
        return;
      }

      if (axis === "y") {
        const sc = scroller();
        // Finger travelling UP means content moving up means "further down the
        // page" — so a strong upward flick that both began and ended pinned to
        // the foot of the chapter is the hand-over.
        if (dy < -PULL_COMMIT && startedAtBottom && atBottom(sc)) commit(1);
        else if (dy > PULL_COMMIT && startedAtTop && atTop(sc)) commit(-1);
      }
    };

    // On WINDOW, not on the pager. An element listener only sees events the
    // browser routes to that element, which depends on what is under the cursor
    // — and after a chapter change a stationary cursor may be sitting over the
    // old, now-`inert` chapter, or over the chat launcher, which is a sibling of
    // the pager and whose events never reach it. That was the other half of the
    // "it stops working until I move the mouse" bug. `isShielded` still keeps
    // the chat panel and open sheets to themselves.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endTouch, { passive: true });
    window.addEventListener("touchcancel", endTouch, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(relax);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endTouch);
      window.removeEventListener("touchcancel", endTouch);
      window.removeEventListener("keydown", onKey);
    };
    // `width` is read through the getter, so listeners never need re-binding.
  }, [root, scroller, index, count, width, page, drag, enabled]);
}
