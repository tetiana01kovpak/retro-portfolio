export const W = 224;
export const H = 256;
export const COLS = 8;
export const ROWS = 5;
export const ALIEN_W = 12;
export const ALIEN_H = 8;
export const SHIP_W = 13;
export const SHIP_H = 8;
export const SHIP_Y = H - 24;
export const SHOT_H = 4;
export const LIVES = 3;
export const MARGIN = 8;
export const DROP = 8;

const GAP_X = 16;
const GAP_Y = 16;
const TOP = 40;
const SHIP_SPEED = 90;
const SHOT_SPEED = 240;
const BOMB_SPEED = 80;
const BASE_SPEED = 12;
const EXTRA_SPEED = 60;
const WAVE_BOOST = 0.2;
const FIRE_RATE = 0.8;
const TICK = 1 / 60;

export type Phase = 'ready' | 'playing' | 'paused' | 'over';
export type Rng = () => number;
export interface Input { left: boolean; right: boolean; fire: boolean }
export interface Point { x: number; y: number }
export interface Alien extends Point { row: number }

export interface Game {
  phase: Phase;
  score: number;
  lives: number;
  wave: number;
  ship: number;
  shot: Point | null;
  bombs: Point[];
  aliens: Alien[];
  dir: 1 | -1;
}

export const points = (row: number) => (row === 0 ? 30 : row < 3 ? 20 : 10);

const grid = (): Alien[] =>
  Array.from({ length: ROWS * COLS }, (_, i) => {
    const row = Math.floor(i / COLS);
    return { row, x: MARGIN + 16 + (i % COLS) * GAP_X, y: TOP + row * GAP_Y };
  });

export const createGame = (): Game => ({
  phase: 'ready',
  score: 0,
  lives: LIVES,
  wave: 1,
  ship: (W - SHIP_W) / 2,
  shot: null,
  bombs: [],
  aliens: grid(),
  dir: 1,
});

export const start = (g: Game): Game =>
  g.phase === 'ready' || g.phase === 'over' ? { ...createGame(), phase: 'playing' } : g;

export const togglePause = (g: Game): Game =>
  g.phase === 'playing' ? { ...g, phase: 'paused' } : g.phase === 'paused' ? { ...g, phase: 'playing' } : g;

export const alienSpeed = (g: Game) =>
  (BASE_SPEED + EXTRA_SPEED * (1 - g.aliens.length / (ROWS * COLS))) * (1 + WAVE_BOOST * (g.wave - 1));

const overlaps = (p: Point, h: number, x: number, y: number, w: number, bh: number) =>
  p.x >= x && p.x <= x + w && p.y + h >= y && p.y <= y + bh;

const tick = (g: Game, dt: number, input: Input, rng: Rng) => {
  g.ship = Math.min(W - MARGIN - SHIP_W, Math.max(MARGIN, g.ship + (+input.right - +input.left) * SHIP_SPEED * dt));
  if (input.fire && !g.shot) g.shot = { x: g.ship + SHIP_W / 2, y: SHIP_Y - SHOT_H };

  const dx = g.dir * alienSpeed(g) * dt;
  for (const a of g.aliens) a.x += dx;
  const xs = g.aliens.map((a) => a.x);
  const over = Math.max(MARGIN - Math.min(...xs), Math.max(...xs) + ALIEN_W - (W - MARGIN));
  if (over > 0) {
    for (const a of g.aliens) {
      a.x -= g.dir * over;
      a.y += DROP;
    }
    g.dir = g.dir === 1 ? -1 : 1;
  }

  if (g.shot) {
    g.shot.y -= SHOT_SPEED * dt;
    const shot = g.shot;
    const hit = g.aliens.findIndex((a) => overlaps(shot, SHOT_H, a.x, a.y, ALIEN_W, ALIEN_H));
    if (hit >= 0) {
      g.score += points(g.aliens[hit].row);
      g.aliens.splice(hit, 1);
      g.shot = null;
    } else if (shot.y + SHOT_H < 0) g.shot = null;
  }

  if (g.aliens.length && rng() < FIRE_RATE * (1 + WAVE_BOOST * (g.wave - 1)) * dt) {
    const pick = g.aliens[Math.floor(rng() * g.aliens.length)];
    const shooter = g.aliens.filter((a) => a.x === pick.x).reduce((b, a) => (a.y > b.y ? a : b));
    g.bombs.push({ x: shooter.x + ALIEN_W / 2, y: shooter.y + ALIEN_H });
  }
  for (const b of g.bombs) b.y += BOMB_SPEED * dt;
  g.bombs = g.bombs.filter((b) => b.y < H);
  if (g.bombs.some((b) => overlaps(b, SHOT_H, g.ship, SHIP_Y, SHIP_W, SHIP_H))) {
    g.bombs = [];
    g.shot = null;
    g.lives -= 1;
    if (g.lives === 0) g.phase = 'over';
  }

  if (g.aliens.some((a) => a.y + ALIEN_H >= SHIP_Y)) g.phase = 'over';
  else if (!g.aliens.length) {
    g.wave += 1;
    g.aliens = grid();
    g.dir = 1;
    g.shot = null;
    g.bombs = [];
  }
};

export const step = (state: Game, dt: number, input: Input, rng: Rng): Game => {
  if (state.phase !== 'playing') return state;
  const g = structuredClone(state);
  for (let t = dt; t > 0 && g.phase === 'playing'; t -= TICK) tick(g, Math.min(t, TICK), input, rng);
  return g;
};
