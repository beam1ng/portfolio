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

```bash
# 1. Environment
cp .env.example .env        # then edit secrets

# 2. Database (Docker)
docker compose up -d            # starts portfolio-mssql

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

## Build Phases

See [`docs/PLAN.md`](docs/PLAN.md) §11. Done: **Phase 1 Foundation** ✅,
**Phase 2 Backend core** ✅, **Phase 3 Frontend core** ✅. Next: **Phase 4 — Auth + Admin**.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- C#: `dotnet format`; nullable enabled; warnings-as-errors.
- TS: strict mode; single quotes; 2-space indent.
- Many small, cohesive files over few large ones.
