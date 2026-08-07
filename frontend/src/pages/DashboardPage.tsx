import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { BoardCard } from '../components/board/BoardCard';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/input';
import { useBoards } from '../hooks/useBoards';

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
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">My Boards</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            New Auth
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
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
