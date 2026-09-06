import { useState, type DragEvent } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { ApiColumn } from '../../api/columns';
import type { ApiTask } from '../../api/tasks';

interface BoardColumnProps {
  column: ApiColumn;
  tasks: ApiTask[];
  onDragStart: (taskId: string) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, columnId: string) => void;
  onDrop: (columnId: string) => void;
  onTaskClick: (task: ApiTask) => void;
  onAddTask: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  isAdminOrOwner: boolean;
}

export function BoardColumn({ column, tasks, onDragStart, onDragOver, onDrop, onTaskClick, onAddTask, onDeleteColumn, isAdminOrOwner }: BoardColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [title, setTitle] = useState('');

  function submitTask() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAddTask(column._id, trimmedTitle);
    setTitle('');
    setIsAddingTask(false);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/5 bg-[#111b30] p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">{column.name}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-xs font-medium text-slate-400">{tasks.length}</span>
        </div>
        {isAdminOrOwner && (
          <button type="button" aria-label={`${column.name} column options`} onClick={() => onDeleteColumn(column._id)} className="rounded-md p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" title="Delete column">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      <div onDragOver={(event) => onDragOver(event, column._id)} onDrop={(event) => { event.preventDefault(); onDrop(column._id); }} className="flex min-h-16 flex-1 flex-col gap-2 rounded-lg">
        {tasks.map((task) => (
          <button key={task._id} type="button" draggable onDragStart={() => onDragStart(task._id)} onClick={() => onTaskClick(task)} className="w-full cursor-grab rounded-xl border border-white/5 bg-[#17233b] p-3 text-left transition hover:border-primary-400/40 hover:bg-[#1b2a47] active:cursor-grabbing">
            <p className="text-sm font-medium text-slate-100">{task.title}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500"><span className="uppercase tracking-wide">{task.priority}</span><span>v{task.version}</span></div>
          </button>
        ))}
      </div>

      {isAddingTask ? (
        <div className="mt-2 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitTask(); if (event.key === 'Escape') setIsAddingTask(false); }} placeholder="Task title" className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-primary-400" />
          <div className="flex gap-2"><button type="button" onClick={submitTask} className="flex-1 rounded-lg bg-primary-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-primary-500">Add</button><button type="button" onClick={() => setIsAddingTask(false)} className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-400 hover:bg-white/10">Cancel</button></div>
        </div>
      ) : (
        <button type="button" onClick={() => setIsAddingTask(true)} className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 hover:bg-white/10 hover:text-slate-200"><Plus className="h-4 w-4" />Add Task</button>
      )}
    </div>
  );
}
