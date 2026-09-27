// @vitest-environment happy-dom
import * as THREE from 'three';
import { afterEach, expect, test, vi } from 'vitest';
import { type Habit, localDate, plantTypes, saveHabits } from '../src/garden.ts';
import { mountGame, unmountGame } from '../src/gameview.ts';
import { growth, makePlant, maxGrowth, mountStage } from '../src/gardenscene.ts';
import { render } from '../src/screens.ts';

const gl = vi.hoisted(() => ({ fail: false, renderers: [] as { canvas: HTMLCanvasElement; renders: number; disposed: boolean }[] }));

vi.mock('three', async (original) => {
  const three = await original<typeof import('three')>();
  class WebGLRenderer {
    domElement = document.createElement('canvas');
    state = { canvas: this.domElement, renders: 0, disposed: false };
    constructor() {
      if (gl.fail) throw new Error('Error creating WebGL context.');
      gl.renderers.push(this.state);
    }
    setPixelRatio() {}
    setSize() {}
    render() { this.state.renders++; }
    dispose() { this.state.disposed = true; }
  }
  return { ...three, WebGLRenderer };
});

afterEach(() => {
  unmountGame();
  localStorage.clear();
  gl.fail = false;
  gl.renderers = [];
  document.body.replaceChildren();
});

const days = (n: number) => Array.from({ length: n }, (_, i) => localDate(new Date(2026, 0, 1 + i)));
const habit = (type: Habit['type'], done = 0): Habit => ({ id: `${type}-${done}`, name: type, type, dates: days(done) });
const parts = (group: THREE.Object3D) => {
  const counts: Record<string, number> = {};
  group.traverse((o) => { if (o instanceof THREE.Mesh) counts[o.name] = (counts[o.name] || 0) + 1; });
  return counts;
};
const size = (group: THREE.Object3D) => new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
const meshes = (group: THREE.Object3D) => {
  const list: THREE.Mesh[] = [];
  group.traverse((o) => { if (o instanceof THREE.Mesh) list.push(o); });
  return list;
};
const bounds = (group: THREE.Object3D, name: string) => {
  const box = new THREE.Box3();
  group.updateMatrixWorld(true);
  for (const m of meshes(group)) if (m.name === name) box.expandByObject(m);
  return box.getSize(new THREE.Vector3());
};

test('each plant type is built from the parts of its reference form', () => {
  const flower = parts(makePlant(habit('flower', 3)));
  expect(flower).toMatchObject({ pot: 1, stem: 1, center: 1 });
  expect(flower.petal).toBeGreaterThanOrEqual(5);
  expect(flower.leaf).toBeGreaterThanOrEqual(2);

  const tree = makePlant(habit('tree', 6));
  expect(parts(tree)).toMatchObject({ trunk: 1 });
  expect(bounds(tree, 'canopy').x).toBeGreaterThan(bounds(tree, 'trunk').x * 2);

  const cactus = parts(makePlant(habit('cactus', 1)));
  expect(cactus.body).toBeGreaterThanOrEqual(1);
  expect(cactus.arm).toBeGreaterThanOrEqual(4);

  const mushroom = makePlant(habit('mushroom', 2));
  expect(parts(mushroom).spot).toBeGreaterThanOrEqual(2);
  expect(bounds(mushroom, 'cap').x).toBeGreaterThan(bounds(mushroom, 'stem').x * 2);

  const crystal = parts(makePlant(habit('crystal', 0)));
  expect(crystal.shard).toBeGreaterThanOrEqual(3);
  expect(meshes(makePlant(habit('crystal'))).filter((m) => m.name === 'shard').every((m) => m.geometry instanceof THREE.ConeGeometry)).toBe(true);
});

test('every plant tags its meshes with the habit id for picking', () => {
  for (const type of plantTypes) {
    const plant = makePlant({ ...habit(type), id: 'pick-me' });
    expect(meshes(plant).every((m) => m.userData.id === 'pick-me')).toBe(true);
  }
});

test('every completion visibly grows the plant until it is full-grown', () => {
  for (const type of plantTypes) {
    let previous = size(makePlant(habit(type, 0)));
    for (let n = 1; n <= maxGrowth; n++) {
      const next = size(makePlant(habit(type, n)));
      expect(next.y, `${type} at ${n}`).toBeGreaterThan(previous.y + 0.02);
      previous = next;
    }
    expect(growth(habit(type, maxGrowth + 5))).toBe(maxGrowth);
  }
});

test('the same habit always builds the same plant', () => {
  for (const type of plantTypes) {
    expect(parts(makePlant(habit(type, 7)))).toEqual(parts(makePlant(habit(type, 7))));
    expect(size(makePlant(habit(type, 7)))).toEqual(size(makePlant(habit(type, 7))));
  }
});

