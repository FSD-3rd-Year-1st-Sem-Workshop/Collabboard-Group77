import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {ArrowLeft,LayoutGrid,Plus, Settings, Users, FolderKanban, Loader2, MoreHorizontal, ShieldCheck, Crown, User as UserIcon,
    Trash2, } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { getWorkspaceByIdApi, getWorkspaceMembersApi, updateMemberRoleApi, removeMemberApi,
} from '../api/workspaces';
import type { Workspace, WorkspaceMember } from '../types';

function getInitials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const ROLE_COLORS = {
    owner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    admin: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    member: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const ROLE_ICONS = {
    owner: Crown,
    admin: ShieldCheck,
    member: UserIcon,
};

export function WorkspacePage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // active user's role inside this workspace
    const myMember = members.find((m) => m.userId === user?.id);
    const isAdminOrOwner = myMember?.role === 'owner' || myMember?.role === 'admin';

    useEffect(() => {
        if (!workspaceId) return;

        async function load() {
            setIsLoading(true);
            setError('');
            try {
                const [ws, mems] = await Promise.all([
                    getWorkspaceByIdApi(workspaceId!),
                    getWorkspaceMembersApi(workspaceId!),
                ]);
                setWorkspace(ws);
                setMembers(mems);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load workspace.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [workspaceId]);

    // close dropdown when clicking outside
    useEffect(() => {
        function handleClick() { setOpenMenuId(null); }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    async function handleRoleChange(memberId: string, userId: string, newRole: string) {
        if (!workspaceId) return;
        setActionLoading(memberId);
        try {
            await updateMemberRoleApi(workspaceId, userId, newRole);
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: newRole as WorkspaceMember['role'] } : m))
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update role.');
        } finally {
            setActionLoading(null);
            setOpenMenuId(null);
        }
    }

    async function handleRemoveMember(memberId: string, userId: string) {
        if (!workspaceId) return;
        if (!confirm('Remove this member from the workspace?')) return;
        setActionLoading(memberId);
        try {
            await removeMemberApi(workspaceId, userId);
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove member.');
        } finally {
            setActionLoading(null);
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

    if (error || !workspace) {
        return (
            <DashboardShell>
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                    <EmptyState
                        icon={LayoutGrid}
                        title="Workspace not found"
                        description={error || 'It may have been archived or you may not have access.'}
                    />
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </DashboardShell>
        );
    }

    // render 
    return (
        <DashboardShell>
            <div className="min-h-full bg-[#0b1220]">

                {/* Page header  */}
                <div
                    className="relative flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5"
                    style={{ background: `linear-gradient(135deg, ${workspace.color ?? '#2563EB'}22 0%, transparent 60%)` }}
                >
                    {/* Left: back + title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            aria-label="Back to dashboard"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>

                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: workspace.color ?? '#2563EB' }}
                        >
                            <LayoutGrid className="h-5 w-5 text-white" strokeWidth={1.5} />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold text-slate-100">{workspace.name}</h1>
                            {workspace.description && (
                                <p className="mt-0.5 text-xs text-slate-400">{workspace.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Right: meta + settings */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {members.length} member{members.length !== 1 ? 's' : ''}
                            </span>
                            {workspace.visibility && (
                                <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                                    {workspace.visibility}
                                </span>
                            )}
                        </div>

                        {isAdminOrOwner && (
                            <Button
                                variant="secondary"
                                onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
                                className="flex items-center gap-1.5 text-xs"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                Settings
                            </Button>
                        )}
                    </div>
                </div>

                {/*  Two-column body   */}
                <div className="flex gap-6 p-6">

                    {/*  Boards section (main)  */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                                <FolderKanban className="h-4 w-4 text-primary-400" />
                                Boards
                            </h2>
                            {isAdminOrOwner && (
                                <Button
                                    className="flex items-center gap-1.5 text-xs"
                                    // Board creation will be wired up in the next sprint
                                    onClick={() => alert('Board creation coming soon!')}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    New Board
                                </Button>
                            )}
                        </div>

                        {/* Empty boards placeholder — real board list will go here */}
                        <div className="rounded-2xl border border-white/10 bg-[#111b2f] p-8 text-center">
                            <EmptyState
                                icon={FolderKanban}
                                title="No boards yet"
                                description="Create a board to start organizing tasks in columns."
                            />
                        </div>
                    </div>

                    {/* ─ Members sidebar  */}
                    <div className="w-72 flex-shrink-0">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                            <Users className="h-4 w-4 text-primary-400" />
                            Members
                            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                                {members.length}
                            </span>
                        </h2>

                        <ul className="flex flex-col gap-2">
                            {members.map((member) => {
                                const RoleIcon = ROLE_ICONS[member.role] ?? UserIcon;
                                const isMenuOpen = openMenuId === member.id;
                                const isMe = member.userId === user?.id;
                                const isOwner = member.role === 'owner';
                                const canManage = isAdminOrOwner && !isOwner && !isMe;

                                return (
                                    <li
                                        key={member.id}
                                        className="group relative flex items-center gap-3 rounded-xl border border-white/5 bg-[#151f36] px-3 py-2.5 transition hover:border-white/10"
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                            style={{ backgroundColor: stringToColor(member.name) }}
                                        >
                                            {getInitials(member.name)}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-100">
                                                {member.name}
                                                {isMe && <span className="ml-1.5 text-[10px] text-slate-500">(you)</span>}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-400">{member.email}</p>
                                        </div>

                                        {/* Role badge */}
                                        <span
                                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_COLORS[member.role]}`}
                                        >
                                            <RoleIcon className="h-2.5 w-2.5" />
                                            {member.role}
                                        </span>

                                        {/* Dropdown trigger for admin actions */}
                                        {canManage && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(isMenuOpen ? null : member.id);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-slate-300"
                                                    aria-label="Member options"
                                                    disabled={actionLoading === member.id}
                                                >
                                                    {actionLoading === member.id
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <MoreHorizontal className="h-3.5 w-3.5" />}
                                                </button>

                                                {isMenuOpen && (
                                                    <div
                                                        className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-white/10 bg-[#1a2642] py-1 shadow-xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* Role change options */}
                                                        {(['admin', 'member'] as const)
                                                            .filter((r) => r !== member.role)
                                                            .map((role) => (
                                                                <button
                                                                    key={role}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
                                                                    onClick={() => handleRoleChange(member.id, member.userId, role)}
                                                                >
                                                                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                                                                    Make {role}
                                                                </button>
                                                            ))}
                                                        <div className="mx-2 my-1 border-t border-white/5" />
                                                        <button
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10"
                                                            onClick={() => handleRemoveMember(member.id, member.userId)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Remove member
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

// deterministic color from a name string
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0284C7', '#DC2626'];
    return colors[Math.abs(hash) % colors.length];
}
