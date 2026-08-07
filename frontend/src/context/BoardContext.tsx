import { createContext, useReducer, type ReactNode } from 'react';
import type { Board, NewTaskInput, Task, TaskStatus } from '@/types';
import { mockBoards } from '@/data/boards';
import { mockTasks } from '@/data/tasks';
import { generateId } from '@/utils/id';
import { currentUser } from '@/data/users';

interface BoardState {
  boards: Board[];
  tasks: Task[];
}

type Action =
  | { type: 'ADD_TASK'; boardId: string; input: NewTaskInput }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'MOVE_TASK'; taskId: string; status: TaskStatus }
  | { type: 'TOGGLE_STAR'; boardId: string }
  | { type: 'ADD_BOARD'; name: string };

const initialState: BoardState = {
  boards: mockBoards,
  tasks: mockTasks,
};

function boardReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'ADD_TASK': {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId('task'),
        boardId: action.boardId,
        createdById: currentUser.id,
        createdAt: now,
        updatedAt: now,
        ...action.input,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.task.id
            ? { ...action.task, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    }
    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.taskId) };
    }
    case 'MOVE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? { ...task, status: action.status, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    }
    case 'TOGGLE_STAR': {
      return {
        ...state,
        boards: state.boards.map((board) =>
          board.id === action.boardId ? { ...board, starred: !board.starred } : board
        ),
      };
    }
    case 'ADD_BOARD': {
      const newBoard: Board = {
        id: generateId('board'),
        name: action.name,
        starred: false,
        memberIds: [currentUser.id],
        coverColor: 'bg-slate-100',
      };
      return { ...state, boards: [...state.boards, newBoard] };
    }
    default:
      return state;
  }
}

export interface BoardContextValue extends BoardState {
  addTask: (boardId: string, input: NewTaskInput) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  toggleStar: (boardId: string) => void;
  addBoard: (name: string) => void;
}

export const BoardContext = createContext<BoardContextValue | undefined>(undefined);


export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const value: BoardContextValue = {
    ...state,
    addTask: (boardId, input) => dispatch({ type: 'ADD_TASK', boardId, input }),
    updateTask: (task) => dispatch({ type: 'UPDATE_TASK', task }),
    deleteTask: (taskId) => dispatch({ type: 'DELETE_TASK', taskId }),
    moveTask: (taskId, status) => dispatch({ type: 'MOVE_TASK', taskId, status }),
    toggleStar: (boardId) => dispatch({ type: 'TOGGLE_STAR', boardId }),
    addBoard: (name) => dispatch({ type: 'ADD_BOARD', name }),
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
