// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { beforeAll, expect, test } from 'vitest';
import { type Habit, saveHabits } from '../src/garden.ts';

const $ = (id: string) => document.getElementById(id)!;
const tick = () => new Promise((resolve) => setTimeout(resolve, 10));
const habits: Habit[] = [
  { id: 'a', name: 'Walk', type: 'tree', dates: [] },
  { id: 'b', name: 'Read', type: 'crystal', dates: [] },
  { id: 'c', name: 'Water', type: 'cactus', dates: [] },
];
const open = async (saved = habits) => {
  localStorage.clear();
  saveHabits(saved);
  location.hash = '#about';
  await tick();
  location.hash = '#game';
  await tick();
};
const key = async (target: Element, k: string) => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  await tick();
};
const items = () => [...$('garden-list').querySelectorAll<HTMLButtonElement>('.garden-item')];
const action = (text: string) => [...$('garden-detail').querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes(text))!;
const active = () => document.activeElement as HTMLElement;

beforeAll(async () => {
  document.body.innerHTML = readFileSync('index.html', 'utf8').match(/<body>([\s\S]*)<\/body>/)![1];
  location.hash = '#game';
  await import('../src/main.ts');
  await tick();
});

test('every garden control is a focusable element with one tab stop for the plant list', async () => {
  await open();
  const form = $('garden-form');
  for (const el of form.querySelectorAll<HTMLElement>('input, select, button')) expect(el.tabIndex).toBe(0);
  expect(items().map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  expect(items()[0].getAttribute('aria-label')).toBe('Walk, not done today');
  expect(['Mark done', 'Remove'].map((t) => action(t).tagName)).toEqual(['BUTTON', 'BUTTON']);
  expect($('garden-status').getAttribute('role')).toBe('status');
});

test('arrow, Home and End keys move selection and focus through the plants', async () => {
  await open();
  items()[0].focus();
  await key(active(), 'ArrowDown');
  expect(active()).toBe(items()[1]);
  expect(items()[1].getAttribute('aria-pressed')).toBe('true');
  expect(items().map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
  expect($('garden-detail').querySelector('strong')!.textContent).toBe('Read');
  await key(active(), 'End');
  expect(active()).toBe(items()[2]);
  await key(active(), 'ArrowDown');
  expect(active()).toBe(items()[0]);
  await key(active(), 'ArrowUp');
  expect(active()).toBe(items()[2]);
  await key(active(), 'Home');
  expect(active()).toBe(items()[0]);
});

test('focus survives redraws and every action reports its result', async () => {
  await open();
  items()[1].click();
  items()[1].focus();
  items()[1].click();
  expect(active()).toBe(items()[1]);
  action('Mark done').focus();
  action('Mark done').click();
  expect($('garden-status').textContent).toBe('Read marked done. Streak: 1 · Total: 1.');
  expect(action('Done today').disabled).toBe(true);
  expect(active()).toBe(items()[1]);
  action('Remove').focus();
  action('Remove').click();
  expect($('garden-status').textContent).toBe('Read removed.');
  expect(active()).toBe(items()[0]);
  expect(items()[0].getAttribute('aria-pressed')).toBe('true');
  const name = $('garden-name') as HTMLInputElement;
  name.value = 'Stretch';
  $('garden-form').dispatchEvent(new Event('submit', { cancelable: true }));
  expect($('garden-status').textContent).toBe('Stretch planted as a flower.');
  name.value = '   ';
  $('garden-form').dispatchEvent(new Event('submit', { cancelable: true }));
  expect($('garden-status').textContent).toBe('Give the habit a name first.');
  expect(active()).toBe(name);
});

test('removing the last plant moves focus back to the habit name field', async () => {
  await open([habits[0]]);
  action('Remove').focus();
  action('Remove').click();
  expect(active()).toBe($('garden-name'));
  expect($('garden-detail').textContent).toContain('Your garden is empty');
});

test('text-garden plants are focusable buttons that arrow keys walk through', async () => {
  await open();
  const glyphs = () => [...$('garden-stage').querySelectorAll<HTMLButtonElement>('.garden-glyph')];
  expect(glyphs().map((g) => [g.tagName, g.tabIndex])).toEqual([['BUTTON', 0], ['BUTTON', -1], ['BUTTON', -1]]);
  expect(glyphs()[1].getAttribute('aria-label')).toBe('Read: 0 done');
  glyphs()[0].focus();
  await key(active(), 'ArrowRight');
  expect(active()).toBe(glyphs()[1]);
  expect(glyphs()[1].getAttribute('aria-current')).toBe('true');
  expect($('garden-detail').querySelector('strong')!.textContent).toBe('Read');
});

test('garden keys stay on the garden while digits and Escape keep their portfolio meaning', async () => {
  await open();
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'Enter', ' ', 'Home', 'End']) {
    await key(active() === document.body ? items()[0] : active(), k);
    expect(location.hash).toBe('#game');
  }
  for (const k of ['2', 'Escape', 'x']) {
    await key($('garden-name'), k);
    expect(location.hash).toBe('#game');
  }
  await key(items()[0], '3');
  expect(location.hash).toBe('#experience');
  await open();
  await key(items()[0], 'Escape');
  expect(location.hash).not.toBe('#game');
  expect($('shell').hidden).toBe(true);
});