const mount = () => {
  const root = document.createElement('div');
  root.innerHTML = render.game();
  document.body.replaceChildren(root);
  mountGame(root, matchMedia('(prefers-reduced-motion: reduce)'));
  return root;
};
const button = (root: HTMLElement, text: string) =>
  [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes(text))!;

test('with WebGL the garden draws a canvas and redraws after each change', () => {
  const root = mount();
  const [state] = gl.renderers;
  expect(root.querySelector('#garden-stage canvas')).toBe(state.canvas);
  const before = state.renders;
  root.querySelector<HTMLInputElement>('#garden-name')!.value = 'Read';
  root.querySelector('#garden-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  button(root, 'Mark done').click();
  expect(state.renders).toBe(before + 2);
});

test('without WebGL the same controls work beside a text garden', () => {
  gl.fail = true;
  const root = mount();
  const stage = root.querySelector('#garden-stage')!;
  expect(stage.querySelector('canvas')).toBeNull();
  expect(stage.textContent).toContain('3D garden unavailable');
  root.querySelector<HTMLInputElement>('#garden-name')!.value = 'Read';
  root.querySelector('#garden-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  const glyph = stage.querySelector<HTMLElement>('.garden-glyph')!;
  const small = parseFloat(glyph.style.fontSize);
  button(root, 'Mark done').click();
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Total: 1');
  expect(parseFloat(stage.querySelector<HTMLElement>('.garden-glyph')!.style.fontSize)).toBeGreaterThan(small);
  button(root, 'Remove').click();
  expect(stage.querySelector('.garden-glyph')).toBeNull();
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Your garden is empty');
});

test('clicking a text-garden plant selects its habit', () => {
  gl.fail = true;
  saveHabits([{ id: 'a', name: 'Walk', type: 'tree', dates: [] }, { id: 'b', name: 'Read', type: 'crystal', dates: [] }]);
  const root = mount();
  root.querySelector<HTMLElement>('.garden-glyph[data-id="b"]')!.click();
  expect(root.querySelector('#garden-detail strong')!.textContent).toBe('Read');
  expect(root.querySelector('.garden-glyph[data-id="b"]')!.getAttribute('aria-current')).toBe('true');
});

test('a lost WebGL context switches to the text garden and keeps the controls', () => {
  saveHabits([{ id: 'a', name: 'Walk', type: 'tree', dates: [] }]);
  const root = mount();
  const [state] = gl.renderers;
  state.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  const stage = root.querySelector('#garden-stage')!;
  expect(state.disposed).toBe(true);
  expect(stage.querySelector('canvas')).toBeNull();
  expect(stage.textContent).toContain('context was lost');
  expect(stage.querySelectorAll('.garden-glyph').length).toBe(1);
  button(root, 'Mark done').click();
  expect(root.querySelector('#garden-detail')!.textContent).toContain('Total: 1');
});

test('leaving the screen disposes the renderer and every GPU resource', () => {
  saveHabits(plantTypes.map((type, i) => ({ id: String(i), name: type, type, dates: days(i) })));
  const disposed = vi.spyOn(THREE.BufferGeometry.prototype, 'dispose');
  const materials = vi.spyOn(THREE.Material.prototype, 'dispose');
  mount();
  const [state] = gl.renderers;
  const geometries = disposed.mock.calls.length;
  unmountGame();
  expect(state.disposed).toBe(true);
  expect(state.canvas.isConnected).toBe(false);
  expect(disposed.mock.calls.length).toBeGreaterThan(geometries + plantTypes.length * 3);
  expect(materials.mock.calls.length).toBe(disposed.mock.calls.length);
  const renders = state.renders;
  dispatchEvent(new StorageEvent('storage', { key: 'tk-habit-garden' }));
  expect(state.renders).toBe(renders);
  disposed.mockRestore();
  materials.mockRestore();
});

test('remounting the screen leaves only one live renderer', () => {
  mount();
  mount();
  expect(gl.renderers.map((r) => r.disposed)).toEqual([true, false]);
  expect(document.querySelectorAll('canvas').length).toBe(1);
});

test('tapping a plant in the scene selects its habit', () => {
  const stage = document.createElement('div');
  const select = vi.fn();
  const view = mountStage(stage, select);
  view.draw([habit('mushroom', 4)], null);
  const canvas = stage.querySelector('canvas')!;
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 170 }) as DOMRect;
  canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 150, clientY: 5 }));
  expect(select).not.toHaveBeenCalled();
  canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 150, clientY: 85 }));
  expect(select).toHaveBeenCalledWith('mushroom-4');
  view.dispose();
  expect(stage.children.length).toBe(0);
});
