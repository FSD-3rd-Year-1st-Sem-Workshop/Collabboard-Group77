import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

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
          'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white',
          'placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error && 'border-red-400 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}