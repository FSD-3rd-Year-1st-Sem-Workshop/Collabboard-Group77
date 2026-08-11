import { useRef, useState, type ReactNode } from 'react';
import { Bell, HelpCircle, ChevronDown, Search } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';

interface TopbarProps {
  /** Optional right-aligned slot rendered before the icon cluster (e.g. page-specific actions). */
  actions?: ReactNode;
}

export function Topbar({ actions }: TopbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  if (!user) return null;

  return (
    <header className="flex items-center gap-4 border-b border-slate-100 bg-[#161B22] px-6 py-3">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-400 focus:bg-[#0c182b] focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-700"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-700"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <div ref={menuRef} className="relative ml-1">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-700"
          >
            <Avatar user={user} size="sm" />
            <span className="text-sm font-medium text-amber-400">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border-2 border-white bg-primary-700 shadow-lg">
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
