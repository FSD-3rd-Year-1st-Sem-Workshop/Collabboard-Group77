/** Formats an ISO date as "Aug 6" for compact display on task cards. */
export function formatShortDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Formats an ISO date as "Aug 6, 2026" for the task details modal. */
export function formatLongDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Formats an ISO datetime as "Aug 6, 2026, 10:30 AM" for audit fields. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}


export function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}
