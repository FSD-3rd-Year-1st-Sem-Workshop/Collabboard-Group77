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

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  color?: string | null;
  visibility?: 'private' | 'public' | string;
  role?: string;
  memberCount?: number;
  boardCount?: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMember {
  id: string;         // WorkspaceMember document _id
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'inactive';
  joinedAt?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member' | string;
  status: 'pending' | 'accepted' | 'declined' | string;
  token?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  logo?: string | null;
  color?: string;
  visibility?: 'private' | 'public';
}

export interface DashboardSummary {
  workspaceCount: number;
  assignedTaskCount: number;
  overdueTaskCount: number;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  workspaces: Workspace[];
  summary: DashboardSummary;
}

export interface NewTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}


