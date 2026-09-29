export type PlantType = 'flower' | 'tree' | 'cactus' | 'mushroom' | 'crystal';
export type Habit = { id: string; name: string; type: PlantType; dates: string[] };
type Stored = { version: 1; habits: Habit[] };

export const plantTypes: PlantType[] = ['flower', 'tree', 'cactus', 'mushroom', 'crystal'];
export const storageKey = 'tk-habit-garden';
export const maxName = 40;

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a date as YYYY-MM-DD in the browser's local time zone. */
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (day: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return localDate(date) === day ? date : null;
};

const previousDay = (day: string) => {
  const date = parseDate(day)!;
  date.setDate(date.getDate() - 1);
  return localDate(date);
};

export const isDone = (habit: Habit, day = localDate()) => habit.dates.includes(day);

export const total = (habit: Habit) => habit.dates.length;

/** Counts consecutive completed days ending today, or yesterday while today is still open. */
export const streak = (habit: Habit, day = localDate()) => {
  const done = new Set(habit.dates);
  let cursor = done.has(day) ? day : previousDay(day);
  let count = 0;
  while (done.has(cursor)) {
    count++;
    cursor = previousDay(cursor);
  }
  return count;
};

/** Marks a habit done on a day; completing the same day again returns the habit unchanged. */
export const complete = (habit: Habit, day = localDate()): Habit =>
  isDone(habit, day) ? habit : { ...habit, dates: [...habit.dates, day].sort() };

const newId = () => globalThis.crypto?.randomUUID?.()
  ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createHabit = (name: string, type: string, id = newId()): Habit | null => {
  const clean = name.trim().slice(0, maxName);
  return clean && plantTypes.includes(type as PlantType) ? { id, name: clean, type: type as PlantType, dates: [] } : null;
};

const toHabit = (value: unknown): Habit | null => {
  const h = value as Partial<Habit> | null;
  if (!h || typeof h.id !== 'string' || !h.id || typeof h.name !== 'string' || !h.name.trim()
    || !plantTypes.includes(h.type as PlantType) || !Array.isArray(h.dates)) return null;
  const dates = [...new Set(h.dates.filter((d): d is string => typeof d === 'string' && parseDate(d) !== null))].sort();
  return { id: h.id, name: h.name.trim().slice(0, maxName), type: h.type as PlantType, dates };
};

/** Parses versioned garden data, dropping invalid habits and dates; returns null when unreadable. */
export const parseGarden = (raw: string): Habit[] | null => {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return null; }
  const list = (data as Stored | null)?.version === 1 ? (data as Stored).habits : null;
  if (!Array.isArray(list)) return null;
  const seen = new Set<string>();
  return list.map(toHabit).filter((h): h is Habit => !!h && !seen.has(h.id) && !!seen.add(h.id));
};

const serialize = (habits: Habit[]) => JSON.stringify({ version: 1, habits } satisfies Stored);

const storage = () => {
  try { return globalThis.localStorage ?? null; } catch { return null; }
};

/**
 * Loads saved habits. Data that is unreadable or loses anything when parsed is copied to a `tk-habit-garden-backup-<time>` key
 * and replaced by what could be read, before the garden may save over it;
 * `writable` is false when storage is unavailable or that backup could not be made.
 */
export const loadHabits = (store = storage()): { habits: Habit[]; writable: boolean } => {
  if (!store) return { habits: [], writable: false };
  let habits: Habit[] = [];
  try {
    const raw = store.getItem(storageKey);
    if (raw === null) return { habits, writable: true };
    habits = parseGarden(raw) ?? [];
    const clean = serialize(habits);
    if (raw !== clean) {
      store.setItem(`${storageKey}-backup-${Date.now()}`, raw);
      store.setItem(storageKey, clean);
    }
    return { habits, writable: true };
  } catch { return { habits, writable: false }; }
};

/** Saves habits; returns false when the browser refuses storage. */
export const saveHabits = (habits: Habit[], store = storage()): boolean => {
  if (!store) return false;
  try {
    store.setItem(storageKey, serialize(habits));
    return true;
  } catch { return false; }
};
