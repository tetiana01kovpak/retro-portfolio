import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { certificates, contact, education, experience, profile, projects, skills } from '../src/content.ts';

test('welcome copy is spelled right', () => {
  assert.equal(profile.welcome, 'Welcome to my portfolio');
  assert.equal(profile.tagline, 'Full stack developer');
});

test('content is complete', () => {
  assert.equal(projects.length, 6);
  assert.ok(skills.length > 0 && skills.every((g) => g.items.length > 0));
  assert.ok(experience.length > 0 && education.length > 0);
  assert.ok(profile.languages.every((l) => /^(A1|A2|B1|B2|C1|C2|Native)$/.test(l.grade)));
});

test('every link is absolute https or mailto', () => {
  const hrefs = [
    ...projects.flatMap((p) => [p.repo, p.live]),
    ...certificates.map((c) => c.url),
    ...contact.links.map((l) => l.href),
  ].filter((h): h is string => Boolean(h));
  for (const h of hrefs) assert.match(h, /^(https:\/\/|mailto:)/, h);
});

test.skipIf(!existsSync('dist/index.html'))('the build holds the page and its assets (after npm run build)', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  for (const id of ['view-boot', 'view-welcome', 'btn-click', 'pane', 'power']) assert.ok(html.includes(`id="${id}"`), id);
  for (const [, src] of html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g)) assert.ok(existsSync(`dist/${src}`), src);
});
