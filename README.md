# Videoselz — Shoppable Video Analytics

Take-home project for Videoselz (SDE-2 / Full Stack). A merchant dashboard for **Foxtale** that shows how shoppable videos perform: views, clicks, and add-to-carts.

---

## Videos

- **30-second pitch:** [YouTube Shorts](https://youtube.com/shorts/-u7ODQ37GII)
- **Walkthrough (3–5 min):** [Loom](https://www.loom.com/share/a50419da2d4e4d5da6c7cd119119961d)

---

## Run locally

You need **Node.js 18+**.

```bash
git clone https://github.com/chhavey/videoselz-analytics.git
cd videoselz-analytics
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**

That starts both the API (`:4000`) and the frontend (`:5173`). The frontend talks to the API through a dev proxy — no extra env setup needed.

**First time?** The API creates the SQLite database and seeds Foxtale sample data on its own when you start it.

**Reset sample data:**

```bash
npm run seed -- --reset
```

---

## What to try

1. Open the dashboard — store conversion on the left, shopper journey on the right.
2. Scroll to the **conversion by clip** chart and the **videos** table.
3. Click **Simulate traffic** — a random view / click / add-to-cart is sent to the API and the numbers update.
4. Sort the table, change pages, hover chart bars for clip details.

**Conversion rate** is calculated in the browser: `add to carts ÷ views`.

---

## Live demo

- **Dashboard:** [https://videoselz-analytics.vercel.app/](https://videoselz-analytics.vercel.app/)
- **API health:** [https://videoselz-analytics.onrender.com/api/health](https://videoselz-analytics.onrender.com/api/health)

---

## Tech stack

React · Vite · Express · SQLite · TypeScript · CSS modules (no Tailwind)

---

## API (short)


| Method | Path                    | What it does                      |
| ------ | ----------------------- | --------------------------------- |
| `GET`  | `/api/health`           | Check the API is up               |
| `GET`  | `/api/analytics/videos` | Paginated video stats             |
| `GET`  | `/api/videos`           | Video list (for simulate traffic) |
| `POST` | `/api/events`           | Log a view, click, or add-to-cart |


Example event:

```json
{ "videoId": 1, "eventType": "click" }
```

---

## Project structure

```
backend/     Express API + SQLite (schema, seed, routes)
frontend/    React dashboard (table, chart, simulate traffic)
```

Database file: `backend/data/videoselz.db` (created locally, not in git).

---

## AI collaboration

Prompt log for this project: **[AI_PROMPTING.md](./AI_PROMPTING.md)**

---

## Other work

GitHub: [chhavey](https://github.com/chhavey) · Portfolio: [chhavey.com](https://chhavey.com)

Notable repos: [BookMyHotel](https://github.com/chhavey/BookMyHotel), [QEvents](https://github.com/chhavey/QEvents), [netflix-gpt](https://github.com/chhavey/netflix-gpt)