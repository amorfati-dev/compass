# Compass — Frontend

The web client for **Compass**, built with **React 19 · TypeScript · Vite · Recharts**.

See the [project README](../README.md) for the full overview, data model, and goals.

## Development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and talks to the FastAPI backend
on `http://localhost:8000` (start the backend separately — see the root README).

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the Vite dev server (HMR)   |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Run ESLint                        |
