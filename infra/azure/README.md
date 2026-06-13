# Azure deployment (Bicep)

Infrastructure-as-code for the portfolio: **Azure Container Apps** (api + web),
**Azure SQL** (serverless, auto-pause), and **Log Analytics**.

> ⚠️ **Status: unvalidated scaffold.** This Bicep was authored without a live
> subscription. Run `az bicep build --file main.bicep` and review before
> deploying. Treat the first deploy as a dry run.

## Cost note

Not free. The cheapest realistic footprint:
- **Azure SQL serverless** (`GP_S_Gen5_1`, auto-pause 1h) — bills per-second of
  compute; pauses when idle (storage still bills, a few $/mo).
- **Container Apps** — has a monthly free grant; 2 small apps at `minReplicas: 1`
  may stay near/within it. Set `minReplicas: 0` to scale to zero (cold starts).
- **Log Analytics** — small ingestion cost.

CI (GitHub Actions) and image hosting (GHCR) **are** free — see the workflows in
`.github/workflows/`. Only the Azure runtime costs money.

## Prerequisites

- Azure CLI (`az`) + Bicep (`az bicep install`)
- An Azure subscription and resource group
- Published images (the `Release` workflow pushes them to GHCR on a `v*` tag).
  If the GHCR packages are private, configure a registry credential on the
  Container Apps (not covered here) or make the packages public.

## Deploy

```bash
az group create -n portfolio-rg -l westeurope

az deployment group create \
  --resource-group portfolio-rg \
  --template-file infra/azure/main.bicep \
  --parameters infra/azure/main.parameters.example.json \
  --parameters \
      sqlAdminPassword='<strong-password>' \
      jwtSigningKey='<random-32+-char-secret>' \
      adminPassword='<admin-password>'
```

Secrets are passed inline (or via Key Vault references) — never commit them.
The deployment outputs `webUrl`.

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
