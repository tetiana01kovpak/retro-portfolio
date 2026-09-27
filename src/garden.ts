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

/** Parses saved garden data, accepting the versioned format and the earlier bare array, dropping anything invalid. */
export const parseGarden = (raw: string | null): Habit[] => {
  if (!raw) return [];
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return []; }
  const list = Array.isArray(data) ? data : (data as Stored | null)?.version === 1 ? (data as Stored).habits : null;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  return list.map(toHabit).filter((h): h is Habit => !!h && !seen.has(h.id) && !!seen.add(h.id));
};

const storage = () => {
  try { return globalThis.localStorage ?? null; } catch { return null; }
};

export const loadHabits = (store = storage()): Habit[] => {
  try { return parseGarden(store?.getItem(storageKey) ?? null); } catch { return []; }
};

/** Saves habits; returns false when the browser refuses storage. */
export const saveHabits = (habits: Habit[], store = storage()): boolean => {
  if (!store) return false;
  try {
    store.setItem(storageKey, JSON.stringify({ version: 1, habits } satisfies Stored));
    return true;
  } catch { return false; }
};
