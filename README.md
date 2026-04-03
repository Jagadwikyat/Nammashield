# NammaShield

Parametric income protection for gig workers — Next.js frontend, **Supabase** (Postgres + realtime), **Flask** ML service (risk & fraud scoring) deployable to **Render**, and **OpenWeatherMap** for weather triggers (Phase 2 Batch 3+).

## Phase 2 stack

| Layer | Technology |
|--------|------------|
| App | Next.js 16, React 19, Tailwind, shadcn/ui, Zustand |
| Database | Supabase (Postgres) — see `supabase/migrations/` |
| Auth (demo) | Phone + localStorage session tied to `workers` row |
| ML API | Python 3.11, Flask, scikit-learn — `ml/` |
| Triggers / cron | Next.js Route Handlers (planned: Batch 3), Vercel cron |

## Local development

1. Clone the repo and install JS dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill Supabase and API keys
3. Run SQL migrations in the Supabase SQL editor (files under `supabase/migrations/`) or use the Supabase CLI
4. **ML service**: `cd ml`, create a venv, `pip install -r requirements.txt`, run `python train_data.py`, `python risk_model.py`, `python fraud_model.py`, then `python api.py` (serves on port 5000). Set `NEXT_PUBLIC_ML_API_URL=http://localhost:5000` in `.env.local`
5. Start the app: `npm run dev` → http://localhost:3000

## ML folder

See `ml/README.md` for the Flask microservice.
