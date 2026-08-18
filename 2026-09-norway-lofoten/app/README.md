# Map / Roadbook · Frontend

Vue 3 + Vite + Tailwind + Leaflet map & roadbook for the Norway Lofoten 2026 trip.

## Getting started

```bash
pnpm install
pnpm dev        # dev preview http://localhost:5173
pnpm build      # production build
```

## Layout

- Left 2/3: Leaflet + OpenStreetMap map (POI markers + driving routes)
- Right 1/3: daily itinerary (overview timeline / D1~D14, click to focus the map)
- Top-right: journey animation player (play/pause/reset, speed, full/driving scope) + en-route station toggle (off / EV chargers / fuel)

## Real route geometry

Driving legs follow real roads (E10/E6 etc.); geometry is pre-downloaded to `public/routes/*.geojson`:

```bash
pnpm routes          # re-download / add legs (OSRM, overview=simplified; --force to overwrite)
```

`mode === 'drive'` legs in `routes.js` configure `geometryFile`; flight legs are dashed arcs (no geometry needed).

## En-route fuel / charging stations

Stations within ~8 km of each driving leg are pre-downloaded to `public/stations/*.json` (Overpass/OSM):

```bash
pnpm stations        # re-download / add legs (--force to overwrite)
```

The "stations" toggle (off / EV / fuel) shows them on driving days in Day view only.

## Private trip data

Flights / hotels / personal logistics are **not** in this repository. Put them in `public/trip.json` (git-ignored, see `trip.json.example`). The app fetches `/trip.json` at startup and merges it into the public skeleton; a banner appears if the file is missing.

## Data (single source of truth)

Edit files under `src/data/` and the map / roadbook update live:

| File | Purpose |
| ---- | ------- |
| `itinerary.js` | Day-by-day plan: date / title / transport / activities / hotel / driving / notes |
| `places.js` | POIs: id / name / coords / category / day / status / notes |
| `routes.js` | Legs: from→to / day / mode / status / notes |
| `config.js` | Base map, category colors, zoom threshold, animation config |

Status: `todo` (dashed) / `planned` / `confirmed` (solid).

When adding a POI, align its `day` with the matching itinerary day; routes reference existing place ids.
