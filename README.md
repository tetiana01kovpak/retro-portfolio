# Tetiana Kovpak — retro portfolio

A 1970s CRT computer that boots up and shows the portfolio on its screen. Vite + vanilla TypeScript, no framework.

## Run

```sh
npm ci
npm run dev        # http://localhost:5173
```

Deep links skip the boot animation: `#welcome`, `#about`, `#projects`, `#experience`, `#contact`, `#game`.
Keys: `1`–`5` or `←`/`→` switch screens, `Esc` goes home, any key skips the boot. The power button on the case reboots.

The Game screen is a small invaders game: `←`/`→` or `A`/`D` move, `Space` fires, `Enter` starts, `P` pauses
(on-screen buttons on touch devices). The arrow keys play instead of switching screens there; the high score
is kept in `localStorage`.

## Build and check

```sh
npm run build      # type-check + production build into dist/
npm run check      # build + tests (vitest; Node 22.12+, 24 or 26+)
```

## Serve with Docker

```sh
docker compose up -d --build   # http://localhost:8080, health at /health
```

## Deploy on GitHub Pages

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) tests, builds and publishes `dist/` on every push to
`main` (or run it by hand from the Actions tab). The site is served at
<https://tetiana01kovpak.github.io/portfolio-test/>. Pages on a private repository needs a paid GitHub plan.

One-time setup: repo **Settings > Pages > Build and deployment > Source**: **GitHub Actions**.

The workflow takes the base path from `actions/configure-pages`, so the same build works under
`/portfolio-test/` and at the root of a custom domain. No rewrite is needed because routing is hash-based.
Pages can't set custom headers, so the long `Cache-Control` on `/assets/*` only applies on Render and Docker.

**Custom domain (later):**

1. **Settings > Pages > Custom domain**: enter the domain, save, then tick **Enforce HTTPS** once the
   certificate is issued. No `CNAME` file is needed for Actions deploys.
2. DNS at the registrar:
   - Subdomain (`www.example.com`): `CNAME` to `tetiana01kovpak.github.io`.
   - Apex (`example.com`): `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153` (optionally `AAAA` `2606:50c0:8000::153` through `2606:50c0:8003::153`).
3. Re-run the workflow so the build switches to base `/`.
4. Optional: verify the domain under your GitHub account **Settings > Pages** to prevent takeovers.

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
