import type { ReactNode} from 'react';
import {kanban} from 'lucide-react';

interface AuthLayoutProps {
    title : string;
    subtitle : string;
    children : ReactNode;
    footer : ReactNode;
}

export function AuthLayout({title , subtitle , children , footer} : AuthLayoutProps) {\
    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-3 flex items-center gap-2">
                        <Kanban className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
                        <span className="text-base font-semibold text-slate-900">CollabBoard</span>
                    </div>
                <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

        {children}

        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
    
    );
}

