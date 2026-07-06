# All in One — front-end (ported from prototype)

This `src/` was split out of the single-file prototype `all-in-one.jsx`.

## Run
```bash
npm install
npm install react-router-dom @tanstack/react-query lucide-react recharts
npm run dev
```
Delete the Vite defaults that the theme replaces:
`src/App.css`, `src/index.css`, `public/vite.svg`, `src/assets/react.svg`.

## How it's wired
- `context/AppContext.tsx` recreates the prototype's `useApp()` — all state + handlers.
  Every feature reads from it, so the components are near-verbatim ports.
- `theme/` holds the colour tokens and the injected `STYLES` block (no Tailwind needed).
- `i18n/`, `config/`, `data/` hold the dictionaries, config arrays and mock seeds.
- `routes.tsx` maps `role/view` to a feature component (the prototype's render switch).
- `data/*` is temporary mock data — replace each with a TanStack Query call (`lib/api.ts`)
  in the backend step, then delete the seeds.
- Aino calls the backend proxy (`features/assistant/useAino.ts` → `/aino`), never the
  Anthropic API directly. It shows a graceful error until the backend `/aino` route exists.

## Notes
- `tsconfig.app.json` is intentionally relaxed (`strict:false`, no unused-locals checks)
  so the faithful JS-style port runs and builds. Tighten it as you add real types.
- QM / Audit / Content / Comms are kept whole in their container files. Their listed
  sub-files (e.g. `qm/KPIs.tsx`) are reserved stubs — split them out later if you want.
