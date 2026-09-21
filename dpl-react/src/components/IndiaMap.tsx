import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import {
  INDIA_STATES,
  INDIA_VIEWBOX,
  type IndiaStateShape,
} from '../data/indiaStates';
import './IndiaMap.css';

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export interface IndiaMapProps {
  /**
   * Values to shade the map with (choropleth). Key by state `id` ("MH")
   * or by full `name` ("Maharashtra") — both are accepted.
   */
  values?: Record<string, number>;
  /** Colour ramp for `values`, low → high. */
  colorRange?: [string, string];
  /** Colour for states with no entry in `values`. */
  emptyColor?: string;
  /** Selected state id(s). Omit to let the map manage selection itself. */
  selected?: string | string[] | null;
  /** Allow more than one state to be selected at a time. */
  multiSelect?: boolean;
  onSelect?: (state: IndiaStateShape | null) => void;
  onHover?: (state: IndiaStateShape | null) => void;
  /** State labels: short codes, full names, or none. */
  labels?: 'none' | 'abbr' | 'name';
  /** Custom tooltip body. Return null to suppress the tooltip. */
  tooltip?: (state: IndiaStateShape, value: number | undefined) => ReactNode;
  /** Number formatter used by the default tooltip and legend. */
  formatValue?: (value: number) => string;
  /** Show the colour legend (only meaningful with `values`). */
  legend?: boolean;
  /** Wheel-zoom and drag-to-pan. */
  zoomable?: boolean;
  /** Accessible name for the figure. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ *
 * Colour helpers (no dependencies)
 * ------------------------------------------------------------------ */

type RGB = [number, number, number];

function parseColor(input: string): RGB {
  const hex = input.trim();
  if (hex.startsWith('#')) {
    const h =
      hex.length === 4
        ? hex
            .slice(1)
            .split('')
            .map((c) => c + c)
            .join('')
        : hex.slice(1);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = hex.match(/-?\d+(\.\d+)?/g);
  if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])];
  return [128, 128, 128];
}

