import type { Board } from '../types/index';

// Mock "boards" table. In M2 this becomes a GET /api/boards response scoped
// to the logged-in user.
export const mockBoards: Board[] = [
  {
    id: 'board_1',
    name: 'Software Engineering Project',
    starred: true,
    memberIds: ['user_1', 'user_2', 'user_3'],
    coverColor: 'bg-indigo-100',
  },
  {
    id: 'board_2',
    name: 'Marketing Plan',
    starred: false,
    memberIds: ['user_1', 'user_4', 'user_5'],
    coverColor: 'bg-amber-100',
  },
  {
    id: 'board_3',
    name: 'Website Redesign',
    starred: true,
    memberIds: ['user_1', 'user_2', 'user_5'],
    coverColor: 'bg-sky-100',
  },
  {
    id: 'board_4',
    name: 'Mobile App',
    starred: false,
    memberIds: ['user_1', 'user_3'],
    coverColor: 'bg-emerald-100',
  },
  {
    id: 'board_5',
    name: 'Research Tasks',
    starred: false,
    memberIds: ['user_1', 'user_4'],
    coverColor: 'bg-rose-100',
  },
  {
    id: 'board_5',
    name: 'Group AE',
    starred: false,
    memberIds: ['user_1', 'user_4'],
    coverColor: 'bg-rose-100',
  },
];
