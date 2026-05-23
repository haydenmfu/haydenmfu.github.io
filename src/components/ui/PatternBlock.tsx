import type { ReactNode } from 'react';

type Pattern = 'halftone' | 'halftone-lg' | 'checker' | 'diagonal' | 'dot-grid' | 'plus';

interface PatternBlockProps {
  pattern: Pattern;
  className?: string;
  opacity?: number;
  children?: ReactNode;
}

export function PatternBlock({ pattern, className = '', opacity = 0.12, children }: PatternBlockProps) {
  return (
    <div
      className={`pattern-${pattern} ${className}`}
      style={{ opacity }}
    >
      {children}
    </div>
  );
}
