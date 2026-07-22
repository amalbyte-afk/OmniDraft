import { useRef, useState, useCallback, useEffect } from 'react';
import './OptionWheel.css';

const DEFAULT_ITEMS = [
  'Ambient',
  'House',
  'Techno',
  'Jazz',
  'Lo-Fi',
  'Synthwave',
  'Trance',
  'Funk',
  'Disco',
  'Hip-Hop',
  'Chillwave',
  'Drum & Bass',
];

interface OptionWheelProps {
  items?: string[];
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  onItemClick?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: 'left' | 'right';
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  soundUrl?: string;
  soundVolume?: number;
  className?: string;
}

export default function OptionWheel({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  onItemClick,
  textColor = 'rgba(255, 255, 255, 0.55)',
  activeColor = '#FF4654',
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = '',
}: OptionWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<Record<string, unknown>>({});
  const onChangeRef = useRef(onChange);
  const onItemClickRef = useRef(onItemClick);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx =
    typeof window !== 'undefined'
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;

  onChangeRef.current = onChange;
  onItemClickRef.current = onItemClick;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current as Record<string, unknown>;
    const tau = Math.max((cfg.smoothing as number), 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count as number;
    const mirror = cfg.side === 'right' ? -1 : 1;
    const tiltRad = ((cfg.tilt as number) * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? (cfg.rowH as number) / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if ((cfg.loop as boolean) && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * (cfg.rowH as number);
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * (cfg.curve as number);
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(
        Math.max(cfg.minOpacity as number, 1 - dist * (cfg.fade as number)),
      );
      el.style.filter =
        (cfg.blur as number) > 0
          ? `blur(${(dist * (cfg.blur as number)).toFixed(2)}px)`
          : 'none';
      el.style.setProperty(
        '--ow-p',
        Math.max(0, 1 - Math.min(dist, 1)).toFixed(4),
      );
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const playTick = useCallback(() => {
    const cfg = cfgRef.current as Record<string, unknown>;
    const url = cfg.soundUrl as string;
    const vol = cfg.soundVolume as number;
    if (!url) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== url) {
      audioRef.current = new Audio(url);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = url;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(vol, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current as Record<string, unknown>;
      let v = value;
      const count = cfg.count as number;
      if (!(cfg.loop as boolean))
        v = Math.min(Math.max(v, 0), Math.max(count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % count) + count) % count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        (onChangeRef.current as ((i: number, item: string) => void) | undefined)?.(idx, (cfg.items as string[])[idx]);
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current as Record<string, unknown>;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / (cfg.rowH as number)));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(
        () => applyTarget(targetRef.current, true),
        140,
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!(cfgRef.current as Record<string, unknown>).draggable) return;
    dragRef.current = {
      y: e.clientY,
      start: targetRef.current,
      id: e.pointerId,
    };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current)
        applyTarget(
          drag.start - dy / ((cfgRef.current as Record<string, unknown>).rowH as number),
          false,
        );
    },
    [applyTarget],
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current as Record<string, unknown>;
      const cur = targetRef.current;
      const count = cfg.count as number;
      let d = index - (((cur % count) + count) % count);
      if ((cfg.loop as boolean) && count > 1) {
        if (d > count / 2) d -= count;
        else if (d < -count / 2) d += count;
      }
      applyTarget(cur + d, true);
      onItemClickRef.current?.(index, (cfg.items as string[])[index]);
    },
    [applyTarget],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta: number | null = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget],
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`option-wheel${side === 'right' ? ' option-wheel--right' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={`option-wheel__item${selectedIndex === index ? ' option-wheel__item--selected' : ''}`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
