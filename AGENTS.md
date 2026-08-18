# AGENTS.md — Project conventions (read before making changes)

## Repository layout
- Each destination is its own folder (e.g. `2026-09-norway-lofoten/`)
- Map/roadbook app: Vue 3 + Vite + Tailwind + Leaflet under `app/` — `pnpm dev` / `pnpm build`

## Hard rule: never commit private travel data
- Flight numbers/times/booking status, hotel names/status, and personal logistics
  (check-in times, airport transfers, budgets) are **forbidden** in any committed file
  (`src/`, `docs/`, READMEs, examples) and in git history.
- The only place for private data: `2026-09-norway-lofoten/app/public/trip.json`
  (git-ignored), loaded at runtime via `fetch('/trip.json')` and merged over the public skeleton.
- In public files write placeholders only (e.g. "flights/hotels: see private data").
  README/example values must be fake (`XX0000`, `Example Hotel`).
- `docs/03-bookings/`, `docs/04-checklist/`, `docs/05-budget/` are local-only sensitive docs (git-ignored).
- After any change, self-check (must return 0):
  `git ls-files ':!AGENTS.md' | xargs grep -lE "AY[0-9]{3,4}|DY[0-9]{3,4}|Scandic|Citybox|奇迹转机"`
- If private data ever lands in history, rebuild as a single orphan commit + force push.

## Data sources of truth
- Public skeleton: `app/src/data/itinerary.js` (day plans), `places.js` (POIs),
  `routes.js` (legs), `config.js` (map/animation).
- `trip.json` merge keys (`transport`/`hotels`/`flights`/`notes`/`hotelMarkers`) must
  align with skeleton day / route ids.
- When the itinerary changes, sync all three: skeleton → `trip.json` → `docs/01-itinerary/day-by-day.md`.
- A new POI's `day` must match the corresponding itinerary day.

## Verification
- Always run `cd 2026-09-norway-lofoten/app && pnpm build` after data/code changes.
- Private data live check: `pnpm dev` → `/trip.json` returns 200 and no amber banner shows.
- Re-fetch real route geometry / stations: `pnpm routes` / `pnpm stations` (`--force` overwrites).

## Commit discipline
- Commit / push only when explicitly asked.
- Never stage: `trip.json`, `docs/03-bookings/`, `dist/`, `.DS_Store`.
- Inspect `git status` and `git diff` before staging.

## Content & communication
- Root / app / trip READMEs stay in English; root README has no "复用方式" section.
- Major itinerary changes (cities, removing days, changing the drive loop) require confirmation first.
- No code comments unless requested; follow existing component/style conventions.
