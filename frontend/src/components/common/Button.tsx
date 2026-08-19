import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20',
  secondary: 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10',
  ghost: 'text-slate-400 hover:bg-white/10 hover:text-slate-100',
  danger: 'bg-rose-500/10 text-rose-300 border border-rose-400/20 hover:bg-rose-500/20',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
