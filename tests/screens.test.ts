import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contact, projects } from '../src/content.ts';
import { mailto, render, screens } from '../src/screens.ts';

test('every screen renders', () => {
  assert.deepEqual(screens, ['about', 'projects', 'experience', 'contact']);
  for (const s of screens) assert.ok(render[s]().length > 200, s);
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
