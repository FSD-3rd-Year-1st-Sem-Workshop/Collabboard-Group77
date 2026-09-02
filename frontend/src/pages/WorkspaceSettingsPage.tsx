import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Trash2, Mail, Users, Loader2 } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import {
    getWorkspaceByIdApi,
    updateWorkspaceApi,
    deleteWorkspaceApi,
    getInvitationsApi,
    createInvitationApi,
    deleteInvitationApi,
    getWorkspaceMembersApi
} from '../api/workspaces';
import type { Workspace, WorkspaceInvitation } from '../types';

export function WorkspaceSettingsPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
    const [isAdminOrOwner, setIsAdminOrOwner] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Forms
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#2563EB');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!workspaceId) return;

        async function load() {
            setIsLoading(true);
            try {
                const [ws, mems, invs] = await Promise.all([
                    getWorkspaceByIdApi(workspaceId!),
                    getWorkspaceMembersApi(workspaceId!),
                    getInvitationsApi(workspaceId!)
                ]);

                const myMember = mems.find(m => m.userId === user?.id);
                if (myMember?.role !== 'owner' && myMember?.role !== 'admin') {
                    navigate(`/workspaces/${workspaceId}`);
                    return;
                }

                setIsAdminOrOwner(true);
                setWorkspace(ws);
                setInvitations(invs);
                setName(ws.name);
                setDescription(ws.description || '');
                setColor(ws.color || '#2563EB');
                setVisibility((ws.visibility as 'private' | 'public') || 'private');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load settings.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [workspaceId, user, navigate]);

    async function handleUpdateWorkspace(e: React.FormEvent) {
        e.preventDefault();
        if (!workspaceId) return;
        setIsSaving(true);
        try {
            const updated = await updateWorkspaceApi(workspaceId, { name, description, color, visibility });
            setWorkspace(updated);
            alert('Workspace saved successfully!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update workspace.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteWorkspace() {
        if (!workspaceId) return;
        if (!confirm('Are you SURE you want to delete this workspace? This action cannot be undone.')) return;
        try {
            await deleteWorkspaceApi(workspaceId);
            navigate('/dashboard');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete workspace.');
        }
    }

    async function handleInviteSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!workspaceId || !inviteEmail) return;
        setIsSaving(true);
        try {
            await createInvitationApi(workspaceId, inviteEmail, inviteRole);
            const updated = await getInvitationsApi(workspaceId);
            setInvitations(updated);
            setInviteEmail('');
            alert('Invitation sent!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to send invitation.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteInvitation(invitationId: string) {
        if (!workspaceId) return;
        try {
            await deleteInvitationApi(workspaceId, invitationId);
            setInvitations(prev => prev.filter(i => i.id !== invitationId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete invitation.');
        }
    }

    if (isLoading) {
        return (
            <DashboardShell>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
                </div>
            </DashboardShell>
        );
    }

    if (error || !workspace || !isAdminOrOwner) {
        return (
            <DashboardShell>
                <div className="flex flex-col items-center justify-center p-6 text-slate-300">
                    <p>{error || 'Access denied'}</p>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </DashboardShell>
        );
    }

    const availableColors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0284C7', '#DC2626'];

    return (
        <DashboardShell>
            <div className="min-h-full bg-[#0b1220] p-6 lg:p-8">
                <div className="mx-auto max-w-4xl">

                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary-400" />
                                Workspace Settings
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">Manage {workspace.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Settings Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-xl border border-white/10 bg-[#111b2f] p-6">
                                <h2 className="text-lg font-semibold text-slate-100 mb-4">General Details</h2>
                                <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Workspace Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-500/50 focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-500/50 focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Color Theme</label>
                                        <div className="flex items-center gap-3">
                                            {availableColors.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setColor(c)}
                                                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111b2f]' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Visibility</label>
                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value as any)}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-500/50 focus:bg-white/10"
                                        >
                                            <option value="private">Private</option>
                                            <option value="public">Public</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                                <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
                                <p className="text-sm text-slate-400 mb-4">
                                    Archiving or deleting a workspace will remove access for all members.
                                </p>
                                <Button
                                    variant="secondary"
                                    onClick={handleDeleteWorkspace}
                                    className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Workspace
                                </Button>
                            </div>
                        </div>

                        {/* Invitations Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-xl border border-white/10 bg-[#111b2f] p-6">
                                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
                                    <Mail className="h-4 w-4 text-primary-400" />
                                    Invite Members
                                </h2>
                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-500/50 focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-500/50 focus:bg-white/10"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSaving}>
                                        Send Invite
                                    </Button>
                                </form>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-[#111b2f] p-6">
                                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
                                    <Users className="h-4 w-4 text-primary-400" />
                                    Pending Invites
                                </h2>
                                {invitations.length === 0 ? (
                                    <p className="text-xs text-slate-500">No pending invitations.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {invitations.map(inv => (
                                            <li key={inv.id} className="group flex items-center justify-between rounded-lg border border-white/5 bg-[#1a2642] px-3 py-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-200">{inv.email}</p>
                                                    <p className="text-[10px] text-slate-500">{inv.role} • {inv.status}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteInvitation(inv.id)}
                                                    className="flex h-6 w-6 items-center justify-center rounded text-rose-400 opacity-0 transition hover:bg-rose-500/20 group-hover:opacity-100"
                                                    title="Cancel Invite"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
