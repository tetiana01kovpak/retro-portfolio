import { spawn } from 'node:child_process';
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { profile, skills, experience, education, projects, contact } from '../src/content.ts';

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

function renderCv(css, interFontFaces) {
  const skillGroups = skills
    .filter(({ group }) => !['UI & Design', 'Data & API', 'Languages'].includes(group))
    .map(({ group, items }) => `<div class="skill-group"><h3>${escapeHtml(group)}</h3><p>${items.map(escapeHtml).join(' · ')}</p></div>`)
    .join('');

  const roles = experience.map((role) => `
    <article class="entry">
      <div class="entry-head"><div><h3>${escapeHtml(role.title)}</h3><p class="meta">${escapeHtml(role.where)}</p></div><span class="date">${escapeHtml(role.dates || '')}</span></div>
      <ul>${role.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
    </article>`).join('');

  const projectCards = projects.map((project) => `
    <article class="project-card">
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.summary)}</p>
      <p class="stack">${project.stack.slice(0, 7).map(escapeHtml).join(' · ')}</p>
      <div class="project-links"><a href="${safeHref(project.live || project.repo)}">Project</a><a href="${safeHref(project.repo)}">Source</a></div>
    </article>`).join('');

  const study = education.map((item) => `
    <article class="entry education-entry">
      <div class="entry-head"><div><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(item.where)}</p></div><span class="date">${escapeHtml(item.dates || '')}</span></div>
      <p>${item.points.map(escapeHtml).join(' · ')}</p>
    </article>`).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(profile.name)} — CV</title>
<style>${interFontFaces}</style><style>${css}</style></head><body data-theme="light">
<main class="container cv-document">
  <header class="cv-header">
    <div class="identity"><p class="eyebrow">CURRICULUM VITAE</p><h1>${escapeHtml(profile.name)}</h1><p class="headline">${escapeHtml(profile.role)}</p></div>
    <address class="contact"><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a><br><a href="https://www.linkedin.com/in/tetiana-kovpak/">LinkedIn</a><span> · </span><a href="https://github.com/tetiana01kovpak">GitHub</a><br><a href="https://tetiana01kovpak.github.io/retro-portfolio/">Portfolio</a></address>
  </header>
  <section class="cv-section"><h2>Profile</h2><div class="bio">${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
  <section class="cv-section"><h2>Experience</h2>${roles}</section>
  <section class="cv-section" id="projects"><h2>Selected Projects</h2><div class="project-grid">${projectCards}</div></section>
  <section class="cv-section"><h2>Technical Skills</h2><div class="skills-grid">${skillGroups}</div></section>
  <section class="cv-section education"><h2>Education &amp; Languages</h2>${study}<p class="languages"><strong>Languages:</strong> Ukrainian · English · German · Italian</p></section>
  <footer>Portfolio <span>·</span> <a href="https://tetiana01kovpak.github.io/retro-portfolio/">tetiana01kovpak.github.io/retro-portfolio</a></footer>
</main></body></html>`;
}

export async function buildCvPdf() {
  const chrome = await browserPath();
  const picoPath = path.join(root, 'node_modules', '@picocss', 'pico', 'css', 'pico.min.css');
  const customCssPath = path.join(here, 'cv.css');
  const fontDir = path.join(root, 'node_modules', '@fontsource', 'inter', 'files');
  const [pico, customCss, regularFont, mediumFont, semiboldFont, boldFont] = await Promise.all([
    readFile(picoPath, 'utf8'),
    readFile(customCssPath, 'utf8'),
    readFile(path.join(fontDir, 'inter-latin-400-normal.woff2')),
    readFile(path.join(fontDir, 'inter-latin-500-normal.woff2')),
    readFile(path.join(fontDir, 'inter-latin-600-normal.woff2')),
    readFile(path.join(fontDir, 'inter-latin-700-normal.woff2')),
  ]);
  const fontFaces = [400, 500, 600, 700].map((weight, index) => {
    const font = [regularFont, mediumFont, semiboldFont, boldFont][index].toString('base64');
    return `@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-style:normal;font-weight:${weight};font-display:block}`;
  }).join('\n');
  const html = renderCv(`${pico}\n${customCss}`, fontFaces);
  const tempHtml = path.join(os.tmpdir(), `tetiana-cv-${process.pid}.html`);
  await mkdir(dist, { recursive: true });
  await writeFile(tempHtml, html, 'utf8');
  await rm(outFile, { force: true });

  try {
    await new Promise((resolve, reject) => {
      const args = [
        '--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
        '--no-pdf-header-footer', `--print-to-pdf=${outFile}`, pathToFileURL(tempHtml).href,
      ];
      const child = spawn(chrome, args, { stdio: 'inherit', windowsHide: true });
      child.once('error', reject);
      child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`Chrome PDF generation exited with code ${code}`)));
    });
    const output = await stat(outFile);
    if (!output.size) throw new Error('Chrome produced an empty PDF.');
    console.log(`Generated ${path.relative(root, outFile)} (${Math.ceil(output.size / 1024)} KiB)`);
  } finally {
    await rm(tempHtml, { force: true });
  }
}
