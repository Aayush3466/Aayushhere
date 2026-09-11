"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plate } from "@/components/sections/ui";
import { cn } from "@/lib/utils";

/**
 * PROGRESSIVE DISCLOSURE
 * ----------------------
 * A card should say what a thing IS in one breath, and hold everything else
 * until asked. Dumping a full abstract into a grid tile does two bad things at
 * once: it buries the one line that decides whether you care, and it makes every
 * tile a different height so the page reads as rubble.
 *
 * So the card carries the first sentence, and the rest opens in a sheet.
 *
 * The proportions are the ones reading research keeps landing on and that every
 * case-study site converges to independently:
 *   · the teaser is ONE sentence, capped near 150 characters — long enough to be
 *     a real claim, short enough not to wrap past a couple of lines;
 *   · the sheet takes a little under three-quarters of the screen, not all of
 *     it, so the map stays visible behind and the panel reads as something you
 *     opened rather than somewhere you navigated to;
 *   · there is no affordance at all when the text already fits. A "read more"
 *     that shows you nothing new is worse than no link.
 *
 * THE WHOLE CARD IS THE TARGET. Making people hit a small text link is the
 * classic mistake here — everyone aims at the card, because the card is what
 * looks clickable. The link stays as the visible affordance and as the keyboard
 * path (a focusable card wrapping real links would nest interactive elements,
 * which costs a screen-reader user more than it gains a mouse user), but a click
 * anywhere that isn't already a link or a control opens the sheet.
 *
 * It renders through a portal, and that is not optional: the pager translates
 * its track sideways, and a `position: fixed` element inside a transformed
 * ancestor is positioned against that ancestor — so a sheet rendered in place
 * would open several screens off to the right.
 */

/** Below this, the whole thing fits on the card and there is nothing to open. */
const TEASER_LIMIT = 150;

/** A click landing on any of these belongs to that element, not to the card. */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [data-no-expand]";

export function splitTeaser(text: string): { teaser: string; more: boolean } {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= TEASER_LIMIT) return { teaser: clean, more: false };

  // Prefer a real sentence break, so the teaser reads as a finished thought
  // rather than a string that ran out of room.
  const stop = clean.slice(0, TEASER_LIMIT + 25).search(/[.!?](\s|$)/);
  if (stop > 60) {
    const teaser = clean.slice(0, stop + 1);
    // If that first sentence WAS the whole entry, there is nothing behind the
    // door — so don't put a door there.
    return { teaser, more: teaser.length < clean.length };
  }

  // No sentence to lean on — cut at the last whole word instead of mid-syllable.
  const cut = clean.lastIndexOf(" ", TEASER_LIMIT);
  return { teaser: `${clean.slice(0, cut > 60 ? cut : TEASER_LIMIT).trimEnd()}…`, more: true };
}

interface DetailState {
  teaser: string;
  more: boolean;
  accent: string;
  cta: string;
  open: () => void;
}

const DetailCtx = createContext<DetailState | null>(null);

/**
 * Wraps one card: owns the disclosure state, makes the card itself clickable,
 * and renders the sheet.
 */
