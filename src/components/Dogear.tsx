import { useId } from 'react';

/* A folded page corner, drawn in a 100×100 box whose outer corner sits exactly on the page corner.
   The revealed triangle fades from the flap's shadow back into the paper colour, so only the curled
   flap reads as a shape; the page edge is redrawn along the two outer sides so it stays unbroken.
   Colours come from --dogear-page, --dogear-shade, --dogear-flap and --dogear-edge. */
export default function Dogear({ side = 'right', radius = 14 }: { side?: 'right' | 'left'; radius?: number }) {
  const shade = useId();
  const r = radius;
  return <svg className={`dogear dogear-${side}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={shade} x1="0.5" y1="0.5" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--dogear-shade)' }} />
        <stop offset="0.5" style={{ stopColor: 'var(--dogear-page)' }} />
      </linearGradient>
    </defs>
    <g transform={side === 'left' ? 'matrix(-1 0 0 1 100 0)' : undefined}>
      <path className="dogear-under" fill={`url(#${shade})`} d={`M0 100 L100 0 V${100 - r} Q100 100 ${100 - r} 100 Z`} />
      <path className="dogear-edge" d={`M100 0 V${100 - r} Q100 100 ${100 - r} 100 H0`} />
      <path className="dogear-flap" d="M0 100 L100 0 C64 9 28 8 10 10 C8 28 9 64 0 100 Z" />
    </g>
  </svg>;
}
