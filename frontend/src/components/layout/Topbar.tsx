import { useRef, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, ChevronDown, Search, CalendarDays } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { getMyInvitations } from '../../api/invitations';

interface TopbarProps {
  actions?: ReactNode;
  boardDate?: string;
}

export function Topbar({ actions, boardDate }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getMyInvitations()
      .then((data) => setInvitationCount((data || []).length))
      .catch(() => {/* silent — badge just won't show */});
  }, [user]);

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
          id="notifications-btn"
          aria-label="Notifications"
          onClick={() => navigate('/invitations')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-slate-300 hover:bg-white/10"
        >
          <Bell className="h-[18px] w-[18px]" />
          {invitationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {invitationCount > 9 ? '9+' : invitationCount}
            </span>
          )}
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