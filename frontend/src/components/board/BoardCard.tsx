import { Link } from 'react-router-dom';
import { Star, LayoutGrid } from 'lucide-react';
import type { Board } from '../../types/index';
import { AvatarGroup } from '../common/AvatarGroup';
import { useBoards } from '../../hooks/useBoards';
import { cn } from '../../utils/cn';

export function BoardCard({ board }: { board: Board }) {
  const { toggleStar, tasks } = useBoards();
  const members: any[] = [];
  const taskCount = tasks.filter((t) => t.boardId === board.id).length;

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-[#151f36] p-4 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-primary-950/30">
      <button
        onClick={() => toggleStar(board.id)}
        aria-label={board.starred ? 'Unstar board' : 'Star board'}
        className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-100"
      >
        <Star
          className={cn('h-4 w-4', board.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
        />
      </button>

      <Link to={`/boards/${board.id}`} className="block">
        <div className={cn('mb-3 flex h-24 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10', board.coverColor)}>
          <LayoutGrid className="h-8 w-8 text-white/70" strokeWidth={1.5} />
        </div>
        <p className="pr-6 text-sm font-semibold text-white">{board.name}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <AvatarGroup users={members} size="sm" max={3} />
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400">
          {taskCount}
        </span>
      </div>
    </div>
  );
}
