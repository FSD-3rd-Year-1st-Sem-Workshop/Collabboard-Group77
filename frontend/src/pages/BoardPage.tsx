import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../components/layout/DashboardShell';
import { BoardColumn } from '../components/board/BoardColumn';
import { TaskModal } from '../components/board/TaskModal';
import { getBoardById, type ApiBoard } from '../api/boards';
import { getBoardColumns, createColumn, deleteColumn, type ApiColumn } from '../api/columns';
import { getBoardTasks, createTask, moveTask, type ApiTask } from '../api/tasks';
import { getWorkspaceMembersApi } from '../api/workspaces';
import { useAuth } from '../hooks/useAuth';
import type { WorkspaceMember } from '../types';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState<ApiBoard | null>(null);
  const [columns, setColumns] = useState<ApiColumn[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [savingCol, setSavingCol] = useState(false);

  const dragTaskId = useRef<string | null>(null);
  const dragTargetCol = useRef<string | null>(null);

  const myMember = members.find((m) => m.userId === user?.id);
  const isAdminOrOwner = myMember?.role === 'owner' || myMember?.role === 'admin';

  useEffect(() => {
    if (!boardId) return;
    async function load() {
      setLoading(true);
      try {
        const boardData = await getBoardById(boardId!);
        setBoard(boardData);
        const [cols, tks, mems] = await Promise.all([
          getBoardColumns(boardId!),
          getBoardTasks(boardId!),
          getWorkspaceMembersApi(boardData.workspace),
        ]);
        setColumns(cols.sort((a, b) => a.position - b.position));
        setTasks(tks.sort((a, b) => a.position - b.position));
        setMembers(mems);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [boardId]);

  const handleAddTask = useCallback(async (columnId: string, title: string) => {
    if (!boardId) return;
    const task = await createTask(boardId, columnId, { title });
    setTasks((prev) => [...prev, task]);
  }, [boardId]);

  const handleDrop = useCallback(async (targetColumnId: string) => {
    const taskId = dragTaskId.current;
    if (!taskId || !targetColumnId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.column === targetColumnId) return;

    // Optimistic update
    const tasksInTarget = tasks.filter((t) => t.column === targetColumnId);
    const newPosition = tasksInTarget.length;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, column: targetColumnId, position: newPosition } : t
      )
    );

    try {
      const updated = await moveTask(taskId, targetColumnId, newPosition, task.version);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch {
      // Revert on failure
      setTasks((prev) => prev.map((t) => (t._id === taskId ? task : t)));
    }

    dragTaskId.current = null;
    dragTargetCol.current = null;
  }, [tasks]);

  const handleAddColumn = async () => {
    if (!newColName.trim() || !boardId) return;
    setSavingCol(true);
    try {
      const col = await createColumn(boardId, { name: newColName.trim() });
      setColumns((prev) => [...prev, col]);
      setNewColName('');
      setAddingColumn(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create column');
    } finally {
      setSavingCol(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      setColumns((prev) => prev.filter((c) => c._id !== columnId));
      setTasks((prev) => prev.filter((t) => t.column !== columnId));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete column');
    }
  };

  const input: React.CSSProperties = {
    background: '#1a2642', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#e2e8f0', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box',
  };

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#090f1e' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#6366f1', animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardShell>
    );
  }

  if (error || !board) {
    return (
      <DashboardShell>
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#090f1e' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#ef4444' }}>error_outline</span>
          <p style={{ color: '#f87171', fontWeight: 600 }}>{error || 'Board not found'}</p>
          <button
            onClick={() => navigate(-1)}
            style={{ background: '#1a2642', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, padding: '8px 18px', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#090f1e', overflow: 'hidden' }}>

        {/* Board header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: `linear-gradient(135deg, ${board.color ?? '#2563EB'}22 0%, transparent 70%)`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_back</span>
          </button>
          <div
            style={{ width: 36, height: 36, borderRadius: 10, background: board.color ?? '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="material-symbols-rounded" style={{ color: '#fff', fontSize: 20 }}>view_kanban</span>
          </div>
          <div>
            <h1 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: 0 }}>{board.name}</h1>
            {board.description && <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{board.description}</p>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#475569', fontSize: 12 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>view_column</span>
              {' '}{columns.length} columns · {tasks.length} tasks
            </span>
            {isAdminOrOwner && (
              <button
                onClick={() => setAddingColumn(true)}
                style={{ background: '#4f46e5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
                Add Column
              </button>
            )}
          </div>
        </div>

        {/* Kanban columns */}
        <div style={{ display: 'flex', gap: 14, padding: '16px 20px', overflow: 'auto', flex: 1, alignItems: 'flex-start' }}>
          {columns.map((col) => (
            <BoardColumn
              key={col._id}
              column={col}
              tasks={tasks.filter((t) => t.column === col._id).sort((a, b) => a.position - b.position)}
              onDragStart={(id) => { dragTaskId.current = id; }}
              onDragOver={(e, colId) => { e.preventDefault(); dragTargetCol.current = colId; }}
              onDrop={handleDrop}
              onTaskClick={setSelectedTask}
              onAddTask={handleAddTask}
              onDeleteColumn={handleDeleteColumn}
              isAdminOrOwner={isAdminOrOwner}
            />
          ))}

          {/* Add column inline */}
          {addingColumn ? (
            <div style={{ width: 280, flexShrink: 0, background: '#111827', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: 14 }}>
              <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, marginBottom: 10 }}>New Column</p>
              <input
                autoFocus
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setAddingColumn(false); setNewColName(''); } }}
                placeholder="Column name…"
                style={{ ...input, width: '100%', marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleAddColumn} disabled={savingCol || !newColName.trim()}
                  style={{ flex: 1, background: '#4f46e5', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, padding: '7px 0', cursor: 'pointer', opacity: savingCol ? 0.5 : 1 }}>
                  {savingCol ? 'Adding…' : 'Add'}
                </button>
                <button onClick={() => { setAddingColumn(false); setNewColName(''); }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94a3b8', fontSize: 12, padding: '7px 10px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            isAdminOrOwner && (
              <button
                onClick={() => setAddingColumn(true)}
                style={{ width: 260, flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, color: '#475569', fontSize: 13, fontWeight: 500, padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 28 }}>add_circle</span>
                Add Column
              </button>
            )
          )}

          {columns.length === 0 && !addingColumn && (
            <div style={{ width: '100%', textAlign: 'center', color: '#334155', fontSize: 14, padding: '60px 0' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>view_kanban</span>
              No columns yet. {isAdminOrOwner ? 'Click "Add Column" to get started.' : 'Ask an admin to create columns.'}
            </div>
          )}
        </div>
      </div>

      {/* Task modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isAdminOrOwner={isAdminOrOwner}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setSelectedTask(updated);
          }}
          onDeleted={(id) => {
            setTasks((prev) => prev.filter((t) => t._id !== id));
            setSelectedTask(null);
          }}
        />
      )}
    </DashboardShell>
  );
}
