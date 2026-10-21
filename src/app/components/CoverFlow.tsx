import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CoverFlowItem {
  id: string;
  image: string;
  title: string;
  href?: string;
}

export interface CoverFlowSettings {
  /** Rotation (deg) of the side covers. */
  rotation: number;
  /** Distance from the centre to the first side cover, as a fraction of the cover size. */
  centerGap: number;
  /** Distance between the following side covers, as a fraction of the cover size. */
  spacing: number;
  /** How far back (px) the side covers are pushed. */
  depth: number;
  /** Number of covers visible on each side of the centre. */
  visibleSides: number;
  /** Brightness of the side covers (0–1). Lower = stronger centre highlight. */
  sideBrightness: number;
  /** Show the mirror reflection under the covers. */
  reflection: boolean;
  /** Opacity at the top of the reflection (0–1). */
  reflectionOpacity: number;
  /** Height of the reflection as a fraction of the cover size. */
  reflectionHeight: number;
  /** Animation duration in ms. */
  duration: number;
  /** Auto-advance to the next cover after this many ms without interaction (0 = off). Pauses on hover/focus. */
  autoplay: number;
  /** Jump from the last cover back to the first (and vice versa). */
  loop: boolean;
  /** Cover size as a fraction of the available width – [mobile, desktop]. */
  sizeRatio: [number, number];
  /** Min/max cover size in px. */
  minSize: number;
  maxSize: number;
}

export const defaultCoverFlowSettings: CoverFlowSettings = {
  rotation: 45,
  centerGap: 0.72,
  spacing: 0.36,
  depth: 180,
  visibleSides: 3,
  sideBrightness: 0.5,
  reflection: true,
  reflectionOpacity: 0.3,
  reflectionHeight: 0.35,
  duration: 600,
  autoplay: 10000,
  loop: false,
  sizeRatio: [0.58, 0.3],
  minSize: 150,
  maxSize: 320,
};

