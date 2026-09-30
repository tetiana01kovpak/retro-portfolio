const frequencies = [174, 285, 396, 417, 528, 639, 728, 852];
const fadeSeconds = 0.08;
const timerFadeSeconds = 3;

type PlayingTone = { index: number; oscillator: OscillatorNode; gain: GainNode };
let context: AudioContext | undefined;
let master: GainNode | undefined;
let current: PlayingTone | undefined;
let timerId: number | undefined;
let timerEnd = 0;
let root: HTMLElement | undefined;
let keyHandler: ((event: KeyboardEvent) => void) | undefined;

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function render() {
  if (!root) return;
  root.querySelectorAll<HTMLButtonElement>('[data-tone]').forEach((card) => {
    const on = current?.index === Number(card.dataset.tone);
    card.classList.toggle('playing', !!on);
    card.setAttribute('aria-pressed', String(!!on));
  });
  element('tone-readout').textContent = current ? `${frequencies[current.index]} Hz sine` : 'Silence';
}

function volume() {
  return Number(element<HTMLInputElement>('tone-volume').value) / 100;
}

function ensureAudio() {
  if (!context) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = volume();
    master.connect(context.destination);
  }
  if (context.state !== 'running') void context.resume();
}

function clearTimer() {
  if (timerId !== undefined) window.clearInterval(timerId);
  timerId = undefined;
  const remaining = document.getElementById('tone-remaining');
  if (remaining) remaining.textContent = '';
}

function stop(fade = fadeSeconds) {
  clearTimer();
  if (!current || !context) return;
  const { oscillator, gain } = current;
  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + fade);
  oscillator.stop(now + fade + 0.02);
  oscillator.onended = () => gain.disconnect();
  current = undefined;
  render();
}

function showRemaining() {
  const seconds = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
  const remaining = element('tone-remaining');
  remaining.textContent = `· ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} left`;
}

function startTimer() {
  const minutes = Number(element<HTMLSelectElement>('tone-timer').value);
  if (!minutes) return;
  timerEnd = Date.now() + minutes * 60_000;
  timerId = window.setInterval(() => {
    if (Date.now() >= timerEnd - timerFadeSeconds * 1000) stop(timerFadeSeconds);
    else showRemaining();
  }, 250);
  showRemaining();
}

function play(index: number) {
  ensureAudio();
  stop();
  const now = context!.currentTime;
  const oscillator = context!.createOscillator();
  const gain = context!.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequencies[index];
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + fadeSeconds);
  oscillator.connect(gain).connect(master!);
  oscillator.start(now);
  current = { index, oscillator, gain };
  startTimer();
  render();
}

function toggle(index: number) {
  if (current?.index === index) stop();
  else play(index);
}

export function mountTones(container: HTMLElement) {
  root = container;
  container.querySelectorAll<HTMLButtonElement>('[data-tone]').forEach((card) => {
    card.addEventListener('click', () => toggle(Number(card.dataset.tone)));
  });
  const volumeInput = element<HTMLInputElement>('tone-volume');
  volumeInput.addEventListener('input', () => {
    element('tone-volume-out').textContent = `${volumeInput.value}%`;
    if (master && context) master.gain.setTargetAtTime(volume(), context.currentTime, 0.02);
  });
  element<HTMLSelectElement>('tone-timer').addEventListener('change', () => {
    if (current) {
      clearTimer();
      startTimer();
    }
  });
  keyHandler = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return;
    if (/^[1-8]$/.test(event.key)) {
      event.preventDefault();
      toggle(Number(event.key) - 1);
    } else if (event.key === ' ') {
      event.preventDefault();
      stop();
    }
  };
  document.addEventListener('keydown', keyHandler);
}

export function unmountTones() {
  stop();
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = undefined;
  root = undefined;
}
