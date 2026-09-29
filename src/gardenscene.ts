import * as THREE from 'three';
import { type Habit, type PlantType, total } from './garden';

const colors: Record<PlantType, number> = {
  flower: 0xff86ae, tree: 0x79ce8a, cactus: 0x91db67, mushroom: 0xd495ef, crystal: 0x82d5ff,
};
const glyphs: Record<PlantType, string> = { flower: '✿', tree: '♣', cactus: 'Ψ', mushroom: '♠', crystal: '◆' };

/** Completions that still change a plant's size; later ones keep the full-grown form. */
export const maxGrowth = 30;
/** Growth stage of a habit's plant, from 0 (sprout) to {@link maxGrowth}. */
export const growth = (habit: Habit) => Math.min(total(habit), maxGrowth);

const material = (color: number) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75 });
const part = (group: THREE.Object3D, name: string, geometry: THREE.BufferGeometry, color: number, x: number, y: number, z = 0) => {
  const m = new THREE.Mesh(geometry, material(color));
  m.name = name;
  m.position.set(x, y, z);
  group.add(m);
  return m;
};
const ball = (group: THREE.Object3D, name: string, radius: number, color: number, x: number, y: number, z = 0) =>
  part(group, name, new THREE.IcosahedronGeometry(radius, 0), color, x, y, z);
const column = (group: THREE.Object3D, name: string, radius: number, height: number, color: number, x: number, y: number, z = 0) =>
  part(group, name, new THREE.CylinderGeometry(radius * 0.8, radius, height, 6), color, x, y, z);

const builders: Record<PlantType, (group: THREE.Group, g: number, h: number, color: number) => void> = {
  flower(group, g, h, color) {
    column(group, 'stem', 0.04 + g * 0.0006, h, 0x65b969, 0, h / 2 + 0.1);
    const leaves = 2 + Math.floor(g / 10);
    for (let i = 0; i < leaves; i++) {
      const side = i % 2 ? 1 : -1;
      const leaf = ball(group, 'leaf', 0.09 + g * 0.003, 0x82cf75, side * 0.13, h * (0.3 + 0.18 * i) + 0.1);
      leaf.scale.set(1.5, 0.4, 0.8);
      leaf.rotation.z = side * 0.4;
    }
    const petals = 5 + Math.floor(g / 6);
    const r = 0.09 + g * 0.005;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      ball(group, 'petal', r, color, Math.cos(a) * r * 1.3, h + 0.13 + Math.sin(a) * r * 1.3, 0.04).scale.z = 0.5;
    }
    ball(group, 'center', r * 0.85, 0xffdd77, 0, h + 0.13, 0.1);
  },
  tree(group, g, h, color) {
    column(group, 'trunk', 0.07 + g * 0.002, h, 0x8f6947, 0, h / 2 + 0.1);
    const size = 0.22 + g * 0.009;
    ball(group, 'canopy', size, color, 0, h + size * 0.55).scale.set(1.2, 0.95, 1.1);
    const blobs = Math.min(4, Math.floor(g / 3));
    for (let i = 0; i < blobs; i++) {
      const a = (i / Math.max(blobs, 1)) * Math.PI * 2;
      ball(group, 'canopy', size * 0.62, i % 2 ? 0x4fa96d : 0x9ee19a, Math.cos(a) * size * 0.85, h + size * 0.3, Math.sin(a) * size * 0.5);
    }
  },
  cactus(group, g, h, color) {
    const r = 0.1 + g * 0.002;
    column(group, 'body', r, h, color, 0, h / 2 + 0.1);
    ball(group, 'body', r * 0.95, color, 0, h + 0.1).scale.y = 0.6;
    const arms = g >= 10 ? 3 : 2;
    for (let i = 0; i < arms; i++) {
      const side = i % 2 ? 1 : -1;
      const y = h * (0.35 + 0.15 * i) + 0.1;
      const reach = r + 0.07;
      column(group, 'arm', 0.045, 0.12, color, side * reach, y).rotation.z = Math.PI / 2;
      const up = h * (0.3 + g * 0.006);
      column(group, 'arm', 0.05, up, color, side * (reach + 0.06), y + up / 2);
    }
    if (g >= 4) ball(group, 'bloom', 0.06 + g * 0.002, 0xffaa75, 0, h + 0.17);
  },
  mushroom(group, g, h, color) {
    const stem = 0.07 + g * 0.002;
    column(group, 'stem', stem, h, 0xece2c4, 0, h / 2 + 0.1);
    const cap = 0.2 + g * 0.008;
    part(group, 'cap', new THREE.SphereGeometry(cap, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), color, 0, h + 0.08).scale.y = 0.8;
    const spots = 2 + Math.floor(g / 5);
    for (let i = 0; i < spots; i++) {
      const a = (i / spots) * Math.PI * 2;
      ball(group, 'spot', 0.028 + g * 0.0008, 0xffe7f8, Math.cos(a) * cap * 0.55, h + 0.08 + cap * 0.55, Math.sin(a) * cap * 0.55);
    }
    if (g >= 6) {
      column(group, 'stem', 0.035, h * 0.4, 0xece2c4, 0.22, h * 0.2 + 0.1);
      part(group, 'cap', new THREE.SphereGeometry(cap * 0.45, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), color, 0.22, h * 0.4 + 0.1);
    }
  },
  crystal(group, g, h, color) {
    const shards = Math.min(9, 3 + Math.floor(g / 4));
    for (let i = 0; i < shards; i++) {
      const angle = (i / shards) * Math.PI * 2;
      const height = h * (i === 0 ? 1.45 : 0.65 + (i % 3) * 0.12);
      const x = i === 0 ? 0 : Math.cos(angle) * 0.16;
      const z = i === 0 ? 0 : Math.sin(angle) * 0.16;
      const shard = part(group, 'shard', new THREE.ConeGeometry(0.09 + g * 0.002, height, 5), i % 2 ? 0x6eaacb : color, x, height / 2 + 0.1, z);
      shard.rotation.z = i === 0 ? 0 : -Math.cos(angle) * 0.25;
      shard.rotation.x = i === 0 ? 0 : Math.sin(angle) * 0.25;
    }
  },
};

