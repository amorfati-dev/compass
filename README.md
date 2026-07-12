# Compass

A personal **dividend-growth-investing (DGI)** tracker built around a **FIRE** goal.
Compass connects *why* you'd hold a stock (a **thesis**) to *what* you actually hold
(**positions**), and visualizes your live progress toward a monthly passive-income target.

---

## Features

- **Thesis management** — capture the investment case for each candidate ticker,
  including a `kill_criterion` and a review `status`.
- **Position tracking** — record actual holdings (broker, shares, entry price,
  expected dividend per share).
- **FIRE Bar** — a live progress bar toward a target monthly net dividend income,
  summed across all positions. The target is currently a single example value
  (**3.500 €/month**); see [Roadmap](#roadmap) for the planned multi-tier model.
- **Asset classification** — every entry is tagged with a `type`
  (aristocrat, king, turnaround, ETF, cash, fonds, bonds, commodities, other).

> **Note on CRUD:** Theses currently support create, read, status update (PATCH)
> and delete. Positions support create and read only — update/delete are on the roadmap.

---

## Data model

Compass deliberately keeps **two independent models**:

| Model      | Purpose                                      |
| ---------- | -------------------------------------------- |
| `Thesis`   | The investment case for a ticker (the *why*) |
| `Position` | An actual holding (the *what*)               |

**Key design decisions**

- The two models are **not linked by a foreign key**. They are joined in the
  **frontend** by the `ticker` string (relationship is *1 Thesis : n Positions*).
- `expected_dividend_per_share` stores the **per-share** value. The FIRE Bar
  multiplies it by the share count to compute each position's contribution.
- The SQLite DB (`compass.db`) is **gitignored** — it never lives in the repo.

### Fields

**Thesis** — `ticker`, `name`, `type`, `thesis`, `kill_criterion`, `status`, `created_at`
**Position** — `broker`, `ticker`, `type`, `name`, `number_of_shares`, `entry_price`, `expected_dividend_per_share`, `created_at`

### Enums

- **type**: `aristocrat`, `king`, `turnaround`, `etf`, `cash`, `fonds`, `bonds`, `commodities`, `other`
- **status**: `unreviewed`, `thesis_valid`, `watchout`, `thesis_broken`

---

## Tech stack

- **Backend:** Python · FastAPI · SQLModel · SQLite
- **Frontend:** React 19 · TypeScript · Vite · Recharts
- **Deployment:** runs on a Hetzner VPS

---

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` (the backend's CORS config
already allows this origin).

---

## API reference

| Method   | Endpoint       | Description            |
| -------- | -------------- | ---------------------- |
| `GET`    | `/`            | Health check           |
| `POST`   | `/theses`      | Create a thesis        |
| `GET`    | `/theses`      | List all theses        |
| `GET`    | `/theses/{id}` | Get a single thesis    |
| `PATCH`  | `/theses/{id}` | Update a thesis status |
| `DELETE` | `/theses/{id}` | Delete a thesis        |
| `POST`   | `/positions`   | Create a position      |
| `GET`    | `/positions`   | List all positions     |

---

## Goals

Compass is a personal tool to make the path to **FIRE** tangible: by tying every
holding back to an explicit thesis (and an explicit kill criterion), it keeps the
portfolio honest, while the FIRE Bar turns an abstract goal into a number that
moves as the portfolio grows.

The current **3.500 €/month** target is only a hardcoded example. The longer-term
vision is a flexible **FIRE line** model so the bar can reflect different
strategies and personal numbers:

- **Lean FIRE** — cover only essential expenses.
- **Coast FIRE** — enough invested that growth alone reaches the goal by a target age.
- **Barista FIRE** — partial coverage, topped up by part-time income.
- **Fat FIRE** — a comfortable, no-compromises target.
- **Individual FIRE line** — a fully custom per-user monthly target.

---

## Roadmap

- [ ] Form reset after submit
- [ ] Unified card display (filter by ticker)
- [ ] Component refactor (`AddForm` / `ThesisCard` / `FireBar`)
- [ ] Full CRUD for positions (update + delete)
- [ ] Unified delete across both models
- [ ] Configurable FIRE line (Lean / Coast / Barista / Fat / custom per user)
- [ ] Enter real positions

---

## License

Released under the [MIT License](./LICENSE).
