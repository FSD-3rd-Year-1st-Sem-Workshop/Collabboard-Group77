import { useState, type DragEvent } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { Column, Task } from '../../types/index';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  draggingTaskId: string | null;
  onDragStartTask: (taskId: string) => void;
  onDropTask: (columnId: Column['id']) => void;
  onOpenTask: (task: Task) => void;
  onAddTask: (columnId: Column['id']) => void;
}

export function BoardColumn({
  column,
  tasks,
  draggingTaskId,
  onDragStartTask,
  onDropTask,
  onOpenTask,
  onAddTask,
}: BoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); // required to allow a drop
    setIsDragOver(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    onDropTask(column.id);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/5 bg-[#111b30] p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">{column.title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-xs font-medium text-slate-400">
            {tasks.length}
          </span>
        </div>
        <button
          aria-label={`${column.title} column options`}
          className="rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-16 flex-1 flex-col gap-2 rounded-lg transition-colors',
          isDragOver && 'bg-primary-50/60 ring-2 ring-primary-200'
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={() => onOpenTask(task)}
            onDragStart={() => onDragStartTask(task.id)}
            isDragging={draggingTaskId === task.id}
          />
        ))}
      </div>

      <button
        onClick={() => onAddTask(column.id)}
        className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 hover:bg-white/10 hover:text-slate-200"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
}
