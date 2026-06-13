# Portfolio Platform — Architecture & Build Plan

> Status: PROPOSED — awaiting approval. Last updated 2026-05-29.

## 1. Goals

- Showcase projects, technologies, skills, and a personal summary.
- DB-driven content with an authenticated admin panel for editing.
- Hosted on **Azure** (Container Apps + Azure SQL).
- Backend: **ASP.NET Core (.NET 9) Web API, C#**.
- Frontend: **React + TypeScript (Vite)**.
- Architected so other FE stacks (Vue / Svelte / Angular) slot in later.
- Docker, Git, MS SQL Server.
- Code: consistent, documented, modular.

## 2. High-level Architecture

```
Browser ──> React SPA (web-react) ──HTTP/JSON──> ASP.NET Core API ──EF Core──> MS SQL Server
                                                      │
                                              JWT auth (admin)
```

- API is the single source of truth. Frontends are clients.
- Public read endpoints (projects, skills, profile) + protected admin CRUD.
- Typed TS API client generated from OpenAPI so every FE app stays in sync.

## 3. Repository Layout (monorepo)

```
portfolio/
├── backend/
│   ├── src/
│   │   ├── Portfolio.Domain/          # entities, value objects, enums (no deps)
│   │   ├── Portfolio.Application/     # use cases, DTOs, interfaces, validation
│   │   ├── Portfolio.Infrastructure/  # EF Core, MSSQL, repositories, Identity
│   │   └── Portfolio.Api/             # controllers, DI, auth, Swagger, middleware
│   ├── tests/
│   │   ├── Portfolio.UnitTests/
│   │   └── Portfolio.IntegrationTests/
│   └── Portfolio.sln
├── frontend/
│   ├── apps/
│   │   └── web-react/                 # main React TS app (Vite)
│   │       (future: web-vue/, web-svelte/, admin/)
│   └── packages/
│       ├── api-client/                # generated typed client from OpenAPI
│       ├── design-tokens/             # CSS custom properties, framework-agnostic
│       └── tsconfig/                  # shared TS config
├── infra/
│   ├── docker/                        # Dockerfiles
│   └── azure/                         # Bicep IaC (Container Apps, Azure SQL)
├── docs/                              # this plan, ADRs, API docs, runbooks
├── .github/workflows/                 # CI: build, test, docker
├── docker-compose.yml                 # local dev: api + web + mssql
├── .editorconfig
├── .gitignore
└── README.md
```

Clean Architecture dependency rule: `Domain <- Application <- Infrastructure / Api`.
Frontend uses **pnpm workspaces** so multiple FE apps share packages.

## 4. Backend Design

- **.NET 9**, Clean Architecture, Repository + Unit-of-Work over EF Core.
- **Entities**: Profile, Project, Technology, ProjectTechnology (join), Skill, SkillCategory. (Experience/Education later.)
- **API**: REST, versioned `/api/v1`. Response envelope `{ success, data, error, meta }`.
- **Validation**: FluentValidation at boundaries.
- **Docs**: Swagger / OpenAPI + Scalar UI.
- **Auth (admin)**: ASP.NET Core Identity + JWT bearer; single admin user seeded.
- **Errors**: global exception middleware -> consistent problem responses; no leaks.
- **Migrations + seed**: EF Core migrations; idempotent seed of placeholder content.

## 5. Frontend Design

- **Vite + React + TS**, React Router, **TanStack Query** for server state.
- **Design tokens via CSS custom properties** — color scheme deferred; neutral
  placeholder palette now, swap one token file later. Light/dark ready.
- Pages: Home/Summary, Projects (grid), Project detail, Skills, Contact, Admin (protected).
- Admin: protected routes, login, CRUD forms — same React app for now.
- Quality bar follows web design rules (no template look, intentional hierarchy/motion).
- Typed API client consumed from `packages/api-client`.

## 6. Multi-Framework Readiness (architect now, build later)

- `frontend/apps/*` is the slot for additional stacks; shared `design-tokens`
  package is framework-agnostic CSS so Vue/Svelte/Angular reuse the same look.