interface CoverFlowProps {
  items: CoverFlowItem[];
  /** `container` = framed card, `full` = edge-to-edge without frame. */
  variant?: 'container' | 'full';
  settings?: Partial<CoverFlowSettings>;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  /** Rendered under the covers, e.g. details about the active item. */
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function CoverFlow({
  items,
  variant = 'container',
  settings: settingsOverride,
  activeIndex: controlledIndex,
  onActiveChange,
  children,
  className = '',
  ariaLabel = 'Karusell',
}: CoverFlowProps) {
  const s = { ...defaultCoverFlowSettings, ...settingsOverride };
  const [internalIndex, setInternalIndex] = useState(0);
  const active = controlledIndex ?? internalIndex;
  const count = items.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ratio = width < 640 ? s.sizeRatio[0] : s.sizeRatio[1];
  const size = Math.round(Math.min(s.maxSize, Math.max(s.minSize, width * ratio)));
  const reflectionPx = s.reflection ? Math.round(size * s.reflectionHeight) : 0;

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (s.loop) next = ((index % count) + count) % count;
      else next = Math.max(0, Math.min(count - 1, index));
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveChange?.(next);
    },
    [count, s.loop, controlledIndex, onActiveChange],
  );

  // Auto-advance. The timer restarts whenever the active cover changes,
  // so any user navigation resets it. Wraps to the first cover at the end.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!s.autoplay || paused || count < 2) return;
    const t = window.setTimeout(() => goTo(active >= count - 1 ? 0 : active + 1), s.autoplay);
    return () => window.clearTimeout(t);
  }, [active, paused, s.autoplay, count, goTo]);

  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);
  const canPrev = s.loop || active > 0;
  const canNext = s.loop || active < count - 1;

  // Swipe / drag
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > 30) {
      suppressClick.current = true;
      const steps = Math.max(1, Math.round(Math.abs(dx) / (size * s.spacing * 1.5)));
      goTo(active + (dx < 0 ? steps : -steps));
    }
  };

  // Horizontal trackpad / wheel scrolling (vertical scrolling is left to the page)
  const wheelLock = useRef(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 180) return;
      wheelLock.current = now;
      goTo(active + (e.deltaX > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [active, goTo]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(count - 1); }
  };

  if (count === 0) return null;

  const transition = reducedMotion
    ? 'none'
    : `transform ${s.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${s.duration}ms ease, filter ${s.duration}ms ease`;

  const itemStyle = (i: number): CSSProperties => {
    let d = i - active;
    if (s.loop && count > 2) {
      // shortest path around the ring
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
    }
    const abs = Math.abs(d);
    const sign = Math.sign(d);
    const x = abs === 0 ? 0 : sign * size * (s.centerGap + (abs - 1) * s.spacing);
    const z = abs === 0 ? 0 : -s.depth - (abs - 1) * s.depth * 0.35;
    const rot = abs === 0 ? 0 : -sign * s.rotation;
    const hidden = abs > s.visibleSides;
    return {
      width: size,
      marginLeft: -size / 2,
      transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${abs === 0 ? 1 : 0.92})`,
      zIndex: 100 - abs,
      opacity: hidden ? 0 : 1,
      filter: abs === 0 ? 'none' : `brightness(${s.sideBrightness})`,
      pointerEvents: hidden ? 'none' : 'auto',
      transition,
    };
  };

  const frame =
    variant === 'container'
      ? 'bg-[rgba(0,0,0,0.2)] border border-[rgba(212,165,116,0.2)] rounded-[14px] px-2 sm:px-4 pt-8 pb-6'
      : 'pt-4 pb-2';

  return (
    <div
      className={`relative w-full ${frame} ${className}`}
      // Pause while hovered with a mouse, or while keyboard-focused (not after a click/tap)
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={(e) => (e.target as HTMLElement).matches(':focus-visible') && setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="karusell"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        className="relative w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E] rounded-[10px] select-none touch-pan-y"
        style={{ height: size + reflectionPx + 24, perspective: size * 4 }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-3 cursor-pointer"
                style={itemStyle(i)}
                role="group"
                aria-roledescription="lysbilde"
                aria-label={`${i + 1} av ${count}: ${item.title}`}
                aria-hidden={Math.abs(i - active) > s.visibleSides}
                onClick={() => {
                  if (suppressClick.current) { suppressClick.current = false; return; }
                  if (isActive && item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
                  else goTo(i);
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  draggable={false}
                  className={`block w-full aspect-square object-cover rounded-[10px] ${
                    isActive
                      ? 'shadow-[0_25px_50px_-12px_rgba(229,184,126,0.35)] ring-1 ring-[rgba(229,184,126,0.5)]'
                      : 'shadow-[0_20px_25px_rgba(0,0,0,0.5)]'
                  }`}
                />
                {s.reflection && (
                  <div
                    aria-hidden
                    className="relative w-full overflow-hidden mt-[3px] rounded-b-[10px]"
                    style={{
                      height: reflectionPx,
                      maskImage: `linear-gradient(to bottom, rgba(0,0,0,${s.reflectionOpacity}) 0%, transparent 100%)`,
                      WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,${s.reflectionOpacity}) 0%, transparent 100%)`,
                    }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      draggable={false}
                      className="absolute top-0 left-0 w-full aspect-square object-cover rounded-[10px]"
                      style={{ transform: 'scaleY(-1)' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ArrowButton side="left" disabled={!canPrev} onClick={prev} top={12 + size / 2} />
        <ArrowButton side="right" disabled={!canNext} onClick={next} top={12 + size / 2} />
      </div>

      {children && (
        <div aria-live="polite" className="relative mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

function ArrowButton({ side, disabled, onClick, top }: { side: 'left' | 'right'; disabled: boolean; onClick: () => void; top: number }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Forrige utgivelse' : 'Neste utgivelse'}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={`absolute ${side === 'left' ? 'left-1 sm:left-3' : 'right-1 sm:right-3'} z-[200] -translate-y-1/2 flex items-center justify-center size-10 sm:size-12 rounded-full bg-[rgba(0,0,0,0.6)] border border-[rgba(212,165,116,0.35)] text-[#E5B87E] backdrop-blur-sm transition hover:bg-[rgba(0,0,0,0.85)] hover:border-[#E5B87E] disabled:opacity-25 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E]`}
      style={{ top }}
    >
      <Icon className="size-5 sm:size-6" />
    </button>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
