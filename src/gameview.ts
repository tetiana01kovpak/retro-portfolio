import { ALIEN_H, H, SHIP_H, SHIP_Y, SHOT_H, W, createGame, start, step, togglePause, type Game, type Input } from './game.ts';

export const SCALE = 3;
const HI_KEY = 'tk-invaders-hi';
const PHOSPHOR = '#f7f9fa';
const HI = '#ffffff';
const AMBER = '#d1d9dc';

const sprites = [
  ['.....##.....', '....####....', '...######...', '..##.##.##..', '..########..', '....#..#....', '...#.##.#...', '..#.#..#.#..'],
  ['..#.....#...', '...#...#....', '..#######...', '.##.###.##..', '###########.', '#.#######.#.', '#.#.....#.#.', '...##.##....'],
  ['....####....', '.##########.', '############', '###..##..###', '############', '...##..##...', '..##.##.##..', '##........##'],
];
const shipSprite = ['......#......', '.....###.....', '.....###.....', '.###########.', '#############', '#############', '#############', '#############'];
const boomSprite = ['#...#..#...#', '.#...##...#.', '..#......#..', '##........##', '..#......#..', '.#...##...#.', '#...#..#...#', '............'];

const loadHi = () => {
  try {
    return Number(localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
};

const saveHi = (n: number) => {
  try {
    localStorage.setItem(HI_KEY, String(n));
  } catch {}
};

let g: Game = createGame();
let hi = loadHi();
const input: Input = { left: false, right: false, fire: false };
let raf = 0;
let last = 0;
let boom: { x: number; y: number; t: number } | null = null;
let unmount: (() => void) | null = null;

export function unmountGame() {
  unmount?.();
  unmount = null;
}

export function mountGame(root: HTMLElement, reduced: MediaQueryList) {
  unmountGame();
  const ctx = root.querySelector('canvas')?.getContext('2d') ?? null;
  const hud = (id: string) => root.querySelector<HTMLElement>(`#game-${id}`)!;
  const [score, lives, best] = ['score', 'lives', 'hi'].map(hud);

  const sprite = (rows: string[], ox: number, oy: number) =>
    rows.forEach((r, y) => [...r].forEach((c, x) => c === '#' && ctx!.rect(ox + x, oy + y, 1, 1)));

  const text = (lines: string[]) => {
    ctx!.fillStyle = HI;
    ctx!.textAlign = 'center';
    ctx!.font = '16px VT323, monospace';
    lines.forEach((l, i) => ctx!.fillText(l, W / 2, 150 + i * 18));
  };

  const draw = (t = 0) => {
    score.textContent = String(g.score).padStart(4, '0');
    lives.textContent = '♥'.repeat(g.lives) || '-';
    best.textContent = String(hi).padStart(4, '0');
    if (!ctx) return;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.shadowColor = PHOSPHOR;
    ctx.shadowBlur = SCALE * (reduced.matches || g.phase !== 'playing' ? 4 : 4 + 1.5 * Math.sin(t / 250));
    ctx.fillStyle = PHOSPHOR;
    ctx.beginPath();
    for (const a of g.aliens) sprite(sprites[Math.ceil(a.row / 2)], Math.round(a.x), Math.round(a.y));
    sprite(shipSprite, Math.round(g.ship), SHIP_Y);
    ctx.fill();
    ctx.fillRect(0, SHIP_Y + SHIP_H + 4, W, 1);
    ctx.fillStyle = HI;
    if (g.shot) ctx.fillRect(g.shot.x - 0.5, g.shot.y, 1, SHOT_H);
    if (boom) {
      ctx.beginPath();
      sprite(boomSprite, Math.round(boom.x - 6), Math.round(boom.y - ALIEN_H / 2));
      ctx.fill();
    }
    ctx.fillStyle = AMBER;
    ctx.shadowColor = AMBER;
    for (const b of g.bombs) ctx.fillRect(b.x - 0.5, b.y, 1, SHOT_H);
    ctx.shadowColor = PHOSPHOR;
    if (g.phase === 'ready') text(['INVADERS', `WAVE ${g.wave}`, 'PRESS ENTER / START']);
    else if (g.phase === 'paused') text(['PAUSED', 'P / START TO RESUME']);
    else if (g.phase === 'over') text(['GAME OVER', `SCORE ${g.score}`, 'PRESS ENTER / START']);
  };

  const running = () => g.phase === 'playing' && !document.hidden;

  const frame = (t: number) => {
    const dt = last ? Math.min(t - last, 100) / 1000 : 0;
    last = t;
    const prev = g;
    g = step(g, dt, input, Math.random);
    if (g.score > prev.score && prev.shot && !reduced.matches) boom = { ...prev.shot, t: 0.2 };
    else if (boom && (boom.t -= dt) <= 0) boom = null;
    if (g.score > hi) saveHi((hi = g.score));
    draw(t);
    raf = running() ? requestAnimationFrame(frame) : 0;
  };

  const sync = () => {
    if (running() && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!running() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    draw();
  };

  const hold = (key: string) =>
    key === 'ArrowLeft' || key === 'a' || key === 'A' ? 'left'
    : key === 'ArrowRight' || key === 'd' || key === 'D' ? 'right'
    : key === ' ' ? 'fire'
    : null;

  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = hold(e.key);
    if (k) {
      e.preventDefault();
      input[k] = e.type === 'keydown';
    } else if (e.type === 'keydown' && e.key === 'Enter') g = start(g);
    else if (e.type === 'keydown' && (e.key === 'p' || e.key === 'P')) g = togglePause(g);
    else return;
    sync();
  };

  const release = () => {
    input.left = input.right = input.fire = false;
  };

  const onVisibility = () => {
    release();
    if (document.hidden && g.phase === 'playing') g = togglePause(g);
    sync();
  };

  const touch = root.querySelector<HTMLElement>('.game-touch');
  const onPointer = (e: PointerEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-hold],[data-tap]');
    if (!btn) return;
    const k = btn.dataset.hold as keyof Input | undefined;
    if (k) input[k] = e.type === 'pointerdown';
    else if (e.type === 'pointerdown') g = g.phase === 'ready' || g.phase === 'over' ? start(g) : togglePause(g);
    sync();
  };
  const pointerTypes = ['pointerdown', 'pointerup', 'pointercancel', 'pointerout'] as const;

  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);
  addEventListener('blur', release);
  document.addEventListener('visibilitychange', onVisibility);
  for (const type of pointerTypes) touch?.addEventListener(type, onPointer);
  if (ctx) document.fonts?.ready.then(() => draw());
  sync();

  unmount = () => {
    removeEventListener('keydown', onKey);
    removeEventListener('keyup', onKey);
    removeEventListener('blur', release);
    document.removeEventListener('visibilitychange', onVisibility);
    release();
    boom = null;
    cancelAnimationFrame(raf);
    raf = 0;
    if (g.phase === 'playing') g = togglePause(g);
  };
}
