import photo from './assets/tetiana.png';
import { icon, pixels } from './icons.ts';
import { apps, certificates, contact, education, experience, profile, projects, skills, type Project, type Role } from './content.ts';

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
    <figure class="photo">
      <p class="photo-bar"><span>PHOTO.BMP</span><span aria-hidden="true">[_][x]</span></p>
      <div class="photo-screen"><img src="${photo}" width="132" height="176" alt="${esc(profile.name)}" /></div>
    </figure>
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
    <div class="detail-head"><h2 class="title">${esc(p.name)}</h2></div>
    <figure class="project-art" role="img" aria-label="Retro pixel art preview for ${esc(p.name)}">
      <div class="project-art-screen">
        <span class="project-art-file">${esc(p.file)}</span>
        ${pixels(p.icon, 'project-art-image')}
        <span class="project-art-prompt">C:\\&gt; READY_</span>
      </div>
      <figcaption>KOVPAK SYSTEMS · 8-BIT PROJECT PREVIEW</figcaption>
    </figure>
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
        <div class="project-actions">
          <button class="btn btn--details" type="button" data-project="${i}">[ Details ]</button>
          <p class="project-links">${links(p)}</p>
        </div>
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

const gardenView = () => `
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

const appsView = () => `
  ${heading('DIR APPS', 'Apps')}
  <p class="muted">${apps.length} program(s) found</p>
  <ol class="projects">
    ${apps
      .map(
        (a) => `
      <li class="project">
        <button class="project-open" type="button" data-app="${esc(a.id)}">
          <span class="project-head"><span class="project-name">${esc(a.name)}</span><span class="project-file">${esc(a.file)}</span></span>
          <span class="project-summary">${esc(a.summary)}</span>
        </button>
        <div class="project-actions">
          <button class="btn btn--details" type="button" data-app="${esc(a.id)}">[ Open ]</button>
        </div>
      </li>`,
      )
      .join('')}
  </ol>`;

const solfeggioView = () => `
  <div class="game solfeggio">
    <p class="cmd">C:\\&gt; RUN SOLFEGGIO.EXE</p>
    <h2 class="game-title">Solfeggio Frequencies</h2>
    <p class="solfeggio-intro">Pure sine tones. Traditional associations are not scientifically established.</p>
    <div class="solfeggio-controls">
      <label>VOLUME <input id="tone-volume" type="range" min="0" max="100" value="20"><output id="tone-volume-out">20%</output></label>
      <label>SESSION <select id="tone-timer"><option value="0">Off</option><option value="5">5 min</option><option value="10">10 min</option><option value="20">20 min</option></select></label>
      <span id="tone-remaining" aria-live="polite"></span><span id="tone-readout" role="status">Silence</span>
    </div>
    <div class="tone-grid">
      ${[{hz:174,label:'Eases pain & stress'},{hz:285,label:'Enhances healing & regeneration'},{hz:396,label:'Releases fear & guilt'},{hz:417,label:'Facilitates change & letting go'},{hz:528,label:'Encourages healing & transformation'},{hz:639,label:'Supports connection & harmony'},{hz:728,label:'Claimed to destroy parasites in the body',note:'A sound tone cannot do this.'},{hz:852,label:'Fosters intuition & awareness'}].map((f,i)=>`<button class="tone-card" type="button" data-tone="${i}" aria-pressed="false"><kbd>${i+1}</kbd><strong>${f.hz} Hz</strong><span>${esc(f.label)}</span>${f.note?`<small>${esc(f.note)}</small>`:''}</button>`).join('')}
    </div>
    <p class="solfeggio-keys"><kbd>1</kbd>–<kbd>8</kbd> play a tone · <kbd>SPACE</kbd> stop</p>
    <p class="project-links">${ext('https://github.com/tetiana01kovpak/solfeggio2', 'Source')}</p>
  </div>`;

const appViews: Record<string, () => string> = { garden: gardenView, solfeggio: solfeggioView };

export const appView = (id: string) =>
  `<button class="btn app-back" type="button" data-apps>[ Back to Apps ]</button>${appViews[id]()}`;

export const render: Record<Screen, () => string> = {
  about,
  projects: projectsView,
  experience: experienceView,
  game: appsView,
  contact: contactView,
};

export function mailto(name: string, subject: string, message: string) {
  const q = new URLSearchParams({ subject: subject || `Hello from ${name}`, body: `${message}\n\n— ${name}` });
  return `mailto:${contact.email}?${q.toString().replace(/\+/g, '%20')}`;
}
