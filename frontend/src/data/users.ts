import type { User } from '@/types';

// Mock "users" table. In M2 this becomes a GET /api/users response
// (or is looked up per-id from the JWT-authenticated session).
export const mockUsers: User[] = [
  { id: 'user_1', name: 'John Doe', email: 'john@example.com', avatarColor: 'bg-[#00A884]' },
  { id: 'user_2', name: 'Sarah Johnson', email: 'sarah@example.com', avatarColor: 'bg-rose-500' },
  { id: 'user_3', name: 'Michael Chen', email: 'michael@example.com', avatarColor: 'bg-amber-500' },
  { id: 'user_4', name: 'Priya Patel', email: 'priya@example.com', avatarColor: 'bg-emerald-500' },
  { id: 'user_5', name: 'Diego Alvarez', email: 'diego@example.com', avatarColor: 'bg-sky-500' },
];

export function getUserById(id: string | null): User | undefined {
  if (!id) return undefined;
  return mockUsers.find((user) => user.id === id);
}

// The "logged in" user for this mock build. Swapped for real session/JWT
// state in AuthContext once the auth API exists (M2).
export const currentUser = mockUsers[0];
