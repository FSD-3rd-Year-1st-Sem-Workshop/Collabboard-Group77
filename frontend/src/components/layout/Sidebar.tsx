import { NavLink } from 'react-router-dom';
import { KanbanSquare, Star, Activity, Settings, LogOut, Kanban } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

// Note: the wireframe lists "Dashboard" and "My Boards" as separate items,
// but both point at the same boards grid in this mock build, so they're
// merged into one link here to avoid two nav items fighting over the same
// active state. Split them again once a distinct dashboard/overview page
// exists.
const navItems = [
  { to: '/dashboard', label: 'My Boards', icon: KanbanSquare },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-[#0d1729]">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
          <img src="/favicon_cb.png" alt="logo" />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-100">CollabBoard</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-500/15 text-primary-300 shadow-[inset_3px_0_0_#4f83ff]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