- `api-client` regenerated per app from the same OpenAPI spec.
- Only `web-react` built now; others added without restructuring.

## 7. Docker & Local Dev

- `docker-compose.yml`: `mssql` (Azure SQL Edge / MSSQL 2022), `api`, `web`.
- Per-app Dockerfiles (multi-stage). Healthchecks. Volume for SQL data.
- One command (`docker compose up`) brings the whole stack up locally.

## 8. Azure Hosting

- **Azure Container Apps** for api + web, **Azure SQL Database** for data.
- **Bicep** IaC in `infra/azure`. Container Registry (ACR) for images.
- Secrets via Azure Key Vault / Container App secrets — never in source.

## 9. Testing

- Backend: **xUnit** + FluentAssertions; integration tests with Testcontainers (MSSQL).
- Frontend: **Vitest** + React Testing Library; **Playwright** for E2E.
- Target 80%+ coverage on logic.

## 10. CI/CD

- GitHub Actions: lint -> build -> test -> docker build -> (push to ACR on main).
- Conventional commits.

## 11. Build Phases (incremental, reviewable)

1. **Foundation** ✅ — git init, .gitignore/.gitattributes/.editorconfig, README,
   .env.example, .NET 10 solution (clean-arch projects + tests, builds green),
   pnpm workspace (tsconfig + design-tokens packages), docker-compose skeleton (mssql).
2. **Backend core** ✅ (code) — entities (Profile/Project/Technology/ProjectTechnology/
   Skill/SkillCategory), EF Core configs, repositories, DI, `InitialCreate` migration,
   idempotent seeder, public read API (`/api/v1` profile/projects/skills/technologies),
   ApiResponse envelope, exception middleware, CORS, OpenAPI + Scalar. Builds green.
   Live-DB run pending Docker daemon.
3. **Frontend core** ✅ — Vite React TS app (`web-react`), React Router, TanStack
   Query, design tokens, typed `@portfolio/api-client`, public pages (Home/Projects/
   Project detail/Skills/Contact/404) wired to the live API. Typecheck + 11 tests +
   prod build green; verified end-to-end in browser against seeded data.
4. **Auth + Admin** ✅ — ASP.NET Core Identity + JWT in an httpOnly cookie,
   seeded admin from config, protected `/api/v1/admin` CRUD (projects/technologies/
   skills/profile) with FluentValidation + slug-conflict checks, and a guarded
   `/admin` SPA (login, dashboard, CRUD forms). Vite proxies `/api` so the cookie is
   same-origin. Build/typecheck/11 tests green; auth + CRUD verified via API and browser.
5. **Dockerize end-to-end** ✅ — multi-stage Dockerfiles (api: .NET publish on
   `aspnet:10.0`; web: pnpm build → nginx serving the SPA and reverse-proxying
   `/api` to the api container). `docker compose up --build` runs mssql + api + web;
   secrets injected via compose env (never baked into images). Verified: web proxy →
   api → db, public reads + admin auth (cookie via nginx) all working.
6. **CI/CD + Azure IaC** — CI ✅ (GitHub Actions: backend build+test, frontend
   typecheck+test+build, docker image build). CD ✅ (Release workflow pushes images
   to GHCR on `v*` tag — free). Azure Bicep (Container Apps + serverless SQL +
   Log Analytics) authored in `infra/azure/` but **unvalidated / not deployed**
   (needs a paid subscription). Web image made deploy-portable: nginx upstream is
   env-driven (`API_UPSTREAM`) via envsubst.
7. **Tests + docs polish** — coverage, ADRs, runbooks.

## 12. Open Items

- Color scheme / brand: deferred; token system absorbs the choice later.
- Domain name & Azure subscription: needed at deploy time (phase 6).
- Contact form: email provider (later).

## 13. Decisions (locked)

- Host: Azure (Container Apps + Azure SQL).
- Content: DB-driven with authenticated admin panel.
- Multi-FE: architected now, React built first.
