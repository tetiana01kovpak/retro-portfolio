import * as THREE from 'three';
import {
  complete, createHabit, type Habit, isDone, loadHabits, localDate, type PlantType, saveHabits, streak, total,
} from './garden';

const colors: Record<PlantType, number> = {
  flower: 0xff86ae, tree: 0x79ce8a, cactus: 0x91db67, mushroom: 0xd495ef, crystal: 0x82d5ff,
};
const material = (color: number) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75 });
const mesh = (group: THREE.Object3D, geometry: THREE.BufferGeometry, color: number, x: number, y: number, z = 0) => {
  const m = new THREE.Mesh(geometry, material(color));
  m.position.set(x, y, z);
  group.add(m);
  return m;
};
const ball = (group: THREE.Group, radius: number, color: number, x: number, y: number, z = 0) =>
  mesh(group, new THREE.IcosahedronGeometry(radius, 0), color, x, y, z);
const column = (group: THREE.Group, radius: number, height: number, color: number, x: number, y: number, z = 0) =>
  mesh(group, new THREE.CylinderGeometry(radius * 0.8, radius, height, 6), color, x, y, z);

function makePlant(habit: Habit): THREE.Group {
  const group = new THREE.Group();
  group.userData.id = habit.id;
  const n = Math.min(total(habit), 12);
  const h = 0.32 + n * 0.085;
  const bloom = colors[habit.type] || colors.flower;
  const soil = mesh(group, new THREE.CylinderGeometry(0.37, 0.31, 0.14, 8), 0x756040, 0, 0.02);
  soil.userData.id = habit.id;
  mesh(group, new THREE.CylinderGeometry(0.36, 0.36, 0.035, 8), 0x4b783c, 0, 0.105);
  if (habit.type === 'flower') {
    column(group, 0.045, h, 0x65b969, 0, h / 2 + 0.1);
    for (const side of [-1, 1]) {
      const leaf = ball(group, 0.105 + n * 0.004, 0x82cf75, side * 0.14, h * 0.55 + 0.1);
      leaf.scale.set(1.4, 0.45, 0.8);
    }
    const count = 5 + Math.floor(n / 4);
    const r = 0.105 + n * 0.009;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const petal = ball(group, r, bloom, Math.cos(a) * r * 1.3, h + 0.13 + Math.sin(a) * r * 1.3, 0.04);
      petal.scale.z = 0.55;
    }
    ball(group, r * 0.85, 0xffdd77, 0, h + 0.13, 0.1);
  } else if (habit.type === 'tree') {
    column(group, 0.07 + n * 0.003, h, 0x8f6947, 0, h / 2 + 0.1);
    const canopy = ball(group, 0.24 + n * 0.018, bloom, 0, h + 0.06);
    canopy.scale.set(1.25, 0.9, 1.05);
    if (n >= 3) {
      ball(group, 0.15 + n * 0.008, 0x4fa96d, -0.2, h - 0.04);
      ball(group, 0.15 + n * 0.008, 0x9ee19a, 0.2, h - 0.01);
    }
  } else if (habit.type === 'cactus') {
    column(group, 0.11 + n * 0.004, h, bloom, 0, h / 2 + 0.1);
    ball(group, 0.105 + n * 0.004, bloom, 0, h + 0.1).scale.y = 0.65;
    for (const side of [-1, 1]) {
      const arm = column(group, 0.055, h * (0.38 + n * 0.005), bloom, side * 0.19, h * 0.53 + 0.1);
      arm.rotation.z = side * -0.35;
    }
    if (n >= 2) ball(group, 0.08 + n * 0.004, 0xffaa75, 0, h + 0.19);
  } else if (habit.type === 'mushroom') {
    column(group, 0.07 + n * 0.003, h, 0xece2c4, 0, h / 2 + 0.1);
    const cap = mesh(group, new THREE.SphereGeometry(0.22 + n * 0.018, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), bloom, 0, h + 0.08);
    cap.scale.y = 0.85;
    for (const x of [-0.11, 0.08]) ball(group, 0.03 + n * 0.002, 0xffe7f8, x, h + 0.24 + n * 0.01, 0.08);
  } else {
    const count = 3 + Math.floor(n / 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const height = h * (i === 0 ? 1.45 : 0.65 + (i % 3) * 0.12);
      const shard = mesh(group, new THREE.ConeGeometry(0.10 + n * 0.004, height, 5), i % 2 ? 0x6eaacb : bloom,
        i === 0 ? 0 : Math.cos(angle) * 0.16, height / 2 + 0.1, i === 0 ? 0 : Math.sin(angle) * 0.16);
      shard.rotation.z = i === 0 ? 0 : Math.cos(angle) * 0.2;
    }
  }
  group.traverse((object) => { object.userData.id = habit.id; });
  return group;
}

