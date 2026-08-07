import { useState, type FormEvent } from 'react';
import type { Board, Column, Task, TaskPriority, TaskStatus } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge } from './PriorityBadge';
import { getUserById, mockUsers } from '@/data/users';
import { formatDateTime, formatLongDate, toDateInputValue } from '@/utils/date';
import { useBoards } from '@/hooks/useBoards';

interface TaskDetailsModalProps {
  task: Task;
  board: Board;
  columns: Column[];
  onClose: () => void;
}

export function TaskDetailsModal({ task, board, columns, onClose }: TaskDetailsModalProps) {
  const { updateTask, deleteTask } = useBoards();
  const boardMembers = mockUsers.filter((user) => board.memberIds.includes(user.id));
  const assignee = getUserById(task.assigneeId);
  const createdBy = getUserById(task.createdById);

  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));

  function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    updateTask({
      ...task,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });
    setIsEditing(false);
  }

  function handleDelete() {
    deleteTask(task.id);
    onClose();
  }

  const columnLabel = columns.find((column) => column.id === task.status)?.title ?? task.status;

  if (isEditing) {
    return (
      <Modal title="Edit Task" onClose={onClose} widthClassName="max-w-lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input id="edit-title" label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Textarea
            id="edit-description"
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select id="edit-status" label="Status *" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </Select>
            <Select id="edit-priority" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select id="edit-assignee" label="Assign to" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Select member</option>
              {boardMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
            <Input id="edit-due-date" label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title={task.title} onClose={onClose} widthClassName="max-w-lg">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Status</p>
            <p className="mt-1 text-sm font-medium text-primary-700">{columnLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Priority</p>
            <div className="mt-1">
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Due Date</p>
            <p className="mt-1 text-sm text-slate-700">{formatLongDate(task.dueDate) ?? '—'}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">Description</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
            {task.description || 'No description yet.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Assigned to</p>
            {assignee ? (
              <div className="mt-1.5 flex items-center gap-2">
                <Avatar user={assignee} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{assignee.name}</p>
                  <p className="text-xs text-slate-400">{assignee.email}</p>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Unassigned</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Created by</p>
            {createdBy && (
              <div className="mt-1.5 flex items-center gap-2">
                <Avatar user={createdBy} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{createdBy.name}</p>
                  <p className="text-xs text-slate-400">{createdBy.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Created at</p>
            <p className="mt-1 text-sm text-slate-600">{formatDateTime(task.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Last updated</p>
            <p className="mt-1 text-sm text-slate-600">{formatDateTime(task.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {confirmingDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Delete this task?</span>
              <button onClick={handleDelete} className="font-medium text-rose-600 hover:underline">
                Yes, delete
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="text-slate-500 hover:underline">
                Cancel
              </button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
