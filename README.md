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
npm run check      # build + tests (node --test, needs Node 23.6+)
```

## Serve with Docker

```sh
docker compose up -d --build   # http://localhost:8080, health at /health
```

## Edit content

All text lives in [`src/content.ts`](src/content.ts): profile, bio, languages, skills, projects, experience,
education, certificates and contact links. Add certificates to the `certificates` array; they appear on the
Experience screen under "Education & certificates". Leave `dates` out where a date is unknown.
