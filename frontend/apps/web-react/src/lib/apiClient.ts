import { createPortfolioClient, createStaticPortfolioClient } from '@portfolio/api-client';

/** True for the static (no-API) build deployed to e.g. Azure Static Web Apps. */
export const isStatic = import.meta.env.VITE_STATIC === 'true';

// Static build reads a bundled content.json; otherwise talk to the live API.
// API base is relative by default: dev proxies `/api` to the backend
// (see vite.config.ts); the full-stack deploy serves both from one origin.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const contentUrl = import.meta.env.VITE_CONTENT_URL ?? '/content.json';

/** Singleton API client — live or static depending on the build. */
export const api = isStatic
  ? createStaticPortfolioClient(contentUrl)
  : createPortfolioClient(baseUrl);
