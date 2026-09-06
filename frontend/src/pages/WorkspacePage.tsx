import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {ArrowLeft,LayoutGrid,Plus, Settings, Users, FolderKanban, Loader2, MoreHorizontal, ShieldCheck, Crown, User as UserIcon,
    Trash2, } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/input';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { getWorkspaceByIdApi, getWorkspaceMembersApi, updateMemberRoleApi, removeMemberApi,
} from '../api/workspaces';
import { createBoard, getWorkspaceBoards, type ApiBoard } from '../api/boards';
import type { Workspace, WorkspaceMember } from '../types';
import { connectSocket, socket, type WorkspaceMemberEvent } from '../sockets/socket';

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

const BOARD_COLORS = [
    { label: 'Blue', hex: '#2563EB' },
    { label: 'Indigo', hex: '#4F46E5' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Amber', hex: '#D97706' },
    { label: 'Rose', hex: '#E11D48' },
];

export function WorkspacePage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [boards, setBoards] = useState<ApiBoard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [boardDescription, setBoardDescription] = useState('');
    const [boardColor, setBoardColor] = useState('#2563EB');
    const [boardVisibility, setBoardVisibility] = useState<'workspace' | 'private' | 'public'>('workspace');
    const [boardFormError, setBoardFormError] = useState('');
    const [isCreatingBoardRequest, setIsCreatingBoardRequest] = useState(false);

    // active user's role inside this workspace
    const myMember = members.find((m) => m.userId === user?.id);
    const isAdminOrOwner = myMember?.role === 'owner' || myMember?.role === 'admin';

    useEffect(() => {
        if (!workspaceId) return;

        async function load() {
            setIsLoading(true);
            setError('');
            try {
                const [ws, mems, boardList] = await Promise.all([
                    getWorkspaceByIdApi(workspaceId!),
                    getWorkspaceMembersApi(workspaceId!),
                    getWorkspaceBoards(workspaceId!),
                ]);
                setWorkspace(ws);
                setMembers(mems);
                setBoards(boardList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load workspace.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [workspaceId]);

    async function handleCreateBoard(event: FormEvent) {
        event.preventDefault();
        if (!workspaceId || !boardName.trim()) {
            setBoardFormError('Board name is required.');
            return;
        }
        setIsCreatingBoardRequest(true);
        setBoardFormError('');
        try {
            const created = await createBoard(workspaceId, {
                name: boardName.trim(),
                description: boardDescription.trim(),
                color: boardColor,
                visibility: boardVisibility,
            });
            setBoards((prev) => [created, ...prev]);
            setBoardName('');
            setBoardDescription('');
            setBoardColor('#2563EB');
            setBoardVisibility('workspace');
            setIsCreatingBoard(false);
        } catch (err) {
            setBoardFormError(err instanceof Error ? err.message : 'Failed to create board.');
        } finally {
            setIsCreatingBoardRequest(false);
        }
    }

    useEffect(() => {
        if (!workspaceId) return;

        const joinWorkspace = () => socket.emit('workspace.join', { workspaceId });
        const handleRoleUpdated = (event: WorkspaceMemberEvent) => {
            if (event.workspaceId !== workspaceId) return;
            setMembers((prev) => prev.map((member) => member.userId === event.userId
                ? { ...member, role: event.role as WorkspaceMember['role'], status: event.status as WorkspaceMember['status'] }
                : member));
        };
        const handleRemoved = ({ userId, workspaceId: eventWorkspaceId }: { userId: string; workspaceId: string }) => {
            if (eventWorkspaceId !== workspaceId) return;
            setMembers((prev) => prev.filter((member) => member.userId !== userId));
        };
        const handleAdded = ({ workspaceId: eventWorkspaceId }: WorkspaceMemberEvent) => {
            if (eventWorkspaceId !== workspaceId) return;
            getWorkspaceMembersApi(workspaceId).then(setMembers).catch((err) => console.error('Failed to refresh workspace members:', err));
        };
        const handleSocketError = ({ message }: { message: string }) => console.error('Socket error:', message);

        connectSocket();
        joinWorkspace();
        socket.on('connect', joinWorkspace);
        socket.on('workspace.member_role_updated', handleRoleUpdated);
        socket.on('workspace.member_removed', handleRemoved);
        socket.on('workspace.member_added', handleAdded);
        socket.on('socket.error', handleSocketError);

        return () => {
            socket.emit('workspace.leave', { workspaceId });
            socket.off('connect', joinWorkspace);
            socket.off('workspace.member_role_updated', handleRoleUpdated);
            socket.off('workspace.member_removed', handleRemoved);
            socket.off('workspace.member_added', handleAdded);
            socket.off('socket.error', handleSocketError);
        };
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
                prev.map((m) => (m.userId === userId ? { ...m, role: newRole as WorkspaceMember['role'] } : m))
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
            setMembers((prev) => prev.filter((m) => m.userId !== userId));
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
                                <Button className="flex items-center gap-1.5 text-xs" onClick={() => setIsCreatingBoard(true)}>
                                    <Plus className="h-3.5 w-3.5" />
                                    New Board
                                </Button>
                            )}
                        </div>

                        {boards.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-[#111b2f] p-8 text-center">
                                <EmptyState icon={FolderKanban} title="No boards yet" description="Create a board to start organizing tasks in columns." />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {boards.map((board) => (
                                    <button key={board._id} type="button" onClick={() => navigate(`/boards/${board._id}`)} className="group rounded-2xl border border-white/10 bg-[#151f36] p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-400/50">
                                        <div className="mb-4 flex h-24 items-center justify-center rounded-xl" style={{ background: board.color ?? '#2563EB' }}>
                                            <FolderKanban className="h-9 w-9 text-white/90" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div><h3 className="font-semibold text-white group-hover:text-primary-300">{board.name}</h3>{board.description && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{board.description}</p>}</div>
                                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">{board.visibility}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
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

            {isCreatingBoard && (
                <Modal title="Create New Board" onClose={() => setIsCreatingBoard(false)}>
                    <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
                        <Input id="board-name" label="Board Name *" placeholder="e.g. Product Roadmap" value={boardName} onChange={(event) => setBoardName(event.target.value)} required autoFocus />
                        <div><label htmlFor="board-description" className="mb-1.5 block text-xs font-medium text-slate-300">Description</label><textarea id="board-description" rows={3} value={boardDescription} onChange={(event) => setBoardDescription(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary-400" placeholder="What will this board track?" /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-300">Board Color</label><div className="flex gap-3">{BOARD_COLORS.map((color) => <button key={color.hex} type="button" aria-label={color.label} onClick={() => setBoardColor(color.hex)} style={{ backgroundColor: color.hex }} className={`h-7 w-7 rounded-full ${boardColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#182541]' : 'opacity-75'}`} />)}</div></div>
                        <div><label htmlFor="board-visibility" className="mb-1.5 block text-xs font-medium text-slate-300">Visibility</label><select id="board-visibility" value={boardVisibility} onChange={(event) => setBoardVisibility(event.target.value as typeof boardVisibility)} className="w-full rounded-xl border border-white/10 bg-[#182541] px-3 py-2 text-sm text-slate-200"><option value="workspace">Workspace</option><option value="private">Private</option><option value="public">Public</option></select></div>
                        {boardFormError && <p className="text-xs text-rose-400">{boardFormError}</p>}
                        <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-4"><Button type="button" variant="secondary" onClick={() => setIsCreatingBoard(false)}>Cancel</Button><Button type="submit" disabled={isCreatingBoardRequest}>{isCreatingBoardRequest ? 'Creating...' : 'Create Board'}</Button></div>
                    </form>
                </Modal>
            )}
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
