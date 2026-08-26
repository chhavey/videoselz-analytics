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
| `npm run seed` (backend) | Applies `schema.sql` and inserts Foxtale products, 12 UGC clips, and ~3k engagement events if the DB is empty |
| `npm run seed -- --reset` | Wipes and reseeds |
| `npm run migrate` | Schema only |

There is no separate migration runner beyond `schema.sql`. The API applies the schema on boot and seeds if the `products` table is empty, so a fresh clone is usable after `npm install` + `npm run dev`.

---

## What to click through

1. Open the dashboard — **store conversion** (left) and **how a shopper moves** (right), then **conversion by clip**, then the paginated table.
2. Conversion rate is computed in the browser: `add_to_carts / views` (table column, hero %, and chart).
3. Hover a chart bar — full product name sits under the column; the line below the plot shows the clip title.
4. Sort the table by views, clicks, add-to-carts, title, or product. Prices are INR.
5. Paginate (8 videos per page).
6. **Simulate traffic** posts a weighted random event (`view` 70% / `click` 22% / `add_to_cart` 8%) to `POST /api/events`. Baggs reacts; numbers refresh.

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
- **Prices as integer rupees.** Formatted to INR on the client (`en-IN`).
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

The screen is a merchant admin, not a marketing page:

- **60 / 40 split:** store conversion (rate, counts, best clip) and shopper path (watch → tap → bag, bars to scale).
- **Conversion by clip:** CSS column chart, no chart library. Product name wraps under each bar; clip title is in the readout (two clips can share a SKU).
- **Table** under that: play-circle icons, INR prices, client-side conversion rate, pagination.
- **Baggs** in the corner for tips after simulate-traffic. Not a replacement for the table.

Type: Plus Jakarta Sans for UI, Instrument Serif for the hero rate. Color: warm paper, Videoselz blue only on the primary action and the leading chart bar.

---

## AI collaboration

How I prompted, what the model produced, and what I changed: **[AI_PROMPTING.md](./AI_PROMPTING.md)**.

---

## Submission links

- **30-second pitch (YouTube, unlisted):** `https://youtu.be/REPLACE_ME`
- **3–5 min walkthrough (Loom):** `https://youtu.be/REPLACE_ME`


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
    hooks/         dashboard data (table, chart, simulate)
    components/    chart, table, shopper path, Baggs
    utils/         conversion rate + traffic simulator
    App.tsx        layout only
    styles/        global tokens
```
