# Videoselz — Shoppable Video Analytics Dashboard

Take-home for the Videoselz Full Stack / SDE-2 role. A merchant dashboard that tracks how shoppable videos perform on a storefront: views, product clicks, and add-to-cart conversions.

**Stack:** React + Vite · Node.js + Express · SQLite (`better-sqlite3`) · modular CSS (no Tailwind)

---

## Quick start

Requires Node.js 18+.

```bash
git clone https://github.com/chhavey/videoselz-analytics.git
cd videoselz-analytics

# API
cd backend
cp .env.example .env
npm install
npm run seed          # creates SQLite file, runs schema, inserts sample data
npm run dev           # http://localhost:4000

# Web (new terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

From the repo root you can also run both together after installing each package:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:4000`, so the frontend works without a `VITE_API_URL`.

### Database

SQLite file: `backend/data/videoselz.db` (gitignored).

| Command | What it does |
|---|---|
| `npm run seed` (backend) | Applies `schema.sql` and inserts products, videos, and ~3k engagement events if the DB is empty |
| `npm run seed -- --reset` | Wipes and reseeds |
| `npm run migrate` | Schema only |

There is no separate migration runner beyond `schema.sql`. The API applies the schema on boot and seeds if the `products` table is empty, so a fresh clone is usable after `npm install` + `npm run dev`.

---

## What to click through

1. Open the dashboard — KPI strip + paginated video table.
2. Conversion rate column is computed in the browser: `add_to_carts / views`.
3. Sort by views, clicks, add-to-carts, title, or product.
4. Paginate (8 videos per page).
5. **Simulate traffic** posts a weighted random event (`view` 70% / `click` 22% / `add_to_cart` 8%) to `POST /api/events`, then refreshes the table.

---

## API

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/events` | Ingest one engagement event (storefront webhook stand-in) |
| `GET` | `/api/analytics/videos` | Paginated video metrics |
| `GET` | `/api/videos` | `{ id, title }` list for the simulator |
| `GET` | `/api/health` | Liveness |

### `POST /api/events`

```json
{ "videoId": 5, "eventType": "click" }
```

`eventType` must be `view` | `click` | `add_to_cart`. Optional `timestamp` (ISO-8601). Unknown `videoId` → 404.

### `GET /api/analytics/videos`

Query: `page` (default 1), `limit` (default 8, max 50), `sortBy` (`views` \| `clicks` \| `conversions` \| `title` \| `productName`), `sortOrder` (`asc` \| `desc`).

Counts are aggregated in SQL (`SUM(CASE WHEN …)`), not in Node. Conversion rate is **not** returned — the assignment asks for that on the frontend.

---

## Architecture

```
storefront / simulator
        │  POST /api/events
        ▼
   Express API  ── SQLite (WAL)
        │  GET /api/analytics/videos
        ▼
   React dashboard
        └── conversionRate(addToCarts, views)
```

**Why this shape**

- **Normalized SQL, not a single wide table.** Products 1—N videos 1—N events. Matches how a Shopify catalog actually looks (a SKU can have several UGC clips).
- **Aggregate in the database.** An events table grows fast. Grouping in SQL with an index on `(video_id, event_type)` stays cheap; pulling every row into JS would not.
- **Prices as integer cents.** Avoids `0.1 + 0.2` bugs. Formatted to USD on the client.
- **WAL mode.** Analytics reads should not block a burst of webhook writes.
- **Validation with Zod at the edge.** Bad payloads fail before they touch SQLite.
- **Conversion rate on the client.** The spec is explicit. It also keeps the metric definition next to the UI so a merchant-facing change (e.g. “clicks / views”) does not require a migration.

**What I would change in production**

- Cursor pagination instead of `LIMIT/OFFSET` once the catalog is large.
- A daily rollup table (or materialized view) so the dashboard does not scan raw events.
- Auth, idempotency keys on webhooks, and rate limits.
- GraphQL if this API has to sit next to the existing Videoselz graph — REST was requested here.

---

## Schema

```
products (id, name, price, created_at)
videos   (id, product_id → products.id, video_url, title)
engagement_events (id, video_id → videos.id, event_type, timestamp)
```

`event_type` is constrained to `view | click | add_to_cart`.

---

## Frontend notes

Styling is semantic HTML + CSS modules. No Tailwind, per the brief.

The layout is a merchant admin, not a marketing page: dark rail, paper canvas, one primary action (simulate traffic). Conversion rate is color-banded so a merchant can scan for clips that view well but do not convert.

---

## Submission links

Replace these after recording.

- **30-second pitch (YouTube, unlisted):** `https://youtu.be/REPLACE_ME`
- **3–5 min walkthrough (Loom / unlisted YouTube):** `https://youtu.be/REPLACE_ME`

### Pitch script (~30s)

> I'm Chhavi, a full-stack developer with about three years building product-facing MERN apps. I care about the why behind a bug, not just the patch — and I'm used to reviewing both human and AI-written code before it ships. Videoselz sits at the exact intersection I like: Shopify merchants, shoppable video, and a dashboard that has to be fast and honest about conversion. This take-home is a slice of that: ingest events like a webhook, aggregate in SQL, and let the UI own the conversion-rate definition. I'd like to do that work on the real product.

### Walkthrough outline (3–5 min)

1. Clone → seed → both servers up (30s).
2. Schema + why cents / indexes / WAL (45s).
3. `POST /api/events` in the Network tab, then Simulate (45s).
4. Table, CVR formula on the client, pagination, sort (60s).
5. One design tradeoff (SQL aggregation vs. rollups) (30s).

---

## Other public work

Significant public repos (GitHub: [chhavey](https://github.com/chhavey)):

- [BookMyHotel](https://github.com/chhavey/BookMyHotel) — full-stack booking app (React, Express, MongoDB, Razorpay)
- [libra-assessment](https://github.com/chhavey/libra-assessment)
- [vectorshift-assignment](https://github.com/chhavey/vectorshift-assignment)
- [netflix-gpt](https://github.com/chhavey/netflix-gpt)
- [pro-manage](https://github.com/chhavey/pro-manage) — task management
- [quizzie](https://github.com/chhavey/quizzie) — quiz builder
- [QEvents](https://github.com/chhavey/QEvents) — event management (Next.js)
- [workshop-graphql-netflix](https://github.com/chhavey/workshop-graphql-netflix) — GraphQL
- [graza](https://github.com/chhavey/graza)
- Portfolio: [chhavey.com](https://chhavey.com)

---

## Project layout

```
backend/
  src/
    db/            schema, connection, seed
    services/      SQL + domain rules
    controllers/   HTTP handlers
    validators/    Zod schemas
    middleware/    validation + errors
    routes/        /api/events, /api/analytics/videos
frontend/
  src/
    api/           fetch client
    utils/         conversion rate + traffic simulator
    App.tsx        dashboard
    App.module.css
```
