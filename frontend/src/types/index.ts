// Central type definitions.
// Once the real API lands (M2), these stay the same — only src/data/* and
// src/context/* change from "return mock array" to "fetch from Express".
// tYPE SAFETY  : feat apita backend enakn danna pluwan

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Tailwind color used to render the generated initials avatar. */
  avatarColor: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdById: string;
  dueDate: string | null; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Board {
  id: string;
  name: string;
  starred: boolean;
  memberIds: string[];
  coverColor: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
}

/** Shape of the payload the "Add Task" modal collects before an id is assigned. */
export interface NewTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
}
