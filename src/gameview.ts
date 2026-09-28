import {
  complete, createHabit, type Habit, isDone, loadHabits, localDate, saveHabits, storageKey, streak, total,
} from './garden';
import { mountStage } from './gardenscene';

let cleanup: (() => void) | null = null;
export function unmountGame() { cleanup?.(); cleanup = null; }

const steps: Record<string, number> = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 };

export function mountGame(root: HTMLElement, _reduced: MediaQueryList) {
  unmountGame();
  const stage = root.querySelector<HTMLElement>('#garden-stage')!;
  const form = root.querySelector<HTMLFormElement>('#garden-form')!;
  const name = root.querySelector<HTMLInputElement>('#garden-name')!;
  const list = root.querySelector<HTMLElement>('#garden-list')!;
  const detail = root.querySelector<HTMLElement>('#garden-detail')!;
  const status = root.querySelector<HTMLElement>('#garden-status')!;
  let { habits, writable } = loadHabits();
  let shownDay = localDate();
  let focusNext: string | undefined;
  const read = () => { ({ habits, writable } = loadHabits()); };
  const change = (apply: (current: Habit[]) => Habit[], message: () => string) => {
    if (writable) read();
    habits = apply(habits);
    writable = writable && saveHabits(habits);
    status.textContent = message();
    refresh();
  };
  let selected = habits[0]?.id || null;
  const select = (id: string) => { selected = id; refresh(); };
  const view = mountStage(stage, select);
  const focused = () => {
    const el = document.activeElement;
    return el instanceof HTMLElement && root.contains(el) ? el.dataset.focus : undefined;
  };
  const restore = (key: string | undefined) => {
    if (!key) return;
    const targets = [...root.querySelectorAll<HTMLButtonElement>('[data-focus]')];
    const target = targets.find((el) => el.dataset.focus === key && !el.disabled)
      || targets.find((el) => el.dataset.focus === `item:${selected}`)
      || name;
    target.focus();
  };
  const button = (label: string, focus: string, onClick: () => void) => {
    const el = document.createElement('button');
    el.className = 'btn';
    el.type = 'button';
    el.textContent = label;
    el.dataset.focus = focus;
    el.addEventListener('click', onClick);
    return el;
  };
  const refresh = () => {
    const key = focusNext ?? focused();
    focusNext = undefined;
    view.draw(habits, selected);
    list.replaceChildren();
    const today = localDate();
    shownDay = today;
    for (const habit of habits) {
      const item = document.createElement('button');
      item.className = 'garden-item';
      item.type = 'button';
      item.dataset.id = habit.id;
      item.dataset.focus = `item:${habit.id}`;
      item.textContent = `${isDone(habit, today) ? '✓' : '○'} ${habit.name}`;
      item.setAttribute('aria-label', `${habit.name}, ${isDone(habit, today) ? 'done today' : 'not done today'}`);
      item.setAttribute('aria-pressed', String(selected === habit.id));
      item.tabIndex = selected === habit.id || (!habits.some((h) => h.id === selected) && habit === habits[0]) ? 0 : -1;
      item.addEventListener('click', () => select(habit.id));
      list.append(item);
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
      const done = button(isDone(habit, today) ? '[ Done today ]' : '[ Mark done ]', 'done', () => {
        change(
          (current) => current.map((item) => (item.id === habit.id ? complete(item) : item)),
          () => {
            const now = habits.find((item) => item.id === habit.id);
            return now ? `${now.name} marked done. Streak: ${streak(now)} · Total: ${total(now)}.` : '';
          },
        );
      });
      done.disabled = isDone(habit, today);
      const remove = button('[ Remove ]', 'remove', () => {
        change((current) => {
          const rest = current.filter((item) => item.id !== habit.id);
          selected = rest[0]?.id || null;
          focusNext = `item:${selected}`;
          return rest;
        }, () => `${habit.name} removed.`);
      });
      const actions = document.createElement('div');
      actions.className = 'garden-actions';
      actions.append(done, remove);
      detail.append(title, stats, actions);
    }
    if (!writable) {
      const warning = document.createElement('p');
      warning.textContent = 'Storage is unavailable: progress will not survive a reload.';
      detail.append(warning);
    }
    restore(key);
  };
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);
    const habit = createHabit(String(data.get('name') || ''), String(data.get('type')));
    if (!habit) {
      status.textContent = 'Give the habit a name first.';
      name.focus();
      return;
    }
    selected = habit.id;
    form.reset();
    change((current) => [...current, habit], () => `${habit.name} planted as a ${habit.type}.`);
  };
  const move = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const item = (event.target as HTMLElement).closest<HTMLElement>('.garden-item, .garden-glyph');
    const i = habits.findIndex((habit) => habit.id === item?.dataset.id);
    if (!item || i < 0 || !(event.key in steps || event.key === 'Home' || event.key === 'End')) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? habits.length - 1 : (i + steps[event.key] + habits.length) % habits.length;
    focusNext = `${item.dataset.focus!.split(':')[0]}:${habits[next].id}`;
    select(habits[next].id);
  };
  form.addEventListener('submit', submit);
  root.addEventListener('keydown', move);
  const sync = (event: StorageEvent) => {
    if (writable && (event.key === storageKey || event.key === null)) { read(); refresh(); }
  };
  addEventListener('storage', sync);
  const dayCheck = setInterval(() => { if (localDate() !== shownDay) refresh(); }, 60_000);
  refresh();
  cleanup = () => {
    form.removeEventListener('submit', submit);
    root.removeEventListener('keydown', move);
    removeEventListener('storage', sync);
    clearInterval(dayCheck);
    view.dispose();
  };
}
