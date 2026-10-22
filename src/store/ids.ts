export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function dayKey(time: number = Date.now()): string {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Day keys for the current week, Monday first. */
export function weekDayKeys(now: number = Date.now()): string[] {
  const d = new Date(now);
  const mondayOffset = (d.getDay() + 6) % 7;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, i) =>
    dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i).getTime()),
  );
}
