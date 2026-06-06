# syntax=docker/dockerfile:1
# Build the React app with pnpm, then serve the static bundle via nginx.
# nginx also reverse-proxies /api to the api service, so the auth cookie stays
# same-origin in production (matches the Vite dev proxy). Build context = repo root.

FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app

# Install deps first (cached unless a manifest or the lockfile changes).
# --ignore-scripts avoids pnpm's strict "ignored builds" failure; esbuild's
# native binary is then provisioned explicitly via rebuild.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/packages/tsconfig/package.json frontend/packages/tsconfig/
COPY frontend/packages/design-tokens/package.json frontend/packages/design-tokens/
COPY frontend/packages/api-client/package.json frontend/packages/api-client/
COPY frontend/apps/web-react/package.json frontend/apps/web-react/
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild

# Build the app (VITE_API_BASE_URL defaults to the relative /api/v1).
COPY frontend/ frontend/
RUN pnpm --filter web-react build

FROM nginx:1.27-alpine AS runtime
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/apps/web-react/dist /usr/share/nginx/html
EXPOSE 80
