import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CoverFlowItem {
  id: string;
  image: string;
  title: string;
  href?: string;
}

export interface CoverFlowSettings {
  /** `coverflow` = flat row with angled sides, `ring` = covers travel around a horizontal 3D circle. */
  mode: 'coverflow' | 'ring';
  /** Ring: space between neighbouring covers (1 = edge to edge, higher = more gap). Never below 1, so covers never intersect. */
  ringSpacing: number;
  /** Ring: minimum radius as a fraction of the available width (wider = more spread). */
  ringWidth: number;
  /** Ring: camera tilt in degrees – higher looks more down onto the circle. */
  ringTilt: number;
  /** Ring: max number of covers on the circle at once. With more items, the rest wait
   *  hidden at the back and slide in as the ring turns, so the circle keeps its shape. */
  ringSlots: number;
  /** Ring: cover size as a fraction of the available width – [mobile, desktop]. */
  ringSizeRatio: [number, number];
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
  /** Speed (px/s) of the glide when auto-advancing, measured at the cover's centre. 0 = use `duration`. */
  autoplaySpeed: number;
  /** Endless loop: after the last cover comes the first (and vice versa). */
  loop: boolean;
  /** Cover size as a fraction of the available width – [mobile, desktop]. */
  sizeRatio: [number, number];
  /** Min/max cover size in px. */
  minSize: number;
  maxSize: number;
}