function mix(a: RGB, b: RGB, t: number): string {
  // Interpolate through linear-light so mid-tones don't go muddy.
  const ch = (x: number, y: number) => {
    const lx = (x / 255) ** 2.2;
    const ly = (y / 255) ** 2.2;
    return Math.round(255 * (lx + (ly - lx) * t) ** (1 / 2.2));
  };
  return `rgb(${ch(a[0], b[0])}, ${ch(a[1], b[1])}, ${ch(a[2], b[2])})`;
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

const DEFAULT_RANGE: [string, string] = ['#dbeafe', '#1d4ed8'];

export default function IndiaMap({
  values,
  colorRange = DEFAULT_RANGE,
  emptyColor,
  selected,
  multiSelect = false,
  onSelect,
  onHover,
  labels = 'none',
  tooltip,
  formatValue = (v) => new Intl.NumberFormat('en-IN').format(v),
  legend = false,
  zoomable = false,
  ariaLabel = 'Map of India by state and union territory',
  className,
  style,
}: IndiaMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<IndiaStateShape | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [innerSelected, setInnerSelected] = useState<string[]>([]);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(
    null,
  );

  /* ---- selection (controlled or not) ---- */
  const isControlled = selected !== undefined;
  const selectedIds = useMemo(() => {
    const raw = isControlled ? selected : innerSelected;
    if (!raw) return new Set<string>();
    return new Set(Array.isArray(raw) ? raw : [raw]);
  }, [isControlled, selected, innerSelected]);

  /* ---- value lookup by id or by name ---- */
  const valueOf = useCallback(
    (s: IndiaStateShape) => values?.[s.id] ?? values?.[s.name],
    [values],
  );

  const [min, max] = useMemo(() => {
    if (!values) return [0, 0];
    const nums = INDIA_STATES.map(valueOf).filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v),
    );
    if (!nums.length) return [0, 0];
    return [Math.min(...nums), Math.max(...nums)];
  }, [values, valueOf]);

  const ramp = useMemo(
    () => [parseColor(colorRange[0]), parseColor(colorRange[1])] as const,
    [colorRange],
  );

  const fillFor = useCallback(
    (s: IndiaStateShape) => {
      const v = valueOf(s);
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        return emptyColor ?? undefined; // undefined → CSS decides
      }
      const t = max === min ? 1 : (v - min) / (max - min);
      return mix(ramp[0], ramp[1], t);
    },
    [valueOf, min, max, ramp, emptyColor],
  );

  /* ---- interaction ---- */
  const handleEnter = useCallback(
    (s: IndiaStateShape) => {
      setHovered(s);
      onHover?.(s);
    },
    [onHover],
  );

  const handleLeave = useCallback(() => {
    setHovered(null);
    onHover?.(null);
  }, [onHover]);

  const handleSelect = useCallback(
    (s: IndiaStateShape) => {
      const already = selectedIds.has(s.id);
      if (!isControlled) {
        setInnerSelected((prev) => {
          if (!multiSelect) return already ? [] : [s.id];
          return already ? prev.filter((id) => id !== s.id) : [...prev, s.id];
        });
      }
      onSelect?.(already && !multiSelect ? null : s);
    },
    [selectedIds, isControlled, multiSelect, onSelect],
  );

  const movePointer = useCallback((e: ReactPointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    setPointer({ x: e.clientX - box.left, y: e.clientY - box.top });
  }, []);

  /** Arrow keys jump to the nearest state in that direction. */
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<SVGPathElement>, s: IndiaStateShape) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(s);
        return;
      }
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const dir = dirs[e.key];
      if (!dir) return;
      e.preventDefault();

      let best: IndiaStateShape | null = null;
      let bestScore = Infinity;
      for (const other of INDIA_STATES) {
        if (other.id === s.id) continue;
        const dx = other.labelX - s.labelX;
        const dy = other.labelY - s.labelY;
        const along = dx * dir[0] + dy * dir[1];
        if (along <= 0) continue;
        const across = Math.abs(dx * dir[1] - dy * dir[0]);
        const score = along + across * 2.5; // prefer straight ahead
        if (score < bestScore) {
          bestScore = score;
          best = other;
        }
      }
      if (best) {
        const el = wrapRef.current?.querySelector<SVGPathElement>(
          `[data-state-id="${best.id}"]`,
        );
        el?.focus();
      }
    },
    [handleSelect],
  );

  /* ---- zoom & pan ---- */
  const onWheel = useCallback(
    (e: ReactWheelEvent<SVGSVGElement>) => {
      if (!zoomable) return;
      e.preventDefault();
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      const px = (e.clientX - box.left) / box.width;
      const py = (e.clientY - box.top) / box.height;
      setView((v) => {
        const k = Math.min(8, Math.max(1, v.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
        const w = INDIA_VIEWBOX.width;
        const h = INDIA_VIEWBOX.height;
        const cx = v.x + (w / v.k) * px;
        const cy = v.y + (h / v.k) * py;
        const x = cx - (w / k) * px;
        const y = cy - (h / k) * py;
        return clampView({ x, y, k });
      });
    },
    [zoomable],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!zoomable || view.k === 1) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    },
    [zoomable, view],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!drag.current) return;
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      const d = drag.current;
      const scaleX = INDIA_VIEWBOX.width / view.k / box.width;
      const scaleY = INDIA_VIEWBOX.height / view.k / box.height;
      setView((v) =>
        clampView({
          ...v,
          x: d.vx - (e.clientX - d.x) * scaleX,
          y: d.vy - (e.clientY - d.y) * scaleY,
        }),
      );
    },
    [view.k],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  useEffect(() => {
    if (!zoomable) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView({ x: 0, y: 0, k: 1 });
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [zoomable]);

  const viewBox = `${view.x} ${view.y} ${INDIA_VIEWBOX.width / view.k} ${
    INDIA_VIEWBOX.height / view.k
  }`;

  /* ---- tooltip content ---- */
  const tipNode: ReactNode = hovered
    ? tooltip
      ? tooltip(hovered, valueOf(hovered))
      : defaultTooltip(hovered, valueOf(hovered), formatValue)
    : null;

  return (
    <div
      ref={wrapRef}
      className={['india-map', zoomable ? 'india-map--zoomable' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onPointerMove={movePointer}
      onPointerLeave={handleLeave}
    >
      <svg
        className="india-map__svg"
        viewBox={viewBox}
        role="img"
        aria-label={ariaLabel}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g className="india-map__states">
          {INDIA_STATES.map((s) => {
            const isSelected = selectedIds.has(s.id);
            return (
              <path
                key={s.id}
                data-state-id={s.id}
                className={[
                  'india-map__state',
                  isSelected ? 'is-selected' : '',
                  hovered?.id === s.id ? 'is-hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                d={s.d}
                // Inline style (not the `fill` attribute) so it wins over the
                // stylesheet's default land colour.
                style={{ fill: fillFor(s) }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={
                  values
                    ? `${s.name}: ${
                        valueOf(s) === undefined
                          ? 'no data'
                          : formatValue(valueOf(s) as number)
                      }`
                    : s.name
                }
                onPointerEnter={() => handleEnter(s)}
                onFocus={() => handleEnter(s)}
                onBlur={handleLeave}
                onClick={() => handleSelect(s)}
                onKeyDown={(e) => handleKeyDown(e, s)}
              />
            );
          })}
        </g>

        {labels !== 'none' && (
          <g className="india-map__labels" aria-hidden="true">
            {INDIA_STATES.map((s) => (
              <text
                key={s.id}
                x={s.labelX}
                y={s.labelY}
                className="india-map__label"
                style={{ fontSize: `${(labels === 'abbr' ? 15 : 13) / view.k}px` }}
              >
                {labels === 'abbr' ? s.id : s.name}
              </text>
            ))}
          </g>
        )}
      </svg>

      {tipNode && (
        <div
          className="india-map__tooltip"
          role="status"
          style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}
        >
          {tipNode}
        </div>
      )}

      {legend && values && max > min && (
        <div className="india-map__legend">
          <span>{formatValue(min)}</span>
          <span
            className="india-map__legend-ramp"
            style={{
              background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})`,
            }}
          />
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function clampView(v: { x: number; y: number; k: number }) {
  const w = INDIA_VIEWBOX.width / v.k;
  const h = INDIA_VIEWBOX.height / v.k;
  return {
    k: v.k,
    x: Math.min(Math.max(v.x, 0), INDIA_VIEWBOX.width - w),
    y: Math.min(Math.max(v.y, 0), INDIA_VIEWBOX.height - h),
  };
}

function defaultTooltip(
  s: IndiaStateShape,
  value: number | undefined,
  format: (v: number) => string,
): ReactNode {
  return (
    <>
      <strong>{s.name}</strong>
      <span className="india-map__tooltip-meta">
        {value === undefined ? s.type : format(value)}
      </span>
    </>
  );
}

export { INDIA_STATES, INDIA_VIEWBOX };
export type { IndiaStateShape };
