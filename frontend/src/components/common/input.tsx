import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100',
          'placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error && 'border-rose-300 focus:ring-rose-500 focus:border-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
