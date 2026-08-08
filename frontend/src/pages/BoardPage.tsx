import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Star, UserPlus, MoreHorizontal } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { BoardColumn } from '../components/board/BoardColumn';
import { AddTaskModal } from '../components/board/AddTaskModal';
import { TaskDetailsModal } from '../components/board/TaskDetailsModal';
import { AvatarGroup } from '../components/common/AvatarGroup';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { BOARD_COLUMNS } from '../data/columns';
import { mockUsers } from '../data/users';
import { useBoards } from '../hooks/useBoards';
import type { Task, TaskStatus } from '../types/index';
import { cn } from '../utils/cn';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { boards, tasks, toggleStar, moveTask } = useBoards();

  const board = boards.find((b) => b.id === boardId);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!board) {
    return (
      <DashboardShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <EmptyState
            icon={MoreHorizontal}
            title="Board not found"
            description="It may have been deleted, or the link is wrong."
          />
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to My Boards
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const boardTasks = tasks.filter((task) => task.boardId === board.id);
  const members = mockUsers.filter((user) => board.memberIds.includes(user.id));

  function handleDropTask(status: TaskStatus) {
    if (draggingTaskId) {
      moveTask(draggingTaskId, status);
    }
    setDraggingTaskId(null);
  }

  return (
    <DashboardShell>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">Board: {board.name}</h1>
            <button
              onClick={() => toggleStar(board.id)}
              aria-label={board.starred ? 'Unstar board' : 'Star board'}
              className="rounded-md p-1 hover:bg-slate-100"
            >
              <Star className={cn('h-[18px] w-[18px]', board.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <AvatarGroup users={members} size="sm" />
            <Button variant="secondary">
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
            <button
              aria-label="Board options"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <Button onClick={() => setAddTaskStatus('todo')}>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={boardTasks.filter((task) => task.status === column.id)}
              draggingTaskId={draggingTaskId}
              onDragStartTask={setDraggingTaskId}
              onDropTask={handleDropTask}
              onOpenTask={setSelectedTask}
              onAddTask={setAddTaskStatus}
            />
          ))}
        </div>
      </div>

      {addTaskStatus && (
        <AddTaskModal
          board={board}
          columns={BOARD_COLUMNS}
          defaultStatus={addTaskStatus}
          onClose={() => setAddTaskStatus(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          board={board}
          columns={BOARD_COLUMNS}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </DashboardShell>
  );
}
