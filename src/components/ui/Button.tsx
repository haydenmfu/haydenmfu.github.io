import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

function buttonClasses(variant: 'solid' | 'outline', size: 'sm' | 'md' | 'lg', className = '') {
  const base = `inline-flex items-center gap-2 cursor-pointer font-display font-semibold tracking-wide transition-all duration-150 ${sizeClasses[size]}`;
  const variantClass = variant === 'solid' ? 'btn-invert' : 'btn-outline';

  return `${base} ${variantClass} ${className}`;
}

export function Button({ variant = 'solid', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'solid', size = 'md', children, className = '', ...props }: ButtonLinkProps) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </a>
  );
}