export function Disclosure({
  text,
  title,
  meta,
  accent,
  cta = "Read more",
  detail,
  expandable = false,
  as: Tag = "div",
  plate = false,
  className,
  children,
}: {
  /** The long copy. The teaser comes from it; the sheet shows all of it. */
  text?: string;
  /** Heading for the sheet. */
  title: string;
  /** A line under the sheet's heading — venue, dates, role. */
  meta?: ReactNode;
  accent: string;
  cta?: string;
  /** Extra content for the sheet only — links, tech, anything the card omits. */
  detail?: ReactNode;
  /**
   * Force the door open even when the prose already fits. A record can be one
   * short sentence and still have ten bullets, three metrics and a timeline
   * behind it — judging "is there more?" on the paragraph alone would strand all
   * of that where nobody could reach it.
   */
  expandable?: boolean;
  as?: ElementType;
  /** Render the card as a paper `Plate` (tilt + sheen) rather than a bare tag. */
  plate?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { teaser, more: truncated } = text?.trim()
    ? splitTeaser(text)
    : { teaser: "", more: false };
  // The teaser is about the PROSE; the door is about whether anything at all is
  // hidden. They are not the same question.
  const more = truncated || expandable;

  function onCardClick(e: MouseEvent) {
    if (!more) return;
    if ((e.target as HTMLElement).closest?.(INTERACTIVE)) return;
    // Someone highlighting a sentence to copy it is reading, not navigating.
    if (window.getSelection()?.toString()) return;
    setOpen(true);
  }

  const cardProps = {
    className: cn(className, more && "cursor-pointer"),
    onClick: onCardClick,
    ...(more ? { "aria-haspopup": "dialog" as const } : {}),
  };

  const inner = (
    <DetailCtx.Provider value={{ teaser, more, accent, cta, open: () => setOpen(true) }}>
      {children}
    </DetailCtx.Provider>
  );

  return (
    <>
      {plate ? (
        <Plate accent={accent} {...cardProps}>
          {inner}
        </Plate>
      ) : (
        <Tag {...cardProps}>{inner}</Tag>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        meta={meta}
        accent={accent}
      >
        {text && (
          <p className="whitespace-pre-line leading-relaxed text-ink-soft">{text.trim()}</p>
        )}
        {detail}
      </Sheet>
    </>
  );
}

/** The clamped first sentence plus its affordance. Place inside a `Disclosure`. */
export function Teaser({ className }: { className?: string }) {
  const d = useContext(DetailCtx);
  if (!d?.teaser) return null;
  return (
    <p className={className}>
      {d.teaser}
      {d.more && (
        <>
          {" "}
          <button
            type="button"
            onClick={(e) => {
              // The card handler would fire too; harmless, but stopping here
              // keeps the intent of the click unambiguous.
              e.stopPropagation();
              d.open();
            }}
            className="ink-link whitespace-nowrap text-sm font-semibold"
            style={{ color: d.accent }}
          >
            {d.cta} →
          </button>
        </>
      )}
    </p>
  );
}

/**
 * The sheet itself. A bottom sheet on a phone (thumb-reachable, and the way
 * every native app does this) and a centred dialog on a pointer device.
 */
export function Sheet({
  open,
  onClose,
  title,
  meta,
  accent,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  meta?: ReactNode;
  accent: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // Capture, so Escape closes the sheet before anything else reacts to it.
    document.addEventListener("keydown", onKey, true);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  // There is no `document` to portal into while rendering on the server. This is
  // hydration-safe without a mounted flag because a closed sheet produces no DOM
  // either way — and keeping the AnimatePresence mounted on the client is what
  // lets the sheet animate back OUT when it closes.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        // `data-nav-ignore` keeps the pager's gestures off this subtree — without
        // it, scrolling a long abstract would sail you to the next chapter.
        <div
          data-nav-ignore
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
            style={{ background: "color-mix(in oklab, var(--color-ink) 42%, transparent)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            // On a phone this is a bottom sheet, so it needs a floor as well as
            // a ceiling — a 120px-tall sheet stuck to the bottom edge reads as a
            // toast, not as somewhere you opened. On a pointer device it is a
            // centred dialog and sizing to its content is correct.
            className="paper-panel relative flex max-h-[76vh] min-h-[42vh] w-full flex-col overflow-hidden rounded-b-none outline-none sm:max-h-[70vh] sm:min-h-0 sm:w-[min(720px,92vw)] sm:rounded-b-[inherit]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.99 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={{ borderTopColor: accent, borderTopWidth: 3 }}
          >
            <header className="flex items-start gap-4 border-b border-[color:var(--color-paper-edge)] px-6 py-5 sm:px-8">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
                  {title}
                </h3>
                {meta && <div className="mt-1.5 text-sm text-ink-faint">{meta}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="pop -mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--color-paper-edge)] text-ink-soft hover:text-ink"
                style={{ background: "var(--color-paper-panel)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            <div className="overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
