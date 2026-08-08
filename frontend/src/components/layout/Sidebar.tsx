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
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#0c182b] bg-[#0c182b]">
      <div className="flex items-center gap-2 px-6 py-5">
        <Kanban className="h-5 w-5 text-primary-400" strokeWidth={2.5} />
        <span className="text-base font-semibold text-slate-100">CollabBoard</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-300 hover:bg-blue-200 hover:text-slate-900'
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-100 border-2 transition-colors hover:bg-red-400 hover:text-slate-900"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
