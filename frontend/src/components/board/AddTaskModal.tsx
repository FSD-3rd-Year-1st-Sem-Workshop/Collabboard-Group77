import { useState, type FormEvent } from 'react';
import type { Board, Column, NewTaskInput, TaskPriority, TaskStatus } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { mockUsers } from '@/data/users';
import { useBoards } from '@/hooks/useBoards';

interface AddTaskModalProps {
  board: Board;
  columns: Column[];
  defaultStatus: TaskStatus;
  onClose: () => void;
}

export function AddTaskModal({ board, columns, defaultStatus, onClose }: AddTaskModalProps) {
  const { addTask } = useBoards();
  const boardMembers = mockUsers.filter((user) => board.memberIds.includes(user.id));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError('Give the task a title.');
      return;
    }

    const input: NewTaskInput = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    };
    addTask(board.id, input);
    onClose();
  }

  return (
    <Modal title="Add New Task" onClose={onClose} widthClassName="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="task-title"
          label="Title *"
          placeholder="e.g. Create login page"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          error={titleError}
          autoFocus
        />

        <Textarea
          id="task-description"
          label="Description"
          placeholder="Add task description..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-status"
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </Select>

          <Select
            id="task-priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-assignee"
            label="Assign to"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Select member</option>
            {boardMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>

          <Input
            id="task-due-date"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