/** Builds the low-poly plant for a habit; every mesh carries the habit id in `userData.id`. */
export function makePlant(habit: Habit): THREE.Group {
  const group = new THREE.Group();
  const g = growth(habit);
  part(group, 'pot', new THREE.CylinderGeometry(0.37, 0.31, 0.14, 8), 0x756040, 0, 0.02);
  part(group, 'soil', new THREE.CylinderGeometry(0.36, 0.36, 0.035, 8), 0x4b783c, 0, 0.105);
  (builders[habit.type] || builders.flower)(group, g, 0.3 + g * 0.04, colors[habit.type] || colors.flower);
  group.traverse((object) => { object.userData.id = habit.id; });
  return group;
}

/** Position of the i-th plant on the round garden bed. */
const spot = (i: number) => {
  const angle = i * 2.39996;
  const radius = 0.68 * Math.sqrt(i);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius, radius] as const;
};

const dispose = (root: THREE.Object3D) => {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((mat) => mat.dispose());
    }
  });
};

/** Garden view drawn into the stage element: a Three.js scene, or a text garden without WebGL. */
export type GardenStage = { draw(habits: Habit[], selected: string | null): void; dispose(): void };

function textStage(stage: HTMLElement, select: (id: string) => void, reason: string): GardenStage {
  stage.classList.add('garden-fallback');
  const note = document.createElement('p');
  note.textContent = `${reason} Showing a text garden; every habit control below still works.`;
  const bed = document.createElement('div');
  bed.className = 'garden-text';
  bed.setAttribute('role', 'group');
  bed.setAttribute('aria-label', 'Text garden');
  stage.replaceChildren(note, bed);
  return {
    draw(habits, selected) {
      bed.replaceChildren(...habits.map((habit) => {
        const plant = document.createElement('button');
        plant.type = 'button';
        plant.className = 'garden-glyph';
        plant.dataset.id = habit.id;
        plant.dataset.focus = `glyph:${habit.id}`;
        plant.style.fontSize = `${1 + growth(habit) / 15}em`;
        plant.textContent = glyphs[habit.type] || glyphs.flower;
        plant.title = `${habit.name}: ${total(habit)} done`;
        plant.setAttribute('aria-label', plant.title);
        plant.tabIndex = habit.id === selected || (!habits.some((h) => h.id === selected) && habit === habits[0]) ? 0 : -1;
        if (habit.id === selected) plant.setAttribute('aria-current', 'true');
        plant.addEventListener('click', () => select(habit.id));
        return plant;
      }));
    },
    dispose() {
      stage.classList.remove('garden-fallback');
      stage.replaceChildren();
    },
  };
}