export const defaultCoverFlowSettings: CoverFlowSettings = {
  mode: 'coverflow',
  ringSpacing: 1.04,
  ringWidth: 0.45,
  ringTilt: 4,
  ringSlots: 12,
  ringSizeRatio: [0.46, 0.22],
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
  autoplay: 6000,
  autoplaySpeed: 0,
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

  const isRing = s.mode === 'ring' && count > 2;
  const ratios = isRing ? s.ringSizeRatio : s.sizeRatio;
  const ratio = width < 640 ? ratios[0] : ratios[1];
  const size = Math.round(Math.min(s.maxSize, Math.max(s.minSize, width * ratio)));
  const reflectionPx = s.reflection ? Math.round(size * s.reflectionHeight) : 0;

  // Ring geometry
  const slots = Math.max(3, Math.min(count, s.ringSlots));
  const windowed = count > slots; // more items than places on the ring
  const step = 360 / slots;
  // Minimum radius where neighbouring covers sit edge to edge without cutting into each other
  // (the apothem of a regular polygon with `count` sides of length `size`).
  const minRingRadius = (size * Math.max(1, s.ringSpacing)) / (2 * Math.tan(Math.PI / slots));
  const radius = Math.max(minRingRadius, width * s.ringWidth);
  const tiltRad = (s.ringTilt * Math.PI) / 180;
  const ringLift = Math.round(radius * Math.sin(tiltRad) * 1.2 + 16); // room above for the back of the ring (top/bottom are never clipped)
  const coverTop = isRing ? 12 + ringLift : 12;

  // Continuous rotation counter so the ring always turns the short way, also across the seam
  const [turn, setTurn] = useState(active);
  useLayoutEffect(() => {
    setTurn((t) => {
      const cur = ((Math.round(t) % count) + count) % count;
      let delta = active - cur;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      return t + delta;
    });
  }, [active, count]);

  // Whether the latest change came from autoplay (slow glide) or the user (quick)
  // (changes made from outside, e.g. a "show latest" button, count as user moves)
  const [lastMove, setLastMove] = useState<{ index: number; auto: boolean }>({ index: -1, auto: false });
  const autoMove = lastMove.auto && lastMove.index === active;

  const goTo = useCallback(
    (index: number, auto = false) => {
      let next = index;
      if (s.loop) next = ((index % count) + count) % count;
      else next = Math.max(0, Math.min(count - 1, index));
      setLastMove({ index: next, auto });
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
    const t = window.setTimeout(() => goTo(active >= count - 1 ? 0 : active + 1, true), s.autoplay);
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

  // Distance the front cover travels in one step (arc on the ring, or the gap in coverflow)
  const stepDistance = isRing ? (radius * step * Math.PI) / 180 : size * s.centerGap;
  const ms = autoMove && s.autoplaySpeed > 0 ? Math.round((stepDistance / s.autoplaySpeed) * 1000) : s.duration;
  const easing = autoMove && s.autoplaySpeed > 0 ? 'cubic-bezier(0.45, 0, 0.55, 1)' : 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  const transition = reducedMotion
    ? 'none'
    : `transform ${ms}ms ${easing}, opacity ${ms}ms ease, filter ${ms}ms ease`;

  const ringRot = turn * step;
  const ringContainerStyle: CSSProperties = {
    transformStyle: 'preserve-3d',
    transformOrigin: `50% ${coverTop + size / 2}px`,
    transform: `translateY(${-radius * Math.sin(tiltRad)}px) translateZ(${-radius}px) rotateX(${-s.ringTilt}deg) rotateY(${-ringRot}deg)`,
    transition: reducedMotion ? 'none' : `transform ${ms}ms ${easing}`,
  };

  // Position of item i on the (unrolled) ring closest to the current turn
  const ringSlotOf = (i: number) => i + count * Math.round((turn - i) / count);
  const ringHidden = (i: number) => windowed && Math.abs(ringSlotOf(i) - turn) > Math.floor((slots - 1) / 2);

  const ringItemStyle = (i: number): CSSProperties => {
    const theta = ringSlotOf(i) * step;
    const hidden = ringHidden(i);
    // angle relative to the front, -180..180
    let phi = (((theta - ringRot) % 360) + 540) % 360 - 180;
    const facing = (Math.cos((phi * Math.PI) / 180) + 1) / 2; // 1 = front, 0 = back
    const isFront = i === active;
    return {
      width: size,
      marginLeft: -size / 2,
      top: coverTop,
      // Place on the circle facing outwards: covers turn edge-on at the sides and show
      // their (mirrored) back when they pass behind.
      transform: `rotateY(${theta}deg) translateZ(${radius}px)`,
      backfaceVisibility: 'visible',
      filter: isFront ? 'none' : `brightness(${(0.35 + 0.55 * Math.pow(facing, 1.2)).toFixed(3)})`,
      opacity: hidden ? 0 : 1,
      pointerEvents: hidden ? 'none' : 'auto',
      // The container does the turning; items only fade. Their own position only changes when a
      // hidden item hops to its new place at the back, which must happen instantly.
      transition: reducedMotion ? 'none' : `opacity ${ms}ms ease, filter ${ms}ms ease`,
    };
  };

  const itemStyle = (i: number): CSSProperties => {
    if (isRing) return ringItemStyle(i);
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
        className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-[#E5B87E] rounded-[10px] select-none touch-pan-y"
        style={{
          height: coverTop + size + reflectionPx + (isRing ? 32 : 12),
          // Clip sideways only, never top/bottom, so covers at the back of the ring are never cut
          overflowX: 'clip',
          overflowY: 'visible',
          perspective: isRing ? radius * 1.8 : size * 4,
          perspectiveOrigin: isRing ? `50% ${coverTop + size / 2}px` : undefined,
        }}
      >
        <div className="absolute inset-0" style={isRing ? ringContainerStyle : { transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <div
                key={item.id}
                className={`absolute left-1/2 cursor-pointer ${isRing ? '' : 'top-3'}`}
                style={itemStyle(i)}
                role="group"
                aria-roledescription="lysbilde"
                aria-label={`${i + 1} av ${count}: ${item.title}`}
                aria-hidden={isRing ? ringHidden(i) : Math.abs(i - active) > s.visibleSides}
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

        <ArrowButton side="left" disabled={!canPrev} onClick={prev} top={coverTop + size / 2} />
        <ArrowButton side="right" disabled={!canNext} onClick={next} top={coverTop + size / 2} />
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
