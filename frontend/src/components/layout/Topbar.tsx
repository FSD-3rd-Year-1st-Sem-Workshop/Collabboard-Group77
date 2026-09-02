import { useRef, useState, type ReactNode } from 'react';
import { Bell, HelpCircle, ChevronDown, Search, CalendarDays } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';

interface TopbarProps {
  /** Optional right-aligned slot rendered before the icon cluster (e.g. page-specific actions). */
  actions?: ReactNode;
  boardDate?: string;
}

export function Topbar({ actions ,boardDate }: TopbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const displayDate = boardDate 
    ? new Date(boardDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (!user) return null;

  return (
    <header className="flex items-center gap-4 border-b border-white/5 bg-[#101a2e] px-6 py-3">
      <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
        <span>Workspace</span><span className="text-slate-700">/</span><CalendarDays className="h-3.5 w-3.5" /><span className="text-slate-300"> {displayDate}</span>
      </div>
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tasks..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <button
          aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-slate-300 hover:bg-white/10"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button
          aria-label="Help"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-slate-300 hover:bg-white/10"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <div ref={menuRef} className="relative ml-1">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10"
          >
            <Avatar user={user} size="sm" />
            <span className="text-sm font-medium text-slate-200">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#182541] shadow-2xl">
              <button
                onClick={logout}
                className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-red-400"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
