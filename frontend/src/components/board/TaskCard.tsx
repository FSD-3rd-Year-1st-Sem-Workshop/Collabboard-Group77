///////// THis codee want to be completely changed

import { CalendarDays } from 'lucide-react';
import type { Task } from '../../types/index';
import { Avatar } from '../common/Avatar';
// import { getUserById } from '../../data/users';
import { formatShortDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  onOpen: () => void;
  onDragStart: () => void;
  isDragging: boolean;
}

export function TaskCard({ task, onOpen, onDragStart, isDragging }: TaskCardProps) {
  const assignee = getUserById(task.assigneeId);
  const dueLabel = formatShortDate(task.dueDate);

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className={cn(
        'w-full cursor-grab rounded-lg border border-[#111827] bg-gradient-to-br from-[#111827] via-[#041e49] to-[#274E8E] p-3 text-left shadow-sm transition-all',
        'hover:border-white hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <p className="text-sm font-medium text-slate-100">{task.title}</p>
      <div className="mt-3 flex items-center justify-between">
        {dueLabel ? (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {dueLabel}
          </span>
        ) : (
          <span />
        )}
        {assignee && <Avatar user={assignee} size="sm" />}
      </div>
    </button>
  );
}
