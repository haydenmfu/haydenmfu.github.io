import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ variant = 'solid', size = 'md', children, className = '', ...props }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const base = `inline-flex items-center gap-2 cursor-pointer font-display font-semibold tracking-wide transition-all duration-150 ${sizeClasses[size]}`;
  const variantClass = variant === 'solid' ? 'btn-invert' : 'btn-outline';

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
