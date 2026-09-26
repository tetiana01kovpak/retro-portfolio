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
  await press('ArrowRight');
  await press('ArrowRight');
  expect(location.hash).toBe('#about');
  await press('Escape');
  expect(visible()).toEqual(['view-welcome']);
});

test('navigating right after pressing power cancels the pending reboot', async () => {
  $('power').click();
  await press('x');
  await vi.advanceTimersByTimeAsync(1000);
  expect(visible()).toEqual(['view-welcome']);
});
