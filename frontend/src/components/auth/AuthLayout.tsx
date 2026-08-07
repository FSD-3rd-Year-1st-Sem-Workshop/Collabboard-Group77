import type { ReactNode } from 'react';
import { Kanban } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <Kanban className="h-5 w-5 text-blue-400" strokeWidth={2.5} />
            <span className="text-base font-semibold text-white">
              CollabBoard
            </span>
          </div>

          <h1 className="text-lg font-semibold text-white">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {subtitle}
          </p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-slate-400">
          {footer}
        </p>
      </div>
    </div>
  );
}