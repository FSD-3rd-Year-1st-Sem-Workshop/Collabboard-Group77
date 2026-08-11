import { useContext } from 'react';
import { BoardContext } from '../context/BoardContext';

export function useBoards() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoards must be used within a BoardProvider');
  return ctx;
}
