import '@fontsource/vt323/latin-400.css';
import './style.css';
import { profile } from './content.ts';
import { mountGame, unmountGame } from './gameview.ts';
import { appView, mailto, projectDetail, render, screens, type Screen } from './screens.ts';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const computer = $('computer');
const crt = $('crt');
const bootView = $('view-boot');
const bootLog = $('boot-log');
const bootProgress = $('boot-progress');
const bootBar = $('boot-bar');
const bootPct = $('boot-pct');
const welcomeView = $('view-welcome');
const typeWelcome = $('type-welcome');
const typeTagline = $('type-tagline');
const typeName = $('type-name');
const welcomeBar = $('welcome-bar');
const clickBtn = $<HTMLButtonElement>('btn-click');
const shell = $('shell');
const pane = $('pane');
const path = $('path');
const clock = $('clock');
const menuLinks = [...document.querySelectorAll<HTMLAnchorElement>('.menu a')];

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let run = 0;
let current: Screen | 'welcome' | 'boot' = 'boot';
let initial = location.hash !== '';

class Skipped extends Error {}

function wait(ms: number, id: number) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(() => (id === run ? resolve() : reject(new Skipped())), reduced.matches ? 0 : ms),
  );
}

async function type(el: HTMLElement, text: string, id: number, speed = 55) {
  el.textContent = '';
  for (const ch of text) {
    el.textContent += ch;
    await wait(ch === ' ' ? speed * 1.6 : speed + Math.random() * 40, id);
  }
}

const bootLines: [string, number][] = [
  ['KOVPAK SYSTEMS TK-1977  ROM BIOS v1.9', 260],
  ['(C) 1977-2026 T. KOVPAK. ALL RIGHTS RESERVED.', 380],
  ['', 120],
  ['CPU ........ FULLSTACK-8080 @ 2 MHz', 220],
  ['@MEM', 0],
  ['FD0 ........ TETIANA.DSK', 220],
  ['', 100],
  ['LOADING DRIVERS', 160],
  ['  REACT.DRV ............ [ OK ]', 150],
  ['  NODE.DRV ............. [ OK ]', 150],
  ['  THREEJS.DRV .......... [ OK ]', 150],
  ['  TYPESCRIPT.DRV ....... [ OK ]', 150],
  ['  COFFEE.SYS ........... [ OK ]', 260],
  ['', 80],
];

function show(view: 'boot' | 'welcome' | 'shell') {
  unmountGame();
  openApp = null;
  bootView.hidden = view !== 'boot';
  welcomeView.hidden = view !== 'welcome';
  shell.hidden = view !== 'shell';
}

function blinkDisk() {
  computer.classList.remove('disk');
  if (reduced.matches) return;
  void computer.offsetWidth;
  computer.classList.add('disk');
}

async function boot() {
  const id = ++run;
  current = 'boot';
  show('boot');
  bootLog.textContent = '';
  bootProgress.hidden = true;
  computer.dataset.state = 'booting';
  crt.classList.remove('on', 'instant');
  void crt.offsetWidth;
  crt.classList.add('on');
  try {
    await wait(900, id);
    for (const [line, delay] of bootLines) {
      if (line === '@MEM') {
        const row = document.createTextNode('');
        bootLog.append(row);
        for (let k = 0; k <= 64; k += 4) {
          row.textContent = `MEMORY ..... ${String(k).padStart(3, '0')}K${k === 64 ? ' OK' : ''}\n`;
          await wait(35, id);
        }
        continue;
      }
      bootLog.append(`${line}\n`);
      if (line.includes('[ OK ]')) blinkDisk();
      await wait(delay, id);
    }
    bootProgress.hidden = false;
    for (let p = 0; p <= 100; p += 2) {
      bootBar.style.width = `${p}%`;
      bootPct.textContent = `${p}%`;
      await wait(p > 70 && p < 80 ? 70 : 18, id);
    }
    await wait(400, id);
    welcome(true);
  } catch (e) {
    if (!(e instanceof Skipped)) throw e;
  }
}

function introDone() {
  welcomeView.dataset.stage = 'intro';
  typeTagline.textContent = profile.tagline;
  typeName.textContent = profile.name;
  welcomeView.classList.add('typed');
  clickBtn.focus({ preventScroll: true });
}

async function welcome(animate: boolean) {
  const id = ++run;
  current = 'welcome';
  computer.dataset.state = 'on';
  crt.classList.add('on');
  show('welcome');
  document.title = `${profile.name} — ${profile.tagline}`;
  welcomeView.classList.remove('typed');
  if (!animate || reduced.matches) return introDone();
  typeWelcome.textContent = typeTagline.textContent = typeName.textContent = '';
  welcomeView.dataset.stage = 'loading';
  try {
    for (let p = 0; p <= 100; p += 4) {
      welcomeBar.style.width = `${p}%`;
      await wait(40, id);
    }
    await wait(250, id);
    welcomeView.dataset.stage = 'hello';
    await type(typeWelcome, profile.welcome, id);
    await wait(1100, id);
    welcomeView.dataset.stage = 'intro';
    await wait(300, id);
    await type(typeTagline, profile.tagline, id, 45);
    await wait(200, id);
    await type(typeName, profile.name, id);
    await wait(250, id);
    introDone();
  } catch (e) {
    if (!(e instanceof Skipped)) throw e;
  }
}

