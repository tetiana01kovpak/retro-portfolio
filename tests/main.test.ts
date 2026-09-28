// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { beforeAll, expect, test, vi } from 'vitest';

const $ = (id: string) => document.getElementById(id)!;
const visible = () => ['view-boot', 'view-welcome', 'shell'].filter((id) => !$(id).hidden);
const realTimeout = setTimeout;
const settle = async (ms = 20) => {
  await new Promise((r) => realTimeout(r, 5));
  await vi.advanceTimersByTimeAsync(ms);
};
const press = async (key: string) => {
  dispatchEvent(new KeyboardEvent('keydown', { key }));
  await settle();
};

beforeAll(async () => {
  vi.useFakeTimers();
  document.body.innerHTML = readFileSync('index.html', 'utf8').match(/<body>([\s\S]*)<\/body>/)![1];
  localStorage.setItem('tk-habit-garden', JSON.stringify([
    { id: 'old', name: 'Old', type: 'flower', dates: [] },
    { id: 'bad', name: 'No dates', type: 'tree' },
    { id: 'odd', name: 'Odd', type: 'weed', dates: [] },
  ]));
  await import('../src/main.ts');
});

test('boots, then any key skips to the welcome screen', async () => {
  await vi.advanceTimersByTimeAsync(2000);
  expect(visible()).toEqual(['view-boot']);
  expect($('boot-log').textContent).toContain('ROM BIOS');
  await press('x');
  expect(location.hash).toBe('#welcome');
  expect(visible()).toEqual(['view-welcome']);
  await vi.advanceTimersByTimeAsync(5000);
  expect($('type-welcome').textContent).toBe('Welcome to my portfolio');
  expect($('type-tagline').textContent).toBe('Full stack developer');
});

test('Click opens About, one screen at a time', async () => {
  $('btn-click').click();
  await settle();
  expect(location.hash).toBe('#about');
  expect(visible()).toEqual(['shell']);
  expect($('pane').textContent).toContain('Tetiana Kovpak');
  expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-screen')).toBe('about');
});

test('keyboard switches screens and Escape goes home', async () => {
  await press('2');
  expect(location.hash).toBe('#projects');
  expect($('pane').textContent).toContain('Habbit Garden');
  await press('ArrowRight');
  expect(location.hash).toBe('#experience');
  await press('ArrowLeft');
  await press('ArrowLeft');
  expect(location.hash).toBe('#about');
  await press('ArrowLeft');
  expect(location.hash).toBe('#game');
  await press('Escape');
  expect(visible()).toEqual(['view-welcome']);
});

test('navigating right after pressing power cancels the pending reboot', async () => {
  $('power').click();
  await press('x');
  await vi.advanceTimersByTimeAsync(1000);
  expect(visible()).toEqual(['view-welcome']);
});

test('key 5 opens the garden; plant, mark done, then remove a habit', async () => {
  $('btn-click').click();
  await settle();
  await press('5');
  expect(location.hash).toBe('#game');
  expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-screen')).toBe('game');
  expect(document.title.startsWith('Habit Garden — ')).toBe(true);
  expect($('path').textContent).toBe('C:\\GARDEN');
  expect($('garden-list').children.length).toBe(1);
  expect($('garden-detail').textContent).toContain('Old');
  const form = $('garden-form') as HTMLFormElement;
  ($('garden-name') as HTMLInputElement).value = 'Read';
  form.querySelector('select')!.value = 'tree';
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  expect($('garden-list').children.length).toBe(2);
  expect($('garden-detail').textContent).toContain('TREE · Today: not yet · Streak: 0 · Total: 0');
  const button = (text: string) => [...$('garden-detail').querySelectorAll('button')].find((b) => b.textContent!.includes(text))!;
  button('Mark done').click();
  expect($('garden-detail').textContent).toContain('Today: done · Streak: 1 · Total: 1');
  expect(button('Done today').disabled).toBe(true);
  expect($('garden-list').textContent).toContain('✓ Read');
  const stored = JSON.parse(localStorage.getItem('tk-habit-garden')!).habits;
  expect(stored.map((h: { name: string }) => h.name)).toEqual(['Old', 'Read']);
  expect(stored[1].dates).toHaveLength(1);
  button('Remove').click();
  expect($('garden-list').children.length).toBe(1);
  expect(JSON.parse(localStorage.getItem('tk-habit-garden')!).habits.map((h: { name: string }) => h.name)).toEqual(['Old']);
});

test('digits typed in the garden form stay on the garden', async () => {
  const select = document.querySelector<HTMLSelectElement>('#garden-form select')!;
  select.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
  await settle();
  expect(location.hash).toBe('#game');
  await press('ArrowRight');
  expect(location.hash).toBe('#game');
  await press('3');
  expect(location.hash).toBe('#experience');
});
