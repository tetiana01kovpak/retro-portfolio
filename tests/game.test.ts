import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  ALIEN_H, ALIEN_W, COLS, DROP, LIVES, MARGIN, ROWS, SHIP_W, SHIP_Y, W,
  alienSpeed, createGame, points, start, step, togglePause, type Game, type Input,
} from '../src/game.ts';

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const calm = () => 1;
const idle: Input = { left: false, right: false, fire: false };
const fire: Input = { ...idle, fire: true };
const dt = 1 / 60;
const run = (g: Game, n: number, input = idle, rng = calm) => {
  for (let i = 0; i < n; i++) g = step(g, dt, input, rng);
  return g;
};
const playing = () => start(createGame());
const under = (g: Game, i: number): Game => ({ ...g, ship: g.aliens[i].x + ALIEN_W / 2 - SHIP_W / 2 });

test('a new game waits for start with a full grid and 3 lives', () => {
  const g = createGame();
  assert.equal(g.phase, 'ready');
  assert.equal(g.aliens.length, ROWS * COLS);
  assert.equal(g.lives, LIVES);
  assert.equal(step(g, dt, fire, calm), g);
  assert.equal(start(g).phase, 'playing');
});

test('pause freezes the game and resumes it', () => {
  const paused = togglePause(playing());
  assert.equal(paused.phase, 'paused');
  assert.equal(run(paused, 30, fire), paused);
  assert.equal(togglePause(paused).phase, 'playing');
  assert.equal(togglePause(createGame()).phase, 'ready');
});

test('step does not mutate its input', () => {
  const g = playing();
  const copy = structuredClone(g);
  step(g, dt, fire, seeded(1));
  assert.deepEqual(g, copy);
});

test('ship moves and is clamped to the field', () => {
  const g = playing();
  assert.ok(run(g, 10, { ...idle, right: true }).ship > g.ship);
  assert.equal(run(g, 600, { ...idle, left: true }).ship, MARGIN);
  assert.equal(run(g, 600, { ...idle, right: true }).ship, W - MARGIN - SHIP_W);
});

test('only one player shot is in flight at a time', () => {
  let g = step(playing(), dt, fire, calm);
  const first = g.shot!;
  assert.ok(first);
  g = step(g, dt, fire, calm);
  assert.ok(g.shot!.y < first.y);
  assert.equal(g.shot!.x, first.x);
});

test('a shot that misses leaves the field and frees the gun', () => {
  let g = { ...playing(), ship: MARGIN };
  g = step(g, dt, fire, calm);
  g = run(g, 120);
  assert.equal(g.shot, null);
  assert.equal(g.aliens.length, ROWS * COLS);
  assert.ok(step(g, dt, fire, calm).shot);
});

test('a hit removes the alien and scores by row', () => {
  let g = step(under(playing(), (ROWS - 1) * COLS), dt, fire, calm);
  for (let i = 0; i < 120 && g.shot; i++) g = step(g, dt, idle, calm);
  assert.equal(g.aliens.length, ROWS * COLS - 1);
  assert.equal(g.aliens.filter((a) => a.row === ROWS - 1).length, COLS - 1);
  assert.equal(g.score, points(ROWS - 1));
  assert.deepEqual([points(0), points(1), points(ROWS - 1)], [30, 20, 10]);
});

test('the grid marches sideways, steps down at the edge and reverses', () => {
  const g0 = playing();
  const g1 = run(g0, 1);
  assert.ok(g1.aliens[0].x > g0.aliens[0].x);
  assert.equal(g1.aliens[0].y, g0.aliens[0].y);
  let g = g1;
  while (g.dir === 1) g = step(g, dt, idle, calm);
  assert.equal(g.aliens[0].y, g0.aliens[0].y + DROP);
  assert.equal(Math.max(...g.aliens.map((a) => a.x)) + ALIEN_W, W - MARGIN);
  const x = g.aliens[0].x;
  assert.ok(run(g, 1).aliens[0].x < x);
});

test('the grid speeds up as aliens thin out and on later waves', () => {
  const g = playing();
  assert.ok(alienSpeed({ ...g, aliens: g.aliens.slice(10) }) > alienSpeed(g));
  assert.ok(alienSpeed({ ...g, wave: 2 }) > alienSpeed(g));
});

test('aliens shoot back occasionally', () => {
  const g = run(playing(), 180, idle, seeded(7));
  assert.ok(g.bombs.length > 0 || g.lives < LIVES);
  assert.equal(run(playing(), 180).bombs.length, 0);
});

test('a bomb on the ship costs a life and the last one ends the game', () => {
  const g0 = playing();
  const bomb = { x: g0.ship + SHIP_W / 2, y: SHIP_Y - 2 };
  const g = step({ ...g0, bombs: [bomb] }, dt, idle, calm);
  assert.equal(g.lives, LIVES - 1);
  assert.equal(g.bombs.length, 0);
  assert.equal(g.phase, 'playing');
  const last = step({ ...g0, lives: 1, bombs: [bomb] }, dt, idle, calm);
  assert.equal(last.lives, 0);
  assert.equal(last.phase, 'over');
});

test('aliens reaching the ship row end the game', () => {
  const g0 = playing();
  const g = step({ ...g0, aliens: g0.aliens.map((a) => ({ ...a, y: SHIP_Y - ALIEN_H })) }, dt, idle, calm);
  assert.equal(g.phase, 'over');
  assert.equal(step(g, dt, idle, calm), g);
});

test('clearing the wave starts a faster one', () => {
  const g0 = playing();
  const last = { ...g0.aliens[0], y: SHIP_Y - 16 };
  let g = under({ ...g0, aliens: [last], score: 100 }, 0);
  g = step(g, dt, fire, calm);
  for (let i = 0; i < 120 && g.wave === 1; i++) g = step(g, dt, idle, calm);
  assert.equal(g.wave, 2);
  assert.equal(g.phase, 'playing');
  assert.equal(g.aliens.length, ROWS * COLS);
  assert.equal(g.score, 100 + points(0));
  assert.ok(alienSpeed(g) > alienSpeed(g0));
});

test('restart after game over begins a fresh game', () => {
  const over: Game = { ...playing(), phase: 'over', score: 500, lives: 0, wave: 3 };
  const g = start(over);
  assert.equal(g.phase, 'playing');
  assert.deepEqual([g.score, g.lives, g.wave], [0, LIVES, 1]);
  assert.equal(start(g), g);
});
