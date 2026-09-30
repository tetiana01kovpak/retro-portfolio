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
  localStorage.setItem('tk-habit-garden', JSON.stringify({ version: 1, habits: [
    { id: 'old', name: 'Old', type: 'flower', dates: [] },
    { id: 'bad', name: 'No dates', type: 'tree' },
    { id: 'odd', name: 'Odd', type: 'weed', dates: [] },
  ] }));
  await import('../src/main.ts');
});

test('boots, then any key skips to the welcome screen', async () => {
  await vi.advanceTimersByTimeAsync(2000);
  expect(visible()).toEqual(['view-boot']);
  expect($('boot-log').textContent).toContain('ROM BIOS');
  await press('x');
  expect(location.hash).toBe('#welcome');
  expect(visible()).toEqual(['view-welcome']);
  const stage = () => $('view-welcome').dataset.stage;
  const until = async (done: () => boolean) => {
    for (let t = 0; t < 10000 && !done(); t += 50) await vi.advanceTimersByTimeAsync(50);
    expect(done()).toBe(true);
  };
  expect(stage()).toBe('loading');
  await until(() => stage() === 'hello');
  await until(() => $('type-welcome').textContent === 'Welcome to my portfolio');
  expect($('type-name').textContent).toBe('');
  await until(() => stage() === 'intro');
  await until(() => $('view-welcome').classList.contains('typed'));
  expect($('type-tagline').textContent).toBe('Fullstack Developer');
  expect($('type-name').textContent).toBe('Tetiana Kovpak');
  await vi.advanceTimersByTimeAsync(5000);
  expect(stage()).toBe('intro');
  expect($('type-name').textContent).toBe('Tetiana Kovpak');
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
  expect($('pane').textContent).toContain('ePharmacy');
  expect($('pane').textContent).not.toContain('Habbit Garden');
  await press('ArrowRight');
  expect(location.hash).toBe('#experience');
  await press('ArrowLeft');
  await press('ArrowLeft');
  expect(location.hash).toBe('#about');
  await press('ArrowLeft');
  expect(location.hash).toBe('#contact');
  await press('Escape');
  expect(visible()).toEqual(['view-welcome']);
});

test('Next steps through every screen and wraps from Contact to About', async () => {
  $('btn-click').click();
  await settle();
  const seen = [];
  for (let k = 0; k < 5; k++) {
    $('btn-next').click();
    await settle();
    seen.push(location.hash);
  }
  expect(seen).toEqual(['#projects', '#experience', '#game', '#contact', '#about']);
});

test('a project opens a detail; Esc and Back return to the list with focus on it', async () => {
  await press('2');
  const openBtn = () => [...document.querySelectorAll<HTMLElement>('.project-open')].find((b) => b.textContent!.includes('TravelTrucks'))!;
  openBtn().click();
  const detail = () => document.querySelector('.project-detail');
  expect(detail()?.textContent).toContain('TravelTrucks');
  expect(detail()?.querySelector('svg rect')).not.toBeNull();
  expect(document.activeElement).toBe(detail());
  expect(['pane', 'btn-next'].map((id) => $(id).closest<HTMLElement>('[inert]'))).not.toContain(null);
  await press('Escape');
  expect(detail()).toBeNull();
  expect(visible()).toEqual(['shell']);
  expect(location.hash).toBe('#projects');
  expect(document.activeElement).toBe(openBtn());
  expect(document.querySelector('#shell [inert]')).toBeNull();
  openBtn().click();
  detail()!.querySelector<HTMLElement>('[data-back]')!.click();
  expect(detail()).toBeNull();
  expect(document.activeElement).toBe(openBtn());
  openBtn().click();
  await press('3');
  expect(location.hash).toBe('#experience');
  expect(detail()).toBeNull();
  expect(document.querySelector('#shell [inert]')).toBeNull();
  await press('Escape');
  expect(visible()).toEqual(['view-welcome']);
});

test('a key skips the intro; navigating right after power cancels the pending reboot', async () => {
  $('power').click();
  await settle();
  await press('x');
  expect($('view-welcome').dataset.stage).toBe('loading');
  await press('y');
  expect($('view-welcome').classList.contains('typed')).toBe(true);
  expect($('type-name').textContent).toBe('Tetiana Kovpak');
  expect(location.hash).toBe('#welcome');
  await vi.advanceTimersByTimeAsync(1000);
  expect(visible()).toEqual(['view-welcome']);
  expect($('type-tagline').textContent).toBe('Fullstack Developer');
});

test('key 4 opens the app launcher; Back and Esc return to it from the garden', async () => {
  $('btn-click').click();
  await settle();
  await press('4');
  expect(location.hash).toBe('#game');
  expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-screen')).toBe('game');
  expect(document.title.startsWith('App — ')).toBe(true);
  expect($('path').textContent).toBe('C:\\APP');
  const entries = () => [...document.querySelectorAll<HTMLElement>('#pane [data-app]')];
  expect(entries().map((b) => b.textContent!.includes('Habbit Garden'))).toEqual([false, true]);
  const garden = () => entries().find((entry) => entry.dataset.app === 'garden')!;
  expect(document.getElementById('garden-stage')).toBeNull();
  garden().click();
  expect(document.getElementById('garden-stage')).not.toBeNull();
  document.querySelector<HTMLElement>('[data-apps]')!.click();
  expect(document.getElementById('garden-stage')).toBeNull();
  expect(document.activeElement).toBe(garden());
  garden().click();
  await press('Escape');
  expect(location.hash).toBe('#game');
  expect(document.getElementById('garden-stage')).toBeNull();
  expect(document.activeElement).toBe(garden());
  await press('ArrowRight');
  expect(location.hash).toBe('#contact');
  await press('ArrowLeft');
  expect(location.hash).toBe('#game');
});

test('the Habbit Garden app: plant, mark done, then remove a habit', async () => {
  document.querySelector<HTMLElement>('#pane [data-app="garden"]')!.click();
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
  await press('4');
  $('btn-next').click();
  await settle();
  expect(location.hash).toBe('#contact');
});
