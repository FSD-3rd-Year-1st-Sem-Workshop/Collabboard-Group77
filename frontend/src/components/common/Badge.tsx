import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'slate' | 'indigo' | 'rose' | 'amber' | 'emerald';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  indigo: 'bg-primary-50 text-primary-700',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
};

export function Badge({ children, tone = 'slate', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
