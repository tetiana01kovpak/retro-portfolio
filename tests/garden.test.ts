// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vitest';
import {
  complete, createHabit, type Habit, isDone, loadHabits, localDate, parseGarden, saveHabits, storageKey, streak, total,
} from '../src/garden.ts';
import { mountGame, unmountGame } from '../src/gameview.ts';
import { render } from '../src/screens.ts';

const habit = (dates: string[] = [], type: Habit['type'] = 'cactus'): Habit => ({ id: 'h1', name: 'Walk', type, dates });

afterEach(() => {
  unmountGame();
  vi.unstubAllGlobals();
  localStorage.clear();
  vi.useRealTimers();
});

const failWrites = () => {
  const real = localStorage;
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => real.getItem(key),
    removeItem: (key: string) => real.removeItem(key),
    setItem: () => { throw new Error('quota'); },
  });
};

test('localDate uses the local calendar day, not UTC', () => {
  expect(localDate(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  expect(localDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
});

test('completing the same day twice counts once', () => {
  const once = complete(habit(), '2026-03-01');
  const twice = complete(once, '2026-03-01');
  expect(twice).toBe(once);
  expect(total(twice)).toBe(1);
  expect(isDone(twice, '2026-03-01')).toBe(true);
  expect(isDone(twice, '2026-03-02')).toBe(false);
});

test('streak follows consecutive local dates across month and year boundaries', () => {
  const h = habit(['2025-12-30', '2025-12-31', '2026-01-01']);
  expect(streak(h, '2026-01-01')).toBe(3);
  expect(streak(h, '2026-01-02')).toBe(3);
  expect(streak(h, '2026-01-03')).toBe(0);
  expect(streak(habit(['2024-02-28', '2024-02-29', '2024-03-01']), '2024-03-01')).toBe(3);
  expect(streak(habit(['2026-03-01', '2026-03-03']), '2026-03-03')).toBe(1);
  expect(streak(habit(), '2026-03-03')).toBe(0);
});

test('streak survives a daylight saving change', () => {
  expect(streak(habit(['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-28', '2026-03-29', '2026-03-30']), '2026-03-09')).toBe(3);
  expect(streak(habit(['2026-03-28', '2026-03-29', '2026-03-30']), '2026-03-30')).toBe(3);
});

test('createHabit trims names, rejects blanks and unknown plants, and gives stable unique ids', () => {
  expect(createHabit('  Read  ', 'tree', 'x')).toEqual({ id: 'x', name: 'Read', type: 'tree', dates: [] });
  expect(createHabit('   ', 'tree')).toBeNull();
  expect(createHabit('Read', 'weed')).toBeNull();
  const a = createHabit('A', 'flower')!;
  const b = createHabit('B', 'flower')!;
  expect(a.id).not.toBe(b.id);
});

test('saved habits reload with the same id, plant type and dates', () => {
  const h = complete(createHabit('Stretch', 'mushroom')!, '2026-04-02');
  expect(saveHabits([h])).toBe(true);
  expect(JSON.parse(localStorage.getItem(storageKey)!).version).toBe(1);
  expect(loadHabits()).toEqual({ habits: [h], writable: true });
});

test('malformed or unknown saved data reads as unreadable', () => {
  for (const raw of ['', '{', 'null', '42', '"x"', '[]', '{"version":2,"habits":[]}', '{"version":1}']) {
    expect(parseGarden(raw)).toBeNull();
  }
});

test('unreadable saved data is backed up before the garden can save over it', () => {
  const raw = '{"version":2,"habits":[{"id":"x"}]}';
  localStorage.setItem(storageKey, raw);
  expect(loadHabits()).toEqual({ habits: [], writable: true });
  const backups = Object.keys(localStorage).filter((k) => k.startsWith(`${storageKey}-backup-`));
  expect(backups.map((k) => localStorage.getItem(k))).toEqual([raw]);
  expect(localStorage.getItem(storageKey)).toBe('{"version":1,"habits":[]}');
});

test('saved data that loses a habit or date when read is backed up once', () => {
  const walk = { id: 'a', name: 'Walk', type: 'tree', dates: ['2026-02-30'] };
  const raw = JSON.stringify({ version: 1, habits: [walk, { id: 'b', name: 'Run', type: 'fern', dates: ['2026-09-01'] }] });
  localStorage.setItem(storageKey, raw);
  const kept = { ...walk, dates: [] };
  expect(loadHabits()).toEqual({ habits: [kept], writable: true });
  expect(loadHabits()).toEqual({ habits: [kept], writable: true });
  const backups = Object.keys(localStorage).filter((k) => k.startsWith(`${storageKey}-backup-`));
  expect(backups.map((k) => localStorage.getItem(k))).toEqual([raw]);
});

test('lossy data that cannot be backed up keeps what it read but blocks saving', () => {
  const raw = '{"version":1,"habits":[{"id":"a","name":"Walk","type":"tree","dates":[]},{"id":"b"}]}';
  localStorage.setItem(storageKey, raw);
  failWrites();
  expect(loadHabits()).toEqual({ habits: [{ id: 'a', name: 'Walk', type: 'tree', dates: [] }], writable: false });
  expect(localStorage.getItem(storageKey)).toBe(raw);
});

test('unreadable data that cannot be backed up blocks saving', () => {
  localStorage.setItem(storageKey, '{');
  failWrites();
  expect(loadHabits()).toEqual({ habits: [], writable: false });
  expect(localStorage.getItem(storageKey)).toBe('{');
});

test('invalid habits, dates and duplicate ids are dropped', () => {
  const raw = JSON.stringify({ version: 1, habits: [
    { id: 'a', name: 'Ok', type: 'crystal', dates: ['2026-01-02', '2026-01-01', '2026-01-02', 'nope', '2026-02-30', 7] },
    { id: 'a', name: 'Dup', type: 'crystal', dates: [] },
    { id: 'b', name: 'No dates', type: 'tree' },
    { id: 'c', name: 'Weed', type: 'weed', dates: [] },
    { id: 'd', name: '  ', type: 'tree', dates: [] },
    null,
  ] });
  expect(parseGarden(raw)).toEqual([{ id: 'a', name: 'Ok', type: 'crystal', dates: ['2026-01-01', '2026-01-02'] }]);
});

test('unavailable storage loads empty and saves report failure without throwing', () => {
  const broken = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('quota'); },
  } as unknown as Storage;
  expect(loadHabits(broken)).toEqual({ habits: [], writable: false });
  expect(saveHabits([habit()], broken)).toBe(false);
  expect(loadHabits(null)).toEqual({ habits: [], writable: false });
  expect(saveHabits([habit()], null)).toBe(false);
});

const button = (root: HTMLElement, text: string) =>
  [...root.querySelectorAll<HTMLButtonElement>('#garden-detail button, #garden-list button')].find((b) => b.textContent!.includes(text))!;

const mount = () => {
  const root = document.createElement('div');
  root.innerHTML = render.game();
  document.body.replaceChildren(root);
  mountGame(root);
  return root;
};

test('the garden screen stays usable with malformed saved data', () => {
  localStorage.setItem(storageKey, '{not json');
  const root = mount();
  expect(root.querySelector('#garden-list')!.children.length).toBe(0);
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Your garden is empty');
});

test('the garden screen counts a day once and warns when saving fails', () => {
  failWrites();
  const root = mount();
  const form = root.querySelector<HTMLFormElement>('#garden-form')!;
  root.querySelector<HTMLInputElement>('#garden-name')!.value = 'Read';
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  const detail = root.querySelector('#garden-detail')!;
  const done = [...detail.querySelectorAll('button')].find((b) => b.textContent!.includes('Mark done'))!;
  done.click();
  done.click();
  expect(detail.textContent).toContain('Streak: 1 · Total: 1');
  expect(detail.textContent).toContain('Storage is unavailable');
});

test('a change in this tab keeps progress saved by another tab', () => {
  saveHabits([{ id: 'w', name: 'Walk', type: 'tree', dates: [] }, { id: 'r', name: 'Read', type: 'flower', dates: [] }]);
  const root = mount();
  const today = localDate();
  saveHabits([{ id: 'w', name: 'Walk', type: 'tree', dates: [today] }, { id: 'r', name: 'Read', type: 'flower', dates: [] }]);
  button(root, 'Read').click();
  button(root, 'Mark done').click();
  expect(loadHabits().habits.map((h) => h.dates)).toEqual([[today], [today]]);
});

test('another tab saving refreshes the open garden', () => {
  saveHabits([{ id: 'w', name: 'Walk', type: 'tree', dates: [] }]);
  const root = mount();
  saveHabits([{ id: 'w', name: 'Walk', type: 'tree', dates: [localDate()] }]);
  dispatchEvent(new StorageEvent('storage', { key: storageKey }));
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Today: done');
});

test('a garden left open past midnight offers the new day', () => {
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(new Date(2026, 4, 1, 23, 50));
  saveHabits([{ id: 'w', name: 'Walk', type: 'tree', dates: ['2026-05-01'] }]);
  const root = mount();
  expect(button(root, 'Done today').disabled).toBe(true);
  vi.advanceTimersByTime(20 * 60_000);
  expect(button(root, 'Mark done').disabled).toBe(false);
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Today: not yet · Streak: 1');
});
