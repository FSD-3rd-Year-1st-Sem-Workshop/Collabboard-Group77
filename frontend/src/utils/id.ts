/** Generates a short client-side id for mock records (tasks, boards).**/
// Untill api kattiya mongo db danakn This is a basic uuid gen

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
