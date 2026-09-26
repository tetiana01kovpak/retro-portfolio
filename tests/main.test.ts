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
let frames = 0;
const pending = new Map<number, FrameRequestCallback>();
const nextFrame = (t: number) => {
  const [[id, cb]] = pending;
  pending.delete(id);
  cb(t);
};

beforeAll(async () => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => (pending.set(++frames, cb), frames));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
  document.body.innerHTML = readFileSync('index.html', 'utf8').match(/<body>([\s\S]*)<\/body>/)![1];
  localStorage.setItem('tk-invaders-hi', '7');
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

test('key 5 opens the game; arrows play instead of switching screens', async () => {
  $('btn-click').click();
  await settle();
  await press('5');
  expect(location.hash).toBe('#game');
  expect(visible()).toEqual(['shell']);
  expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-screen')).toBe('game');
  expect(pending.size).toBe(0);
  await press('Enter');
  expect(pending.size).toBe(1);
  expect($('game-hi').textContent).toBe('0007');
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
  dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
  for (let t = 16; t < 5000 && $('game-score').textContent === '0000'; t += 16) nextFrame(t);
  dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
  vi.mocked(Math.random).mockRestore();
  const score = $('game-score').textContent;
  expect(Number(score)).toBeGreaterThan(7);
  expect($('game-hi').textContent).toBe(score);
  expect(localStorage.getItem('tk-invaders-hi')).toBe(String(Number(score)));
  const right = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
  dispatchEvent(right);
  await settle();
  expect(right.defaultPrevented).toBe(true);
  expect(location.hash).toBe('#game');
  await press('ArrowLeft');
  expect(location.hash).toBe('#game');
  expect(pending.size).toBe(1);
});

test('hiding the tab pauses the loop; P resumes it', async () => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(pending.size).toBe(0);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new Event('visibilitychange'));
  expect(pending.size).toBe(0);
  await press('p');
  expect(pending.size).toBe(1);
});

test('digits leave the game and cancel the loop; Esc goes home from it', async () => {
  await press('3');
  expect(location.hash).toBe('#experience');
  expect(pending.size).toBe(0);
  await press('5');
  expect(location.hash).toBe('#game');
  expect(pending.size).toBe(0);
  await press('p');
  expect(pending.size).toBe(1);
  await press('Escape');
  expect(visible()).toEqual(['view-welcome']);
  expect(pending.size).toBe(0);
});
