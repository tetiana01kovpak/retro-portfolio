import {
  complete, createHabit, type Habit, isDone, loadHabits, localDate, saveHabits, storageKey, streak, total,
} from './garden';
import { mountStage } from './gardenscene';

let cleanup: (() => void) | null = null;
export function unmountGame() { cleanup?.(); cleanup = null; }

export function mountGame(root: HTMLElement, _reduced: MediaQueryList) {
  unmountGame();
  const stage = root.querySelector<HTMLElement>('#garden-stage')!;
  const form = root.querySelector<HTMLFormElement>('#garden-form')!;
  const list = root.querySelector<HTMLElement>('#garden-list')!;
  const detail = root.querySelector<HTMLElement>('#garden-detail')!;
  let { habits, writable } = loadHabits();
  let shownDay = localDate();
  const read = () => { ({ habits, writable } = loadHabits()); };
  const change = (apply: (current: Habit[]) => Habit[]) => {
    if (writable) read();
    habits = apply(habits);
    writable = writable && saveHabits(habits);
    refresh();
  };
  let selected = habits[0]?.id || null;
  const view = mountStage(stage, (id) => { selected = id; refresh(); });
  const refresh = () => {
    view.draw(habits, selected);
    list.replaceChildren();
    const today = localDate();
    shownDay = today;
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
        change((current) => current.map((item) => (item.id === habit.id ? complete(item) : item)));
      });
      const remove = document.createElement('button');
      remove.className = 'btn';
      remove.type = 'button';
      remove.textContent = '[ Remove ]';
      remove.addEventListener('click', () => {
        change((current) => {
          const rest = current.filter((item) => item.id !== habit.id);
          selected = rest[0]?.id || null;
          return rest;
        });
      });
      detail.append(title, stats, done, remove);
    }
    if (!writable) {
      const warning = document.createElement('p');
      warning.textContent = 'Storage is unavailable: progress will not survive a reload.';
      detail.append(warning);
    }
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);
    const habit = createHabit(String(data.get('name') || ''), String(data.get('type')));
    if (!habit) return;
    selected = habit.id;
    form.reset();
    change((current) => [...current, habit]);
  };
  form.addEventListener('submit', submit);
  const sync = (event: StorageEvent) => {
    if (writable && (event.key === storageKey || event.key === null)) { read(); refresh(); }
  };
  addEventListener('storage', sync);
  const dayCheck = setInterval(() => { if (localDate() !== shownDay) refresh(); }, 60_000);
  refresh();
  cleanup = () => {
    form.removeEventListener('submit', submit);
    removeEventListener('storage', sync);
    clearInterval(dayCheck);
    view.dispose();
  };
}
