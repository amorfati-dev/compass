# Compass 1.0

A personal **dividend-growth-investing (DGI)** cockpit built around a **FIRE** goal.
Compass pulls real portfolio data from **Parqet** (OAuth2 + PKCE), computes trailing
net dividend income, and visualizes live progress toward a monthly passive-income target.

---

## What 1.0 does

- **Live Parqet connection** — the backend authenticates once via OAuth2/PKCE
  (`/auth/parqet/login`), stores the token in SQLite, and **auto-refreshes it**
  when it expires (proven in practice: expired tokens are renewed silently via
  the refresh token, no re-login needed).
- **`GET /holdings`** — fetches all four portfolios from Parqet's performance API,
  filters out sold and cash positions, corrects dividend net values (uses `gainNet`
  where taxes are known, otherwise `gainGross × (1 − 0.26375)` German capital gains
  tax), and aggregates duplicate ISINs across brokers into one position.
- **FIRE Bar** — progress toward the target of **3.500 € net dividends/month**
  (trailing twelve months ÷ 12), currently ~34 %.
- **KPI tiles** — trailing net dividends per year and per month.
- **Positions table** — all ~90 aggregated positions sorted by dividend contribution,
  with current value, net dividend, **yield** (dividend ÷ current value) and
  **yield on cost** (dividend ÷ purchase value).
- **Dividend donut** — one slice per position with > 100 € net dividends/year,
  everything smaller summed into an "Sonstige" slice; details on hover.
- **Thesis management** — capture the investment case per ticker including a
  `kill_criterion` and review `status` (create, read, status update, delete).

## What 1.0 deliberately does *not* do

Kept out of scope for this release — see the phase plan for when they land:

- **Forward yields** — all dividend numbers are trailing (last 12 months),
  not projected forward.
- **Simulation** — no "what if I invest X €/month" projections yet.
- **Allocator** — no suggestions where fresh money should go.
- **Deployment** — runs locally only; the Hetzner VPS deployment is a later phase.

## How to run it

Two terminals.

**Terminal 1 — backend** (FastAPI on `http://localhost:8000`, docs at `/docs`):

```bash
cd backend
source .venv/bin/activate   # first time: python -m venv .venv && pip install -r requirements.txt
uvicorn main:app --reload
```

**Terminal 2 — frontend** (Vite dev server on `http://localhost:5173`):

```bash
cd frontend
npm run dev                 # first time: npm install first
```

**First run only:** open `http://localhost:8000/auth/parqet/login` once in the
browser and approve access — this stores the Parqet token in the local SQLite DB
(`compass.db`, gitignored). After that the token refreshes itself.

---

## Tech stack

- **Backend:** Python · FastAPI · SQLModel · SQLite · httpx
- **Frontend:** React 19 · TypeScript · Vite · Recharts

## API reference

| Method   | Endpoint               | Description                                  |
| -------- | ---------------------- | -------------------------------------------- |
| `GET`    | `/`                    | Health check                                 |
| `GET`    | `/holdings`            | Aggregated live holdings + monthly dividend  |
| `GET`    | `/auth/parqet/login`   | Start OAuth2/PKCE flow (one-time)            |
| `GET`    | `/auth/parqet/callback`| OAuth2 callback, stores token                |
| `POST`   | `/theses`              | Create a thesis                              |
| `GET`    | `/theses`              | List all theses                              |
| `GET`    | `/theses/{id}`         | Get a single thesis                          |
| `PATCH`  | `/theses/{id}`         | Update a thesis status                       |
| `DELETE` | `/theses/{id}`         | Delete a thesis                              |
| `POST`   | `/positions`           | Create a manual position                     |
| `GET`    | `/positions`           | List manual positions                        |
| `DELETE` | `/positions/{ticker}`  | Delete manual positions by ticker            |

---

## License

Released under the [MIT License](./LICENSE).
