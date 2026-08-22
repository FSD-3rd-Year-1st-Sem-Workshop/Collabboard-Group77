import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { BoardCard } from '../components/board/BoardCard';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/input';
import { EmptyState } from '../components/common/EmptyState';
import { useBoards } from '../hooks/useBoards';
import { LayoutGrid } from 'lucide-react';

export function DashboardPage() {
  const { boards, addBoard } = useBoards();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  function handleCreateBoard(event: FormEvent) {
    event.preventDefault();
    if (!newBoardName.trim()) return;
    addBoard(newBoardName.trim());
    setNewBoardName('');
    setIsCreating(false);
  }

  return (
    <DashboardShell>
      <div className="min-h-full bg-[#0b1220] p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-400">Workspace overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">My Boards</h1>
            <p className="mt-2 text-sm text-slate-500">Plan, organize, and move your team&apos;s work forward.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            New board
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
        {boards.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No boards yet"
            description="Create your first board to start planning with your team."
          />
        )}
      </div>

      {isCreating && (
        <Modal title="Create New Board" onClose={() => setIsCreating(false)}>
          <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
            <Input
              id="new-board-name"
              label="Board name"
              placeholder="e.g. Product Launch"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Board</Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardShell>
  );
}