/** Mounts the garden view in `stage`, falling back to a text garden when WebGL fails or its context is lost. */
export function mountStage(stage: HTMLElement, select: (id: string) => void): GardenStage {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    return textStage(stage, select, '3D garden unavailable: this browser cannot start WebGL.');
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const canvas = renderer.domElement;
  stage.replaceChildren(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x102b20);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xcaffd7, 0x254125, 2.3));
  const light = new THREE.DirectionalLight(0xffe5b0, 2.4);
  light.position.set(-3, 6, 5);
  scene.add(light);
  const ground = part(scene, 'ground', new THREE.CylinderGeometry(1, 1.04, 0.16, 12), 0x2d5734, 0, -0.12);
  ground.rotation.y = Math.PI / 12;
  const marker = part(scene, 'marker', new THREE.RingGeometry(0.42, 0.5, 16), 0xf4ff9a, 0, 0.012);
  marker.rotation.x = -Math.PI / 2;
  const plants = new THREE.Group();
  scene.add(plants);
  const view = new THREE.Vector3(0, 0.55, 0.84).normalize();
  const bounds = new THREE.Box3();
  let framed: THREE.Vector3[] = [];
  let last: [Habit[], string | null] = [[], null];
  let fallback: GardenStage | null = null;

  const render = () => {
    const width = stage.clientWidth || 300;
    const height = stage.clientHeight || 170;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const target = bounds.getCenter(new THREE.Vector3());
    const right = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3().crossVectors(view, right);
    let distance = 0;
    for (const point of framed) {
      const offset = point.clone().sub(target);
      const depth = offset.dot(view);
      distance = Math.max(distance, depth + Math.abs(offset.dot(right)) / (tan * camera.aspect), depth + Math.abs(offset.dot(up)) / tan);
    }
    camera.position.copy(target).addScaledVector(view, distance * 1.08);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
    renderer.render(scene, camera);
  };
  const clear = () => {
    const old = plants.children.slice();
    plants.clear();
    old.forEach(dispose);
  };
  const pick = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);
    const id = ray.intersectObjects(plants.children, true)[0]?.object.userData.id as string | undefined;
    if (id) select(id);
  };
  const resize = new ResizeObserver(render);
  const teardown = () => {
    canvas.removeEventListener('pointerdown', pick);
    canvas.removeEventListener('webglcontextlost', lost);
    resize.disconnect();
    clear();
    dispose(scene);
    renderer.dispose();
    canvas.remove();
  };
  function lost(event: Event) {
    event.preventDefault();
    teardown();
    fallback = textStage(stage, select, '3D garden stopped: the graphics context was lost.');
    fallback.draw(...last);
  }
  canvas.addEventListener('pointerdown', pick);
  canvas.addEventListener('webglcontextlost', lost);
  resize.observe(stage);

  return {
    draw(habits, selected) {
      last = [habits, selected];
      if (fallback) return fallback.draw(habits, selected);
      clear();
      let spread = 0;
      marker.visible = false;
      habits.forEach((habit, i) => {
        const [x, z, radius] = spot(i);
        const plant = makePlant(habit);
        plant.position.set(x, 0, z);
        spread = Math.max(spread, radius);
        if (habit.id === selected) {
          plant.scale.setScalar(1.1);
          marker.position.set(x, marker.position.y, z);
          marker.visible = true;
        }
        plants.add(plant);
      });
      const bed = spread + 0.75;
      ground.scale.set(bed, 1, bed);
      const plantBox = new THREE.Box3().setFromObject(plants);
      framed = Array.from({ length: 24 }, (_, i) => {
        const a = (i / 6) * Math.PI;
        return new THREE.Vector3(Math.cos(a) * bed, i < 12 ? 0 : -0.2, Math.sin(a) * bed);
      });
      if (!plantBox.isEmpty()) {
        for (const x of [plantBox.min.x, plantBox.max.x]) for (const y of [plantBox.min.y, plantBox.max.y]) for (const z of [plantBox.min.z, plantBox.max.z]) {
          framed.push(new THREE.Vector3(x, y, z));
        }
      }
      bounds.setFromPoints(framed);
      render();
    },
    dispose() {
      if (fallback) fallback.dispose();
      else teardown();
    },
  };
}