function open(screen: Screen) {
  run++;
  current = screen;
  computer.dataset.state = 'on';
  crt.classList.add('on');
  show('shell');
  closeDetail();
  pane.innerHTML = render[screen]();
  [...pane.children].forEach((el, i) => (el as HTMLElement).style.setProperty('--i', String(i)));
  pane.scrollTop = 0;
  pane.classList.remove('enter');
  void pane.offsetWidth;
  pane.setAttribute('aria-label', screen);
  if (!initial) {
    pane.classList.add('enter');
    pane.focus({ preventScroll: true });
  }
  initial = false;
  const label = screen === 'game' ? 'app' : screen;
  path.textContent = `C:\\${label.toUpperCase()}`;
  document.title = `${label[0].toUpperCase()}${label.slice(1)} — ${profile.name}`;
  for (const a of menuLinks) {
    if (a.dataset.screen === screen) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  blinkDisk();
  if (screen === 'contact') bindForm();
}

const mounts: Record<string, (root: HTMLElement) => void> = { garden: mountGame };
let openApp: string | null = null;

function launch(id: string) {
  openApp = id;
  pane.innerHTML = appView(id);
  pane.scrollTop = 0;
  mounts[id](pane);
  pane.querySelector<HTMLElement>('[data-apps]')!.focus({ preventScroll: true });
}

function closeApp() {
  if (!openApp) return false;
  const id = openApp;
  openApp = null;
  unmountGame();
  pane.innerHTML = render.game();
  pane.querySelector<HTMLElement>(`[data-app="${id}"]`)?.focus({ preventScroll: true });
  return true;
}

function bindForm() {
  const form = document.getElementById('mail-form') as HTMLFormElement;
  const status = document.getElementById('form-status')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!name || !message) {
      status.textContent = '? SYNTAX ERROR: NAME AND MESSAGE REQUIRED';
      (form.elements.namedItem(name ? 'message' : 'name') as HTMLElement).focus();
      return;
    }
    status.textContent = 'OPENING YOUR MAIL PROGRAM...';
    location.href = mailto(name, String(data.get('subject') ?? '').trim(), message);
  });
}

function bootAfter(ms: number) {
  const id = ++run;
  setTimeout(() => id === run && boot(), reduced.matches ? 0 : ms);
}

function route() {
  const hash = location.hash.slice(1);
  if ((screens as readonly string[]).includes(hash)) open(hash as Screen);
  else if (current !== 'boot' || hash === 'welcome') welcome(current === 'boot');
}

function go(target: Screen | 'welcome') {
  if (location.hash === `#${target}`) route();
  else location.hash = target;
}

addEventListener('hashchange', route);

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (current === 'boot') {
    if (e.key !== 'Tab') go('welcome');
    return;
  }
  const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
    || e.target instanceof HTMLSelectElement;
  if (e.key === 'Escape') {
    if (typing) (e.target as HTMLElement).blur();
    else if (!closeDetail() && !closeApp()) go('welcome');
    return;
  }
  if (typing) return;
  if (current === 'welcome') {
    if (!welcomeView.classList.contains('typed')) {
      if (e.key !== 'Tab') skipIntro();
      return;
    }
    if (e.key === 'Enter' && document.activeElement !== clickBtn) go('about');
    return;
  }
  const n = Number(e.key);
  if (n >= 1 && n <= screens.length) go(screens[n - 1]);
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (step && !openApp) go(screens[(screens.indexOf(current) + step + screens.length) % screens.length]);
});

const next = () => screens[(screens.indexOf(current as Screen) + 1) % screens.length];

const cover = (on: boolean) => {
  for (const el of shell.children) if (!el.classList.contains('project-detail')) (el as HTMLElement).inert = on;
};

function closeDetail() {
  const detail = shell.querySelector('.project-detail');
  if (!detail) return false;
  detail.remove();
  cover(false);
  pane.querySelector<HTMLElement>(`[data-project="${detail.getAttribute('data-for')}"]`)?.focus({ preventScroll: true });
  return true;
}

pane.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const app = target.closest<HTMLElement>('[data-app]');
  if (app) return launch(app.dataset.app!);
  if (target.closest('[data-apps]')) return void closeApp();
  const btn = target.closest<HTMLElement>('[data-project]');
  if (!btn) return;
  shell.insertAdjacentHTML('beforeend', projectDetail(Number(btn.dataset.project)));
  const detail = shell.lastElementChild as HTMLElement;
  cover(true);
  detail.querySelector('[data-back]')!.addEventListener('click', closeDetail);
  detail.focus({ preventScroll: true });
});

const skipIntro = () => {
  run++;
  introDone();
};

bootView.addEventListener('click', () => go('welcome'));
welcomeView.addEventListener('click', (e) => {
  if (!welcomeView.classList.contains('typed') && e.target !== clickBtn) skipIntro();
});
$('btn-next').addEventListener('click', () => go(next()));
clickBtn.addEventListener('click', () => go('about'));
$('power').addEventListener('click', () => {
  history.replaceState(null, '', location.pathname + location.search);
  unmountGame();
  computer.dataset.state = 'off';
  crt.classList.remove('on');
  current = 'boot';
  bootAfter(500);
});

const tick = () => (clock.textContent = new Date().toTimeString().slice(0, 5));
tick();
setInterval(tick, 15000);

if (location.hash) {
  current = 'welcome';
  crt.classList.add('instant');
  route();
} else {
  bootAfter(350);
}
