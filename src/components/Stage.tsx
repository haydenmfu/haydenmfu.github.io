import type { CSSProperties, ReactNode } from 'react';
import type { Region } from '../data/objectRegions';

// Must match the stage-mode media query in desk.css.
export const STAGE_QUERY = '(min-width: 1000px) and (min-aspect-ratio: 13/10)';
export const inStageMode = () => window.matchMedia(STAGE_QUERY).matches;
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Art that covers the viewport. Overlays are placed in percentages of the art, so they stay
   on their object at any window size; the focus point decides which edges get cropped first,
   and maxLeft/maxTop (fractions of the art) cap how much the left and top edges may lose. */
export function Stage({ ratio, focus = [0.5, 0.5], maxLeft = 1, maxTop = 1, className, children }: { ratio: number; focus?: [number, number]; maxLeft?: number; maxTop?: number; className: string; children: ReactNode }) {
  return <div className="stage-viewport"><div className={`stage ${className}`} style={{ '--ar': ratio, '--fx': focus[0], '--fy': focus[1], '--lx': maxLeft, '--ly': maxTop } as CSSProperties}>{children}</div></div>;
}

/* The picked-up object's footprint on the art. Clicks outside every region count as the desk. */
export function ObjectRegion({ region }: { region: Region }) {
  return <div className="object-region" data-object="" aria-hidden="true" style={{ '--rx': `${region.x}%`, '--ry': `${region.y}%`, '--rw': `${region.w}%`, '--rh': `${region.h}%` } as CSSProperties} />;
}
