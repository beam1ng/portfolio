# Azure deployment (Bicep)

Infrastructure-as-code for the portfolio: **Azure Container Apps** (api + web),
**Azure SQL** (serverless, auto-pause), and **Log Analytics**.

> ⚠️ **Status: unvalidated scaffold.** This Bicep was authored without a live
> subscription. Run `az bicep build --file main.bicep` and review before
> deploying. Treat the first deploy as a dry run.

## Cost safety (read this first)

For very low traffic (a handful of visitors/day) the goal is "near $0, and
*impossible* to surprise me". Two layers do that.

### Layer 1 — guardrails baked into the template

The Bicep ships with cost-safe defaults so a bug, a traffic spike, or abuse
can't fan out:

| Guardrail | Default | Effect |
|-----------|---------|--------|
| `minReplicas` | **0** | Both apps scale to zero when idle → no compute billed while nobody's visiting (first request after idle has a cold start). |
| `maxReplicas` | **1** | Hard ceiling — a spike or scraper can never spin up many paid replicas. |
| `concurrentRequests` | 40 | Per-replica concurrency before it *would* scale (bounded by `maxReplicas`). |
| SQL `GP_S_Gen5_1` serverless | 1 vCore max | Compute can't scale past 1 vCore; **auto-pauses after 60 min idle** so it bills storage only when nobody's using it. Scale-to-zero on the API is what lets the DB actually go idle. |
| `dbMaxSizeGb` | 2 | Caps storage growth. |
| backups | `Local` | Avoids pricier geo-redundant backup storage. |
| `logDailyQuotaGb` | 0.5 | **Hard daily cap** on Log Analytics ingestion — logging literally stops for the day if exceeded, so it can't run up a bill. |

Realistic idle cost at this footprint: roughly the SQL storage (~a couple GB) +
a tiny bit of Log Analytics — single-digit dollars/month, often less.

### Layer 2 — a budget + alert on the subscription (DO THIS)

> **Azure does not hard-stop spending by default.** A budget only *alerts*; it
> won't switch things off on its own. This is the single most important step.

1. **Cost Management → Budgets → Add**: scope to the resource group, set a small
   monthly budget (e.g. **$10**), alerts at 50% / 80% / 100% to your email.
2. Optionally wire the 100% alert to an **Action Group** that runs automation to
   stop/delete resources (true hard cap requires this — Azure won't do it for
   you).
3. Use **Cost Management → Cost analysis** the first week to confirm reality
   matches expectation.
4. If you only want to *try* it: a new **Azure free account** gives $200 credit
   for 30 days and is spend-capped by default (it suspends rather than bills) —
   the safest way to experiment.

### Cheaper alternative (if Azure feels heavy for this)

For 5 users/day a managed SQL + Container Apps is overkill. The frontend is
static — **Azure Static Web Apps (Free tier)** or any static host serves it for
$0; pair with a free/cheap Postgres (e.g. Neon/Supabase free tier) if you port
off SQL Server. Not wired up here, but worth knowing the Azure path is a
*choice*, not a requirement.

CI (GitHub Actions) and image hosting (GHCR) are **free** regardless — only the
Azure runtime costs money.

## Prerequisites

- Azure CLI (`az`) + Bicep (`az bicep install`)
- An Azure subscription and resource group
- Published images (the `Release` workflow pushes them to GHCR on a `v*` tag).
  If the GHCR packages are private, configure a registry credential on the
  Container Apps (not covered here) or make the packages public.

## Go live — full walkthrough (repo → running site)

### 0. Publish images (GitHub + GHCR)

```bash
git push origin main          # CI runs (build/test); see .github/workflows
git tag v0.1.0
git push origin v0.1.0        # Release workflow builds + pushes images to GHCR
```

Then, in GitHub, make both packages public so Azure can pull without creds:
**Profile → Packages → portfolio-api / portfolio-web → Package settings →
Change visibility → Public.** (Or keep private and add a registry credential to
the container apps — extra step, not covered here.)

### 1. Azure account (safest option first)

Create a **free Azure account** — $200 credit for 30 days and **spend-capped by
default** (it suspends instead of billing you). Best way to try this risk-free.

### 2. Install tooling & sign in

```bash
# Windows: winget install Microsoft.AzureCLI
az login
az bicep install
```

### 3. Validate the template (it's an unreviewed scaffold)

```bash
az bicep build --file infra/azure/main.bicep   # fix any errors it reports
```

### 4. Deploy

```bash
az group create -n portfolio-rg -l westeurope

az deployment group create \
  --resource-group portfolio-rg \
  --template-file infra/azure/main.bicep \
  --parameters infra/azure/main.parameters.example.json \
  --parameters \
      apiImage='ghcr.io/<your-user>/portfolio-api:0.1.0' \
      webImage='ghcr.io/<your-user>/portfolio-web:0.1.0' \
      aspnetEnvironment='Development' \
      sqlAdminPassword='<strong-password>' \
      jwtSigningKey='<random-32+-char-secret>' \
      adminPassword='<admin-password>'
```

- Secrets are passed inline (or via Key Vault) — **never commit them**.
- `aspnetEnvironment='Development'` on the **first** deploy makes the API seed the
  project content (see caveat #2). You can redeploy as `Production` later; the
  data persists in SQL.
- The deployment prints `webUrl`.

### 5. Set a budget (do this now — Azure won't hard-stop spend)

Portal → **Cost Management → Budgets → Add**: scope to `portfolio-rg`, ~$10/mo,
email alerts at 50/80/100%. See "Cost safety" above.

### 6. Verify

- Open `webUrl` → projects/skills should render (seeded content).
- Go to `/admin`, sign in with `adminEmail` / `adminPassword`, set your real
  bio and anything else.

### 7. Updating later

Push a new tag (`v0.1.1`) → images rebuild → re-run the `az deployment group
create` (or `az containerapp update --image ...`). Migrations apply on startup.

### Tear down (stop all billing)

```bash
az group delete -n portfolio-rg --yes --no-wait
```

## Known wiring caveats (resolve before/at deploy)

1. **nginx upstream** — the web image reads `API_UPSTREAM` (defaults to the
   compose service `api:8080`). The Bicep sets it to the API app's internal
   FQDN. Confirm the API is reachable at `http://<fqdn>` on port 80 from the web
   app (Container Apps internal ingress).
2. **Content seeding** — placeholder content is only seeded when
   `ASPNETCORE_ENVIRONMENT=Development`. For a populated Production site, either
   set that, or sign in to `/admin` and enter content (the admin user is always
   seeded from `Admin__*`).
3. **HTTPS cookie** — Container Apps serves the web app over HTTPS, so the
   auth cookie's `Secure` flag (set from request scheme) works. The API trusts
   `X-Forwarded-Proto` via nginx; verify forwarded headers if login misbehaves.
4. **DB migrations** run automatically on API startup (`MigrateAsync`).
5. **GHCR auth** — make the image packages public, or add a registry secret to
   the Container Apps configuration.
