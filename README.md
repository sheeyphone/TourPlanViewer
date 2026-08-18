# Tours

A home for travel plans. Each destination lives in its own folder with a shared structure for map/roadbook, research docs, checklists and budgets.

## Structure

```
tours/
├── README.md               # this index
└── YYYY-MM-destination/    # e.g. 2026-09-norway-lofoten
    ├── README.md           # trip overview
    ├── app/                # Vue3 + Vite + Tailwind + Leaflet map / roadbook
    └── docs/               # itinerary, research, bookings, checklist, budget
```

## Running the map / roadbook

```bash
cd 2026-09-norway-lofoten/app
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # production build
```

### Private trip data (flights / hotels)

The repository contains **no flight, hotel or personal travel data**. Those live in a private file loaded at runtime:

- Place your data at `app/public/trip.json` (already git-ignored), e.g. copy `app/public/trip.json.example` or craft your own with this shape:

```json
{
  "transport": { "2": { "mode": "flight", "detail": "BKK 07:05 → HEL 15:25", "ref": "XX0000", "status": "confirmed" } },
  "hotels":    { "2": { "name": "Example Hotel", "status": "confirmed" } },
  "flights":   { "d2f": { "note": "BKK → HEL", "status": "confirmed" } },
  "notes":     { "2": "Airport transfer: train ~30min, ABC zone ticket" },
  "hotelMarkers": [ { "id": "example-hotel", "name": "Example Hotel", "lat": 60.1591, "lng": 24.938, "category": "hotel", "day": 2 } ]
}
```

The app fetches `/trip.json` on startup and merges it into the public skeleton. If the file is missing, a friendly banner is shown and only the public itinerary is displayed.

## Trips

| Destination | Departure | Folder | Status |
| ----------- | --------- | ------ | ------ |
| Norway Lofoten | 2026-09-26 | `2026-09-norway-lofoten` | planning |
