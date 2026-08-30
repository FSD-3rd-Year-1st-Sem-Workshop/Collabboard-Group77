import { useEffect, useState, type FormEvent } from 'react';
import { LayoutGrid } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { authFetch } from '../utils/authFetch';
import { useAuth } from '../hooks/useAuth';
import { useBoards } from '../hooks/useBoards';
import { Input } from '../components/common/input';
import { Modal } from '../components/common/Modal';


type DashboardWorkspace = {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  color?: string | null;
  visibility?: string;
  role?: string;
  memberCount?: number;
  boardCount?: number;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<DashboardWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {boards, addBoard} = useBoards();
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  function handleCreateBoard(event: FormEvent){
    event.preventDefault();
    if(!newBoardName.trim())return;
    addBoard(newBoardName.trim());
    setNewBoardName('');
    setIsCreating(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await authFetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`);

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.message || 'Failed to load your workspaces.');
        }

        const payload = await response.json();

        if (!cancelled) {
          setWorkspaces(payload?.data?.workspaces ?? []);
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to fetch your workspaces.');
          setWorkspaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell>
      <div className="min-h-full bg-[#0b1220] p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-400">Workspace overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">My Workspaces</h1>
            <p className="mt-2 text-sm text-slate-500">
              {user?.name ? `Welcome back, ${user.name}.` : 'Welcome back.'} Your spaces are shown below.
            </p>
          </div>
          <Button type="button" onClick={() => setIsCreating(true)} className="self-start sm:self-auto">
            New Workspace
          </Button>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-[#111b2f] p-6 text-slate-300">
            Loading your workspaces...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!isLoading && !error && workspaces.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="group relative rounded-2xl border border-white/10 bg-[#151f36] p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-primary-950/30"
              >
                <div
                  className="mb-3 flex h-24 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10"
                  style={{ background: workspace.color || '#2563EB' }}
                >
                  <LayoutGrid className="h-8 w-8 text-white/80" strokeWidth={1.5} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{workspace.name}</p>
                    {workspace.visibility && (
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        {workspace.visibility}
                      </p>
                    )}
                  </div>
                  {workspace.role && (
                    <span className="rounded-full bg-primary-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary-300">
                      {workspace.role}
                    </span>
                  )}
                </div>

                {workspace.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-300">{workspace.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{workspace.memberCount ?? 0} members</span>
                  <span>{workspace.boardCount ?? 0} boards</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && workspaces.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No workspaces yet"
            description="You are not in any active workspaces right now."
          />
        )}
      </div>

      {isCreating && (
        <Modal title="Create New Board" onClose={() => setIsCreating(false)}>
          <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Board</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardShell>
  );
}
