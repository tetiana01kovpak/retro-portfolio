<<<<<<< HEAD
# Tetiana Kovpak — retro portfolio

A 1970s CRT computer that boots up and shows the portfolio on its screen. Vite + vanilla TypeScript, no framework.

## Run

```sh
npm ci
npm run dev        # http://localhost:5173
```

Deep links skip the boot animation: `#welcome`, `#about`, `#projects`, `#experience`, `#contact`.
Keys: `1`–`4` or `←`/`→` switch screens, `Esc` goes home, any key skips the boot. The power button on the case reboots.

## Build and check

```sh
npm run build      # type-check + production build into dist/
npm run check      # build + tests (vitest; Node 22.12+, 24 or 26+)
```

## Serve with Docker

```sh
docker compose up -d --build   # http://localhost:8080, health at /health
```

## Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tetiana01kovpak/portfolio-test)

The repository is private, so Render needs access to it first: connect GitHub in Render and grant the
Render GitHub app access to `tetiana01kovpak/portfolio-test`.

**Blueprint (one click):** Render dashboard > **New** > **Blueprint** > pick the repo. Render reads
[`render.yaml`](render.yaml) and creates the static site.

**Manual alternative:** Render dashboard > **New** > **Static Site** > pick the repo, then set:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Redirects/Rewrites: source `/*`, destination `/index.html`, action **Rewrite**
- Headers (optional): path `/assets/*`, `Cache-Control: public, max-age=31536000, immutable`

No environment variables are needed.

## Edit content

All text lives in [`src/content.ts`](src/content.ts): profile, bio, languages, skills, projects, experience,
education, certificates and contact links. Add certificates to the `certificates` array; they appear on the
Experience screen under "Education & certificates". Leave `dates` out where a date is unknown.
=======
# portfolio-test
>>>>>>> a6795a2 (Create README.md)
