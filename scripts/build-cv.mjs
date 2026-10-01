import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { profile, experience, education, projects, contact } from '../src/content.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');
const outFile = path.join(dist, 'cv.pdf');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function safeHref(href) {
  return /^(https:\/\/|mailto:)/i.test(href) ? escapeHtml(href) : '#';
}

async function browserPath() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error('Chrome or Edge is required to print the CV. Set CHROME_BIN to its executable path.');
}

function renderCv(css, fontFaces) {
  const summary = [...profile.bio];
  summary[0] = summary[0].replace(/^Fullstack Developer/, 'Junior Fullstack Developer');
  const skillGroups = [
    ['Frontend', ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Sass', 'TanStack Query', 'Zustand', 'React Hook Form', 'Zod']],
    ['Backend & APIs', ['Node.js', 'NestJS', 'Express', 'REST APIs', 'WebSockets', 'Swagger / OpenAPI']],
    ['Databases', ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma']],
    ['Design & 3D', ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Premiere', 'Three.js', 'WebGL', 'Blender']],
    ['Tools & AI', ['Git', 'Docker', 'Jira', 'GitHub Actions', 'Grafana', 'WordPress', 'Claude', 'Codex', 'Cursor']],
    ['Ways of Working', ['Agile / Scrum', 'Code review', 'Responsive design', 'Automated testing']],
  ].map(([label, items]) => `<article class="skill-group"><h3>${escapeHtml(label)}</h3><p>${items.map(escapeHtml).join(', ')}</p></article>`).join('');

  const roles = experience.map((role) => `
    <article class="entry">
      <div class="entry-head"><div><h3>${escapeHtml(role.title)}</h3><p class="meta">${escapeHtml(role.where)}</p></div><span class="date">${escapeHtml(role.dates || '')}</span></div>
      <ul>${role.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
    </article>`).join('');

  const projectTypes = {
    ePharmacy: 'Full-stack pharmacy e-commerce',
    TravelTrucks: 'Camper rental platform',
    'Quantum JS': 'Furniture e-commerce SPA',
    FlowBloom: 'Yoga studio landing page',
    NoteHub: 'Full-stack notes app',
    ChillScape: 'Travel discovery app',
  };
  const projectOrder = ['ePharmacy', 'TravelTrucks', 'ChillScape', 'Quantum JS', 'NoteHub', 'FlowBloom'];
  const orderedProjects = projectOrder.map((name) => projects.find((project) => project.name === name)).filter(Boolean);
  const projectEntries = orderedProjects.map((project) => `
    <article class="project-entry">
      <span class="project-topbar" aria-hidden="true"></span>
      <header class="project-heading"><h3>${escapeHtml(project.name)}</h3><p class="project-type">${escapeHtml(projectTypes[project.name] || 'Web application')}</p></header>
      <p class="project-summary">${escapeHtml(project.summary)}</p>
      <p class="project-highlights"><strong>Highlights</strong> ${project.highlights.slice(0, 5).map(escapeHtml).join(' · ')}</p>
      <footer class="project-meta"><span class="project-stack"><strong>Stack</strong> ${project.stack.slice(0, 7).map(escapeHtml).join(', ')}</span></footer>
    </article>`).join('');

  const study = education.map((item) => `
    <article class="entry education-entry">
      <div class="entry-head"><div><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(item.where)}</p></div><span class="date">${escapeHtml(item.dates || '')}</span></div>
      <p>${item.points.map(escapeHtml).join(' / ')}</p>
    </article>`).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(profile.name)} - CV</title>
<style>${fontFaces}</style><style>${css}</style></head><body>
<main id="cv" class="cv-document">
  <header class="cv-header">
    <div class="identity"><h1>${escapeHtml(profile.name)}</h1><p class="headline">${escapeHtml(profile.role)}</p></div>
    <address class="contact"><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a><span> · </span><a href="https://www.linkedin.com/in/tetiana-kovpak">LinkedIn</a><span> · </span><a href="https://github.com/tetiana01kovpak">GitHub</a><span> · </span><a href="https://tetianakovpak.dev/">tetianakovpak.dev</a></address>
  </header>
  <section class="cv-section"><h2>Summary</h2><div class="bio">${summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
  <section class="cv-section"><h2>Experience</h2>${roles}</section>
  <section class="cv-section education"><h2>Education</h2>${study}</section>
  <section class="cv-section languages-section"><h2>Languages</h2><p class="languages">English — Advanced · Ukrainian — Native · German — Intermediate · Italian — Intermediate</p></section>
  <div class="continuation">
    <header class="continuation-header"><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.role)}</span></header>
    <section class="cv-section projects-section"><h2>Projects</h2><div class="project-grid">${projectEntries}</div></section>
    <section class="cv-section skills-section"><h2>Technical Skills</h2><div class="skills-grid">${skillGroups}</div></section>
  </div>
  <footer>Portfolio <span>·</span> <a href="https://tetianakovpak.dev/">tetianakovpak.dev</a></footer>
</main>
</body></html>`;
}

export async function buildCvPdf() {
  const chrome = await browserPath();
  const customCssPath = path.join(here, 'cv.css');
  const fontDir = path.join(root, 'assets', 'fonts', 'latin-modern');
  const [customCss, regularFont, boldFont] = await Promise.all([
    readFile(customCssPath, 'utf8'),
    readFile(path.join(fontDir, 'latin-modern-regular.woff')),
    readFile(path.join(fontDir, 'latin-modern-bold.woff')),
  ]);
  const fontFaces = `
    @font-face{font-family:'Latin Modern Roman';src:url(data:font/woff;base64,${regularFont.toString('base64')}) format('woff');font-style:normal;font-weight:400}
    @font-face{font-family:'Latin Modern Roman';src:url(data:font/woff;base64,${boldFont.toString('base64')}) format('woff');font-style:normal;font-weight:700}
  `;
  const html = renderCv(customCss.replace(/^\uFEFF/, ''), fontFaces);
  const htmlFile = path.join(dist, 'cv.html');
  await mkdir(dist, { recursive: true });
  await writeFile(htmlFile, html, 'utf8');
  await rm(outFile, { force: true });

  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    if (process.env.CV_PREVIEW_DIR) {
      const previewDir = path.resolve(process.env.CV_PREVIEW_DIR);
      await mkdir(previewDir, { recursive: true });
      await page.screenshot({ path: path.join(previewDir, 'cv-screen.png'), fullPage: true });
    }
    await page.pdf({ path: outFile, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const output = await stat(outFile);
    if (!output.size) throw new Error('Chrome produced an empty PDF.');
    console.log(`Generated ${path.relative(root, outFile)} and ${path.relative(root, htmlFile)} (${Math.ceil(output.size / 1024)} KiB)`);
  } finally {
    if (browser) await browser.close();
  }
}
