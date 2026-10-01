# Tetiana Kovpak — retro portfolio

A 1970s CRT computer that boots up and shows the portfolio on its screen. Vite + vanilla TypeScript, no framework.

## Run

```sh
npm ci
npm run dev        # http://localhost:5173
```

Deep links skip the boot animation: `#welcome`, `#about`, `#projects`, `#experience`, `#game`, `#contact`.
Keys: `1`–`5` (About, Projects, Experience, App, Contact) or `←`/`→` switch screens, `Esc` goes home, any key
skips the boot and the welcome intro (skipped under `prefers-reduced-motion`). The **Next** button at the bottom centre goes to the next screen and wraps from Contact to About.
A project opens a full-screen detail; `Esc` or **[ Back ]** returns to the list. The power button on the case reboots.

The App screen (`#game`) is a launcher built from the `apps` list in `src/content.ts`; `Esc` or **[ Back ]** in an
app returns to it. Its one app is Habbit Garden, a small Three.js habit tracker: name a habit and pick a plant (flower, tree,
cactus, mushroom or crystal), then **Mark done** once a day to make it grow. Select a plant to see today's status,
the current streak and total completions; **Remove** deletes it. The arrow keys, `Home` and `End` move between
plants instead of switching screens there. Habits are kept in this browser's `localStorage` only: no account,
server or sharing. Without WebGL the garden shows a text version with the same controls.

## Build and check

```sh
  npm run build      # type-check + production build into dist/, including cv.html and cv.pdf (requires Chrome or Edge)
npm run check      # build + tests (vitest; Node 22.12+, 24 or 26+)
```

## Serve with Docker

```sh
docker compose up -d --build   # http://localhost:8080, health at /health
```

## Deploy on GitHub Pages

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) tests, builds and publishes `dist/` on every push to
`main` (or run it by hand from the Actions tab). The site is served at
<https://tetianakovpak.dev/>.

One-time setup: repo **Settings > Pages > Build and deployment > Source**: **GitHub Actions**.

The workflow builds root-relative assets for the configured custom domain. No rewrite is needed because routing is hash-based.
Pages can't set custom headers, so the long `Cache-Control` on `/assets/*` only applies on Render and Docker.

The CV is available as responsive HTML at `/cv.html` and as a downloadable PDF at `/cv.pdf`.

## Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tetiana01kovpak/retro-portfolio)

For automatic deploys on push, connect GitHub in Render and grant the
Render GitHub app access to `tetiana01kovpak/retro-portfolio`.

**Blueprint (one click):** Render dashboard > **New** > **Blueprint** > pick the repo. Render reads
[`render.yaml`](render.yaml) and creates the static site.

**Manual alternative:** Render dashboard > **New** > **Static Site** > pick the repo, then set:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Redirects/Rewrites: source `/*`, destination `/index.html`, action **Rewrite**
- Headers (optional): path `/assets/*`, `Cache-Control: public, max-age=31536000, immutable`

No environment variables are needed.

## Edit content

All text lives in [`src/content.ts`](src/content.ts): profile, bio, skills, projects, apps, experience,
education, certificates and contact links. Add certificates to the `certificates` array; they appear on the
Experience screen under "Education & certificates". Leave `dates` out where a date is unknown.