let cleanup: (() => void) | null = null;
export function unmountGame() { cleanup?.(); cleanup = null; }

export function mountGame(root: HTMLElement, _reduced: MediaQueryList) {
  unmountGame();
  const stage = root.querySelector<HTMLElement>('#garden-stage')!;
  const form = root.querySelector<HTMLFormElement>('#garden-form')!;
  const list = root.querySelector<HTMLElement>('#garden-list')!;
  const detail = root.querySelector<HTMLElement>('#garden-detail')!;
  let habits = loadHabits();
  let saved = true;
  const save = () => { saved = saveHabits(habits); };
  let selected = habits[0]?.id || null;
  let renderer: THREE.WebGLRenderer | null = null;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x102b20);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 4.8, 7.6);
  camera.lookAt(0, 0.2, 0);
  scene.add(new THREE.HemisphereLight(0xcaffd7, 0x254125, 2.3));
  const light = new THREE.DirectionalLight(0xffe5b0, 2.4);
  light.position.set(-3, 6, 5);
  scene.add(light);
  const ground = mesh(scene, new THREE.CylinderGeometry(3.7, 3.85, 0.16, 12), 0x2d5734, 0, -0.12);
  ground.rotation.y = Math.PI / 12;
  const plants = new THREE.Group();
  scene.add(plants);
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    stage.append(renderer.domElement);
  } catch {
    stage.textContent = '3D garden unavailable. Use the habit list below.';
  }
  const render3d = () => {
    if (!renderer) return;
    const width = stage.clientWidth || 300;
    const height = stage.clientHeight || 170;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const dispose = (group: THREE.Object3D) => {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => mat.dispose());
      }
    });
  };
  const refresh = () => {
    while (plants.children.length) {
      const child = plants.children[0] as THREE.Group;
      plants.remove(child);
      dispose(child);
    }
    habits.forEach((habit, i) => {
      const plant = makePlant(habit);
      const angle = i * 2.39996;
      const radius = Math.min(2.7, 0.48 * Math.sqrt(i));
      plant.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      if (selected === habit.id) plant.scale.setScalar(1.1);
      plants.add(plant);
    });
    list.replaceChildren();
    const today = localDate();
    for (const habit of habits) {
      const button = document.createElement('button');
      button.className = 'garden-item';
      button.type = 'button';
      button.textContent = `${isDone(habit, today) ? '✓' : '○'} ${habit.name}`;
      button.setAttribute('aria-pressed', String(selected === habit.id));
      button.addEventListener('click', () => { selected = habit.id; refresh(); });
      list.append(button);
    }
    detail.replaceChildren();
    const habit = habits.find((item) => item.id === selected);
    if (!habit) {
      detail.textContent = habits.length ? 'Select a plant to see its progress.' : 'Your garden is empty. Plant your first habit.';
    } else {
      const title = document.createElement('strong');
      title.textContent = habit.name;
      const stats = document.createElement('p');
      stats.textContent = `${habit.type.toUpperCase()} · Today: ${isDone(habit, today) ? 'done' : 'not yet'} · Streak: ${streak(habit, today)} · Total: ${total(habit)}`;
      const done = document.createElement('button');
      done.className = 'btn';
      done.type = 'button';
      done.textContent = isDone(habit, today) ? '[ Done today ]' : '[ Mark done ]';
      done.disabled = isDone(habit, today);
      done.addEventListener('click', () => {
        habits = habits.map((item) => (item.id === habit.id ? complete(item) : item));
        save();
        refresh();
      });
      const remove = document.createElement('button');
      remove.className = 'btn';
      remove.type = 'button';
      remove.textContent = '[ Remove ]';
      remove.addEventListener('click', () => {
        habits = habits.filter((item) => item.id !== habit.id);
        selected = habits[0]?.id || null;
        save();
        refresh();
      });
      detail.append(title, stats, done, remove);
    }
    if (!saved) {
      const warning = document.createElement('p');
      warning.textContent = 'Storage is unavailable: progress will not survive a reload.';
      detail.append(warning);
    }
    render3d();
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);
    const habit = createHabit(String(data.get('name') || ''), String(data.get('type')));
    if (!habit) return;
    habits.push(habit);
    selected = habit.id;
    save();
    form.reset();
    refresh();
  };
  form.addEventListener('submit', submit);
  const resize = new ResizeObserver(render3d);
  resize.observe(stage);
  const clickPlant = (event: PointerEvent) => {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(plants.children, true)[0];
    const id = hit?.object.userData.id as string | undefined;
    if (id) { selected = id; refresh(); }
  };
  stage.addEventListener('pointerdown', clickPlant);
  refresh();
  cleanup = () => {
    form.removeEventListener('submit', submit);
    stage.removeEventListener('pointerdown', clickPlant);
    resize.disconnect();
    dispose(plants);
    dispose(scene);
    renderer?.dispose();
  };
}
