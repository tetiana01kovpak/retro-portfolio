import { test } from 'vitest';
import assert from 'node:assert/strict';
import { contact, projects, skills } from '../src/content.ts';
import { skillIcons } from '../src/icons.ts';
import { mailto, render, screens } from '../src/screens.ts';

test('every screen renders', () => {
  assert.deepEqual(screens, ['about', 'projects', 'experience', 'game', 'contact']);
  for (const s of screens) assert.ok(render[s]().length > 200, s);
});

test('every skill has its own pixel icon', () => {
  const names = new Set(skills.flatMap((g) => g.items));
  assert.deepEqual(new Set(Object.keys(skillIcons)), names);
  const bitmaps = Object.values(skillIcons).map((rows) => {
    assert.equal(rows.length, 8);
    for (const r of rows) assert.match(r, /^[#.]{8}$/);
    return rows.join('');
  });
  assert.equal(new Set(bitmaps).size, bitmaps.length);
  const count = skills.reduce((n, g) => n + g.items.length, 0);
  assert.equal(render.about().match(/class="skill-icon"/g)?.length, count);
});

test('game screen has the garden stage, form, list and detail', () => {
  const html = render.game();
  assert.ok(html.includes('Habit Garden'));
  assert.ok(html.includes('Mark done'));
  assert.ok(!/invader|score|fire/i.test(html));
  for (const id of ['garden-stage', 'garden-form', 'garden-list', 'garden-detail']) assert.ok(html.includes(`id="${id}"`), id);
  for (const t of ['flower', 'tree', 'cactus', 'mushroom', 'crystal']) assert.ok(html.includes(`value="${t}"`), t);
});

test('projects screen lists every project with its links', () => {
  const html = render.projects();
  for (const p of projects) {
    assert.ok(html.includes(p.repo), p.name);
    if (p.live) assert.ok(html.includes(p.live), p.name);
  }
});

test('contact form builds a mailto link', () => {
  const href = mailto('Ann', '', 'Hi & bye');
  assert.ok(href.startsWith(`mailto:${contact.email}?`));
  const q = new URLSearchParams(href.split('?')[1]);
  assert.equal(q.get('subject'), 'Hello from Ann');
  assert.equal(q.get('body'), 'Hi & bye\n\n— Ann');
  assert.ok(!href.includes('+'));
});
