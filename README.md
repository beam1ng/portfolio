# Portfolio Platform

Personal portfolio — projects, technologies, skills, summary. DB-driven content with an authenticated admin panel.

- **Backend:** ASP.NET Core (.NET 10) Web API, C#, Clean Architecture, EF Core
- **Frontend:** React + TypeScript (Vite), pnpm workspaces
- **Database:** MS SQL Server
- **Infra:** Docker, Azure (Container Apps + Azure SQL), Bicep IaC

Full architecture & roadmap: [`docs/PLAN.md`](docs/PLAN.md).

## Repository Layout

```
backend/    .NET solution — Domain / Application / Infrastructure / Api + tests
frontend/   pnpm workspaces — apps/web-react + shared packages (api-client, design-tokens, tsconfig)
infra/      Dockerfiles + Azure Bicep
docs/       plan, ADRs, runbooks
```

## Prerequisites

| Tool   | Version       | Notes                                              |
|--------|---------------|----------------------------------------------------|
| .NET   | 10.0+ SDK     | `dotnet --version`                                 |
| Node   | 22+           | `node --version`                                   |
| pnpm   | 11+           | via Corepack — see below                           |
| Docker | 24+           | for MS SQL Server and full-stack compose           |

### pnpm via Corepack

Corepack ships with Node. Enable once (admin shell on Windows):

```bash
corepack enable pnpm
```

If you cannot run as admin, invoke pnpm through the Corepack shim instead:

```bash
corepack pnpm install
```

The pnpm version is pinned in root `package.json` (`packageManager`).

## Getting Started

### Quick start (one command)

```bash
cp .env.example .env        # first time only — sets MSSQL_SA_PASSWORD
pnpm install                # first time only
pnpm start                  # DB up + wait healthy, then API + web together
```

Opens nothing automatically — go to **http://localhost:5173**. `Ctrl+C` stops API
and web (the DB container is left running; `pnpm stop` stops it).
`pnpm start` injects the connection string from `.env`, so no
`appsettings.Development.json` is required for the dev flow.

`pnpm start` runs the API and web natively (fast hot-reload). For a
production-like run, use the full Docker stack below.

### Full stack (Docker)

```bash
cp .env.example .env            # first time only
docker compose up --build       # mssql + api + web, all containerized
```

Open **http://localhost:5173** (nginx serves the SPA and reverse-proxies `/api`
to the API container, so everything is one origin). `Ctrl+C` then
`docker compose down` to stop. The API auto-migrates and seeds on startup.

### Manual (run each piece yourself)

```bash
# 1. Environment
cp .env.example .env        # then edit secrets

# 2. Database only (Docker)
docker compose up -d mssql      # just the database

# 3. Backend local config (gitignored — holds your local SA password)
cp backend/src/Portfolio.Api/appsettings.Development.example.json \
   backend/src/Portfolio.Api/appsettings.Development.json
#   then set Password=... to match MSSQL_SA_PASSWORD from your .env

# 4. Backend (auto-migrates + seeds on startup) → http://localhost:5050
dotnet run --project backend/src/Portfolio.Api

# 5. Frontend → http://localhost:5173
corepack pnpm install           # first run only
corepack pnpm dev               # = pnpm --filter web-react dev
```

Health probe: `GET http://localhost:5050/health`.
Frontend reads `VITE_API_BASE_URL` from `frontend/apps/web-react/.env`
(`http://localhost:5050/api/v1` for local `dotnet run`; `8080` under docker compose).

### Frontend checks

```bash
corepack pnpm -r typecheck      # tsc across packages + app
corepack pnpm -r test           # vitest
corepack pnpm -r build          # production build
```

## Static hosting (free — Azure Static Web Apps)

A no-API build of the frontend that reads a bundled `content.json` instead of
calling the live API — so it can run on **Azure Static Web Apps (Free tier)** (or
any static host) for **$0**, with no database to bill or secure. The full-stack
(API + SQL) path is unchanged and still available.

Trade-off: no live admin panel in production. You edit content locally and
re-export.

**Update + build:**

```bash
pnpm start                 # run the app locally (admin works here)
# ...edit content at http://localhost:5173/admin...
pnpm export:content        # writes frontend/apps/web-react/public/content.json
pnpm build:static          # no-API build → frontend/apps/web-react/dist
```

`content.json` is committed; the deploy ships exactly what's committed.

**Deploy:** create an Azure Static Web App (Free), then in the repo set the
`AZURE_STATIC_WEB_APPS_API_TOKEN` secret and the `STATIC_DEPLOY_ENABLED=true`
variable — the [`Deploy (Azure Static Web Apps)`](.github/workflows/static-web-app.yml)
workflow builds `--mode static` and publishes on push to `main`. SPA routing,
headers, and caching come from `public/staticwebapp.config.json`.

How it works: `VITE_STATIC` (set by `vite build --mode static`) swaps the API
client for one that reads `content.json`; admin routes are a lazy chunk that
folds out of the static build entirely.

## Build Phases

See [`docs/PLAN.md`](docs/PLAN.md) §11. Done: **Phase 1 Foundation** ✅,
**Phase 2 Backend core** ✅, **Phase 3 Frontend core** ✅, **Phase 4 Auth + Admin** ✅,
**Phase 5 Dockerize end-to-end** ✅. Next: **Phase 6 — CI/CD + Azure IaC**.

### Admin

Sign in at **`/admin`** (redirects to `/admin/login`). The admin user is seeded from
`ADMIN__EMAIL` / `ADMIN__PASSWORD` in `.env` (and `Admin` in
`appsettings.Development.json`). Auth is a JWT in an httpOnly cookie; in dev Vite
proxies `/api` to the backend so the cookie stays same-origin. Admin can CRUD
projects, technologies, skills, and the profile — changes show on the public site.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- C#: `dotnet format`; nullable enabled; warnings-as-errors.
- TS: strict mode; single quotes; 2-space indent.
- Many small, cohesive files over few large ones.
