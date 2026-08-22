import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: ReactNode;
  topbarActions?: ReactNode;
}

/** Two-column app shell (fixed sidebar + scrollable content) shared by every
 * authenticated page, so pages only need to render what's inside the frame. */
export function DashboardShell({ children, topbarActions }: DashboardShellProps) {
  return (
    <div className="app-shell flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar actions={topbarActions} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
