import { useEffect, useState, type FormEvent } from 'react';
import { LayoutGrid, Plus, CheckCircle2, Clock, Layers, Users, FolderKanban } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/input';
import { Modal } from '../components/common/Modal';
import { getDashboardApi } from '../api/dashboard';
import { createWorkspaceApi, getWorkspacesApi } from '../api/workspaces';
import type { DashboardSummary, Workspace } from '../types';
import { useNavigate } from 'react-router-dom';

const WORKSPACE_COLORS = [
  { label: 'Blue', hex: '#2563EB' },
  { label: 'Indigo', hex: '#4F46E5' },
  { label: 'Purple', hex: '#7C3AED' },
  { label: 'Pink', hex: '#DB2777' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Amber', hex: '#D97706' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for Create Workspace
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Try dashboard summary API first
      try {
        const dashData = await getDashboardApi();
        if (dashData?.workspaces) {
          setWorkspaces(dashData.workspaces);
        }
        if (dashData?.summary) {
          setSummary(dashData.summary);
        }
      } catch {
        // Fallback to fetch workspaces directly if /api/dashboard endpoint is missing
        const wsList = await getWorkspacesApi();
        setWorkspaces(wsList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch dashboard workspaces.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleCreateWorkspace(event: FormEvent) {
    event.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Workspace name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createWorkspaceApi({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        visibility,
      });

      if (created) {
        setWorkspaces((prev) => [created, ...prev]);
      } else {
        await loadDashboardData();
      }

      // Reset form & close modal
      setName('');
      setDescription('');
      setSelectedColor('#2563EB');
      setVisibility('private');
      setIsCreatingWorkspace(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create workspace.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="min-h-full bg-[#0b1220] p-6 md:p-8">
        {/* Header section */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-400">Workspace overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">My Workspaces</h1>
            <p className="mt-2 text-sm text-slate-400">
              {user?.name ? `Welcome back, ${user.name}.` : 'Welcome back.'} Manage your team projects and Kanban spaces.
            </p>
          </div>
          <Button type="button" onClick={() => setIsCreatingWorkspace(true)} className="self-start sm:self-auto flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {/* Dashboard summary stats if available */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151f36] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.workspaceCount ?? workspaces.length}</p>
                <p className="text-xs text-slate-400">Total Workspaces</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151f36] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.assignedTaskCount ?? 0}</p>
                <p className="text-xs text-slate-400">Assigned Tasks</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151f36] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.overdueTaskCount ?? 0}</p>
                <p className="text-xs text-slate-400">Overdue Tasks</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-[#111b2f] p-8 text-center text-slate-300">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent mb-2"></div>
            <p className="text-sm">Loading workspaces...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Workspaces list */}
        {!isLoading && !error && workspaces.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => navigate(`/boards/${workspace.id}`)}
                className="group relative cursor-pointer rounded-2xl border border-white/10 bg-[#151f36] p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-primary-400/50 hover:shadow-primary-950/40"
              >
                <div
                  className="mb-4 flex h-24 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-[1.02]"
                  style={{ background: workspace.color || '#2563EB' }}
                >
                  <LayoutGrid className="h-9 w-9 text-white/90" strokeWidth={1.5} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-primary-300 transition-colors">
                      {workspace.name}
                    </h3>
                    {workspace.visibility && (
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {workspace.visibility}
                      </span>
                    )}
                  </div>
                  {workspace.role && (
                    <span className="rounded-full bg-primary-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-300 border border-primary-500/30">
                      {workspace.role}
                    </span>
                  )}
                </div>

                {workspace.description && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-300">{workspace.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    {workspace.memberCount ?? 1} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3.5 w-3.5 text-slate-500" />
                    {workspace.boardCount ?? 1} boards
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && workspaces.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No workspaces yet"
            description="Create your first workspace to start collaborating on tasks and projects."
            action={
              <Button type="button" onClick={() => setIsCreatingWorkspace(true)} className="mt-4">
                Create Workspace
              </Button>
            }
          />
        )}
      </div>

      {/* Create Workspace Modal */}
      {isCreatingWorkspace && (
        <Modal title="Create New Workspace" onClose={() => setIsCreatingWorkspace(false)}>
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
            <Input
              id="workspace-name"
              label="Workspace Name *"
              placeholder="e.g. Software Engineering Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label htmlFor="workspace-description" className="mb-1.5 block text-xs font-medium text-slate-300">
                Description
              </label>
              <textarea
                id="workspace-description"
                rows={3}
                placeholder="Brief description of the workspace goal or project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">Theme Color</label>
              <div className="flex items-center gap-3">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      selectedColor === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#182541] scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                    visibility === 'private'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Private</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">Only invited members can view</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                    visibility === 'public'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Public</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">Visible to all workspace members</div>
                </button>
              </div>
            </div>

            {formError && <p className="text-xs text-rose-400">{formError}</p>}

            <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsCreatingWorkspace(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardShell>
  );
}
