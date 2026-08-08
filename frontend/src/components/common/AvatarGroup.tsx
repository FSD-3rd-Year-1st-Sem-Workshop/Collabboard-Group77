import type { User } from '@/types';
import { Avatar } from './Avatar';

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 3, size = 'md' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((user) => (
        <Avatar key={user.id} user={user} size={size} />
      ))}
      {overflow > 0 && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-2 ring-blue-700">
          +{overflow}
        </div>
      )}
    </div>
  );
}
