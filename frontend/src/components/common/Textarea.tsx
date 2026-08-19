import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100',
          'placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        {...props}
      />
    </div>
  );
}
