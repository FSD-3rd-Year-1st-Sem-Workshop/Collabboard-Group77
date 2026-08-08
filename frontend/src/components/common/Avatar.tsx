import type { User } from '@/types';
import { cn } from '@/utils/cn';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  const initials = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0][0]];
  return initials.join('').toUpperCase();
}

/** Renders a colored initials circle — avoids depending on external avatar images. */
export function Avatar({ user, size = 'md', className }: AvatarProps) {
  return (
    <div
      title={user.name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-amber-400 ring-2 ring-blue-700',
        sizeClasses[size],
        user.avatarColor,
        className
      )}
    >
      {getInitials(user.name)}
    </div>
  );
}
