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
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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
  expect(loadHabits()).toEqual([h]);
  expect(loadHabits()[0].type).toBe('mushroom');
});

test('empty, malformed or unknown saved data loads as an empty garden', () => {
  for (const raw of [null, '', '{', 'null', '42', '"x"', '{"version":2,"habits":[]}', '{"version":1}']) {
    expect(parseGarden(raw)).toEqual([]);
  }
});

test('invalid habits, dates and duplicate ids are dropped; the earlier array format still loads', () => {
  const raw = JSON.stringify([
    { id: 'a', name: 'Ok', type: 'crystal', dates: ['2026-01-02', '2026-01-01', '2026-01-02', 'nope', '2026-02-30', 7] },
    { id: 'a', name: 'Dup', type: 'crystal', dates: [] },
    { id: 'b', name: 'No dates', type: 'tree' },
    { id: 'c', name: 'Weed', type: 'weed', dates: [] },
    { id: 'd', name: '  ', type: 'tree', dates: [] },
    null,
  ]);
  expect(parseGarden(raw)).toEqual([{ id: 'a', name: 'Ok', type: 'crystal', dates: ['2026-01-01', '2026-01-02'] }]);
});

test('unavailable storage loads empty and saves report failure without throwing', () => {
  const broken = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('quota'); },
  } as unknown as Storage;
  expect(loadHabits(broken)).toEqual([]);
  expect(saveHabits([habit()], broken)).toBe(false);
  expect(loadHabits(null)).toEqual([]);
  expect(saveHabits([habit()], null)).toBe(false);
});

const mount = () => {
  const root = document.createElement('div');
  root.innerHTML = render.game();
  document.body.replaceChildren(root);
  mountGame(root, matchMedia('(prefers-reduced-motion: reduce)'));
  return root;
};

test('the garden screen stays usable with malformed saved data', () => {
  localStorage.setItem(storageKey, '{not json');
  const root = mount();
  expect(root.querySelector('#garden-list')!.children.length).toBe(0);
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Your garden is empty');
});

test('the garden screen counts a day once and warns when saving fails', () => {
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
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
