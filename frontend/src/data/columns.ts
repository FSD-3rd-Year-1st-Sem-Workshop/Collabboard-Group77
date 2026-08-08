import type { Column } from '@/types';

// The board's three columns. Kept as data (not hardcoded JSX) so a future
// "custom columns per board" feature only touches this layer.
export const BOARD_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];
