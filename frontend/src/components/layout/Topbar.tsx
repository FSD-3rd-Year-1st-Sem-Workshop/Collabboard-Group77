import { useRef, useState, useEffect, type ReactNode } from 'react';
import { Bell, HelpCircle, ChevronDown, Search, CalendarDays, Check, X, Loader2 } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';

import { getMyInvitations, acceptInvitation, declineInvitation, type Invitation } from '../../api/invitations';

interface TopbarProps {
  actions?: ReactNode;
  boardDate?: string;
}

export function Topbar({ actions, boardDate }: TopbarProps) {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const data = await getMyInvitations();
        setInvitations(data || []);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const handleAccept = async (id: string) => {
    try {
      await acceptInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept", error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      window.location.reload();
    } catch (error) {
      console.error("Failed to decline", error);
    }
  };

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
        <div ref={notificationsRef} className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 text-slate-300 hover:bg-white/10"
          >
            <Bell className="h-[18px] w-[18px]" />
            {invitations.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#182541] shadow-2xl">
              <div className="border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
              </div>
              
              <div className="max-h-80 overflow-y-auto p-2">
                {invitations.length === 0 && !loading ? (
                   <div className="p-4 text-center text-sm text-slate-400">No new notifications.</div>
                ) : (
                  invitations.map((invite) => {
                    const inviterDisplay = typeof invite.invitedBy === 'object' 
                      ? (invite.invitedBy?.name || invite.invitedBy?.email || 'Someone') 
                      : invite.invitedBy;

                    const workspaceDisplay = typeof invite.workspace === 'object' 
                      ? (invite.workspace?.name || 'a workspace') 
                      : invite.workspace;

                    return (
                      <div key={invite.id} className="mb-2 rounded-lg border border-white/5 bg-white/5 p-3 last:mb-0">
                        <p className="text-sm text-slate-300">
                          <span className="font-semibold text-slate-100">{inviterDisplay}</span> invited you to join <span className="font-semibold text-slate-100">{workspaceDisplay}</span> as a <span className="font-semibold text-slate-100">{invite.role}</span>.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAccept(invite.id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-500/20 py-1.5 text-xs font-medium text-primary-400 transition-colors hover:bg-primary-500 hover:text-white"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleDecline(invite.id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-500/10 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" /> Decline
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

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