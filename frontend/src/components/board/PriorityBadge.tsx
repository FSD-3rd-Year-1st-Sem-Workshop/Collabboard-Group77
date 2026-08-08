import type { TaskPriority } from '@/types';
import { Badge } from '@/components/common/Badge';

const priorityConfig: Record<TaskPriority, { label: string; tone: 'slate' | 'amber' | 'rose' }> = {
  low: { label: 'Low', tone: 'slate' },
  medium: { label: 'Medium', tone: 'amber' },
  high: { label: 'High', tone: 'rose' },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
