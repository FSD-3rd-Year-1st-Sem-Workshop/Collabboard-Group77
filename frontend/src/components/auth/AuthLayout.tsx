import type { ReactNode } from 'react';


interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080f1d] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111d33] p-8 shadow-2xl shadow-black/30">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <img src="/favicon_cb.png" className='w-10 h-10'/>
            <span className="text-base font-semibold text-white">
              CollabBoard
            </span>
          </div>

          <h1 className="text-lg font-semibold text-slate-100">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-slate-500">
          {footer}
        </p>
      </div>
    </div>
  );
}