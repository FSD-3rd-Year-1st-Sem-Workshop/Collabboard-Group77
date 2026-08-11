import { Link } from 'react-router-dom';
import { Star, LayoutGrid } from 'lucide-react';
import type { Board } from '../../types/index';
import { AvatarGroup } from '../common/AvatarGroup';
import { mockUsers } from '../../data/users';
import { getTasksByBoard } from '../../data/tasks';
import { useBoards } from '../../hooks/useBoards';
import { cn } from '../../utils/cn';

export function BoardCard({ board }: { board: Board }) {
  const { toggleStar, tasks } = useBoards();
  const members = mockUsers.filter((user) => board.memberIds.includes(user.id));
  // Prefer live task count from context so it updates as tasks are added;
  // falls back to the static seed helper for boards with no context tasks yet.
  const taskCount = tasks.filter((t) => t.boardId === board.id).length || getTasksByBoard(board.id).length;

  return (
    <div className="group relative rounded-xl border border-slate-100 bg-[#30363d] p-4 shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => toggleStar(board.id)}
        aria-label={board.starred ? 'Unstar board' : 'Star board'}
        className="absolute right-3 top-3 z-10 rounded-md p-1 hover:bg-slate-100"
      >
        <Star
          className={cn('h-4 w-4', board.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
        />
      </button>

      <Link to={`/boards/${board.id}`} className="block">
        <div className={cn('mb-3 flex h-24 items-center justify-center rounded-lg', board.coverColor)}>
          <LayoutGrid className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="pr-6 text-sm font-semibold text-white">{board.name}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <AvatarGroup users={members} size="sm" max={3} />
        <span className="rounded-md bg-slate-500 px-2 py-0.5 text-xs font-medium text-slate-200">
          {taskCount}
        </span>
      </div>
    </div>
  );
}
