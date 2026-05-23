import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  slant?: boolean;
}

export function Badge({ children, variant = 'default', slant = true }: BadgeProps) {
  const base = 'label-strip';
  const variantClass = variant === 'accent' ? 'label-strip-accent' : '';
  const slantClass = slant ? '' : 'label-strip-reverse';

  if (variant === 'outline') {
    return (
      <span className="inline-block border-2 border-ink font-display text-xs font-bold uppercase tracking-widest px-3 py-1 text-ink">
        {children}
      </span>
    );
  }

  return (
    <span className={`${base} ${variantClass} ${slantClass}`}>
      {children}
    </span>
  );
}
