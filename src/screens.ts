import { icon, pixels } from './icons.ts';
import { certificates, contact, education, experience, profile, projects, skills, type Project, type Role } from './content.ts';

export const screens = ['about', 'projects', 'experience', 'game', 'contact'] as const;
export type Screen = (typeof screens)[number];

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const ext = (href: string, label: string) =>
  `<a class="link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">[${esc(label)}]</a>`;

const heading = (cmd: string, title: string) =>
  `<p class="cmd">C:\\&gt; ${cmd}</p><h2 class="title">${esc(title)}</h2>`;

const role = (r: Role) => `
  <li class="entry">
    <p class="entry-head"><span class="entry-title">${esc(r.title)}</span>${r.dates ? `<span class="entry-date">${esc(r.dates)}</span>` : ''}</p>
    <p class="entry-where">@ ${esc(r.where)}</p>
    <ul class="bullets">${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
  </li>`;

const about = () => `
  ${heading('TYPE ABOUT.TXT', profile.name)}
  <p class="role">&gt; ${esc(profile.role)}</p>
  <div class="about-grid">
    <div class="about-bio">${profile.bio.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <div class="box">
      <p class="box-title">LANGUAGES</p>
      <ul class="langs">
        ${profile.languages
          .map((l) => `<li><span class="lang-name">${esc(l.name)}</span><span class="grade">${esc(l.grade)}</span></li>`)
          .join('')}
      </ul>
    </div>
  </div>
  <h3 class="sub">SKILLS.DAT</h3>
  <div class="skills">
    ${skills
      .map(
        (g) => `<div class="skill-group"><p class="skill-name">${esc(g.group)}</p>
          <ul class="tags">${g.items.map((i) => `<li>${icon(i)}${esc(i)}</li>`).join('')}</ul></div>`,
      )
      .join('')}
  </div>`;

const highlights = (p: Project) => p.highlights.map((h) => `+ ${esc(h)}`).join('&nbsp;&nbsp;');
const stack = (p: Project) => p.stack.map((s) => `<li>${esc(s)}</li>`).join('');
const links = (p: Project) => `${ext(p.repo, 'Source')}${p.live ? ext(p.live, 'Live demo') : ''}`;

export const projectDetail = (i: number) => {
  const p = projects[i];
  return `
  <div class="project-detail" data-for="${i}" role="dialog" tabindex="-1" aria-modal="true" aria-label="${esc(p.name)}">
    <p class="cmd">C:\\PROJECTS&gt; TYPE ${esc(p.file)}</p>
    <div class="detail-head">${pixels(p.icon, 'detail-icon')}<h2 class="title">${esc(p.name)}</h2></div>
    ${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}
    <p class="project-hl">${highlights(p)}</p>
    <ul class="tags">${stack(p)}</ul>
    <p class="project-links">${links(p)}</p>
    <button class="btn" type="button" data-back>[ Back ]</button>
  </div>`;
};

const projectsView = () => `
  ${heading('DIR PROJECTS', 'Projects')}
  <p class="muted">${projects.length} file(s) found</p>
  <ol class="projects">
    ${projects
      .map(
        (p, i) => `
      <li class="project">
        <button class="project-open" type="button" data-project="${i}">
          <span class="project-head"><span class="project-no">${String(i + 1).padStart(2, '0')}</span><span class="project-name">${esc(p.name)}</span><span class="project-file">${esc(p.file)}</span></span>
          <span class="project-summary">${esc(p.summary)}</span>
        </button>
        <p class="project-hl">${highlights(p)}</p>
        <ul class="tags tags--small">${stack(p)}</ul>
        <p class="project-links">${links(p)}</p>
      </li>`,
      )
      .join('')}
  </ol>`;

const experienceView = () => `
  ${heading('TYPE CAREER.LOG', 'Experience')}
  <ul class="entries">${experience.map(role).join('')}</ul>
  <h3 class="sub">EDUCATION &amp; CERTIFICATES</h3>
  <ul class="entries">
    ${education.map(role).join('')}
    ${certificates
      .map(
        (c) => `<li class="entry">
          <p class="entry-head"><span class="entry-title">${esc(c.name)}</span>${c.date ? `<span class="entry-date">${esc(c.date)}</span>` : ''}</p>
          <p class="entry-where">@ ${esc(c.issuer)}</p>${c.url ? `<p>${ext(c.url, 'View certificate')}</p>` : ''}
        </li>`,
      )
      .join('')}
  </ul>`;

const contactView = () => `
  ${heading('RUN MAIL.EXE', 'Contact')}
  <p>Open to Fullstack Developer roles. Send a message and I will get back to you.</p>
  <ul class="contacts">
    ${contact.links
      .map((l) => {
        const text = l.href.replace(/^mailto:|^https:\/\/(www\.)?/g, '').replace(/\/$/, '');
        const attrs = l.href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"';
        return `<li><span class="contact-label">${esc(l.label.toUpperCase())}</span><a class="link" href="${esc(l.href)}"${attrs}>${esc(text)}</a></li>`;
      })
      .join('')}
  </ul>
  <form class="form" id="mail-form" novalidate>
    <p class="box-title">NEW MESSAGE</p>
    <label>FROM:<input name="name" autocomplete="name" required placeholder="your name" /></label>
    <label>SUBJECT:<input name="subject" placeholder="hello!" /></label>
    <label class="form-body">MESSAGE:<textarea name="message" rows="5" required placeholder="type here..."></textarea></label>
    <p class="form-status" id="form-status" role="status"></p>
    <button class="btn" type="submit">[ Send ]</button>
  </form>`;

const gameView = () => `
  <div class="game">
    <p class="cmd">C:\\&gt; RUN GARDEN.EXE</p>
    <h2 class="game-title">Habit Garden</h2>
    <p class="game-keys">Plant a habit, then Mark done once a day to help it grow. Select a plant to see today, streak and total; <kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> move between plants.</p>
    <div class="game-stage" id="garden-stage" aria-label="3D habit garden"></div>
    <form class="garden-form" id="garden-form">
      <label>NEW HABIT <input id="garden-name" name="name" maxlength="40" required placeholder="e.g. Read for 10 minutes" /></label>
      <label>PLANT <select name="type"><option value="flower">Flower</option><option value="tree">Tree</option><option value="cactus">Cactus</option><option value="mushroom">Mushroom</option><option value="crystal">Crystal</option></select></label>
      <button class="btn" type="submit">[ Plant ]</button>
    </form>
    <div class="garden-bottom">
      <div class="garden-list" id="garden-list" role="group" aria-label="Your habits"></div>
      <div class="garden-detail" id="garden-detail"></div>
    </div>
    <p class="garden-status" id="garden-status" role="status"></p>
  </div>`;

export const render: Record<Screen, () => string> = {
  about,
  projects: projectsView,
  experience: experienceView,
  game: gameView,
  contact: contactView,
};

export function mailto(name: string, subject: string, message: string) {
  const q = new URLSearchParams({ subject: subject || `Hello from ${name}`, body: `${message}\n\n— ${name}` });
  return `mailto:${contact.email}?${q.toString().replace(/\+/g, '%20')}`;
}
