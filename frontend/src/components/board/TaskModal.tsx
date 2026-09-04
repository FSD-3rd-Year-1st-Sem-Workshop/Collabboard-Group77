import { useEffect, useRef, useState } from 'react';
import type { ApiTask, TaskPriority } from '../../api/tasks';
import { updateTask, deleteTask } from '../../api/tasks';
import type { ApiComment } from '../../api/comments';
import { getTaskComments, createComment, deleteComment } from '../../api/comments';
import { useAuth } from '../../hooks/useAuth';

interface TaskModalProps {
    task: ApiTask;
    onClose: () => void;
    onUpdated: (updated: ApiTask) => void;
    onDeleted: (taskId: string) => void;
    isAdminOrOwner: boolean;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_COLORS: Record<TaskPriority, string> = {
    urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
};

function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function TaskModal({ task, onClose, onUpdated, onDeleted, isAdminOrOwner }: TaskModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? '');
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [labels, setLabels] = useState(task.labels.join(', '));
    const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [comments, setComments] = useState<ApiComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getTaskComments(task._id)
            .then(setComments)
            .catch(() => { })
            .finally(() => setCommentsLoading(false));
    }, [task._id]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    async function handleSave() {
        setSaving(true);
        try {
            const updated = await updateTask(task._id, {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
                dueDate: dueDate || null,
            });
            onUpdated(updated);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Delete this task? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await deleteTask(task._id);
            onDeleted(task._id);
            onClose();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        } finally {
            setDeleting(false);
        }
    }

    async function handlePostComment() {
        if (!newComment.trim()) return;
        setPostingComment(true);
        try {
            const comment = await createComment(task._id, newComment.trim());
            setComments((prev) => [...prev, comment]);
            setNewComment('');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Post failed');
        } finally {
            setPostingComment(false);
        }
    }

    async function handleDeleteComment(commentId: string) {
        if (!confirm('Delete this comment?')) return;
        try {
            await deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    }

    const overlayStyle: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    };

    const modalStyle: React.CSSProperties = {
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, width: '100%', maxWidth: 780, maxHeight: '92vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', background: '#1a2642', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, color: '#e2e8f0', fontSize: 13, padding: '9px 12px',
        outline: 'none', boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="material-symbols-rounded" style={{ color: '#6366f1', fontSize: 22 }}>task_alt</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, flex: 1 }}>Edit Task</span>
                    {isAdminOrOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 600, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            <span className="material-symbols-rounded" style={{ fontSize: 15 }}>delete</span>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    )}
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 22 }}>close</span>
                    </button>
                </div>

                {/* Body: two columns */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left: task form */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ ...inputStyle, fontSize: 15, fontWeight: 500 }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
                                placeholder="Add details…"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={labelStyle}>Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    {PRIORITIES.map((p) => (
                                        <option key={p} value={p} style={{ background: '#1a2642' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    style={{ ...inputStyle, colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Labels (comma separated)</label>
                            <input
                                value={labels}
                                onChange={(e) => setLabels(e.target.value)}
                                style={inputStyle}
                                placeholder="design, backend, bug…"
                            />
                        </div>

                        {/* Priority preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORITY_COLORS[priority] }} />
                            <span style={{ color: PRIORITY_COLORS[priority], fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{priority} priority</span>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                            style={{
                                width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700,
                                fontSize: 14, padding: '11px 0', cursor: 'pointer',
                                opacity: saving || !title.trim() ? 0.6 : 1,
                            }}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Right: comments */}
                    <div style={{ width: 300, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: '#0c1524' }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-symbols-rounded" style={{ color: '#6366f1', fontSize: 18 }}>chat_bubble</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>Comments</span>
                            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 11, borderRadius: 99, padding: '1px 8px', fontWeight: 600 }}>
                                {comments.length}
                            </span>
                        </div>

                        {/* Comment list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {commentsLoading ? (
                                <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, padding: '20px 0' }}>Loading…</div>
                            ) : comments.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#334155', fontSize: 12, padding: '20px 0' }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>chat_bubble_outline</span>
                                    No comments yet
                                </div>
                            ) : comments.map((c) => (
                                <div key={c._id} style={{ display: 'flex', gap: 8 }}>
                                    <div
                                        style={{
                                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                            background: '#4f46e5', color: '#fff', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                                        }}
                                    >
                                        {getInitials(c.user?.fullName ?? 'U')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                            <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 11 }}>{c.user?.fullName}</span>
                                            <span style={{ color: '#475569', fontSize: 10 }}>{timeAgo(c.createdAt)}</span>
                                            {(c.user?._id === user?.id || isAdminOrOwner) && (
                                                <button
                                                    onClick={() => handleDeleteComment(c._id)}
                                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}
                                                >
                                                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{c.content}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Post comment */}
                        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                                placeholder="Write a comment… (Enter to send)"
                                style={{
                                    width: '100%', background: '#1a2642', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, color: '#e2e8f0', fontSize: 12, padding: '8px 10px',
                                    resize: 'none', outline: 'none', boxSizing: 'border-box', minHeight: 60, lineHeight: 1.4,
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                onClick={handlePostComment}
                                disabled={postingComment || !newComment.trim()}
                                style={{
                                    width: '100%', marginTop: 6, background: '#4f46e5', border: 'none',
                                    borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12,
                                    padding: '8px 0', cursor: 'pointer',
                                    opacity: postingComment || !newComment.trim() ? 0.5 : 1,
                                }}
                            >
                                {postingComment ? 'Posting…' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
