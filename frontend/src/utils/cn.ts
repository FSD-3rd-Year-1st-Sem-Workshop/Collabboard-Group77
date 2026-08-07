import { clsx, type ClassValue } from 'clsx';

/** Combines conditional class names. Kept as its own tiny utility so every
 * component can compose Tailwind classes without repeating `clsx` logic. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
