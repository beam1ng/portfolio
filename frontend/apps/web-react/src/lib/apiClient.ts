import { createPortfolioClient } from '@portfolio/api-client';

// Relative by default: dev proxies `/api` to the backend (see vite.config.ts);
// prod serves both from one origin. Override with VITE_API_BASE_URL if needed.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/** Singleton API client bound to the configured base URL. */
export const api = createPortfolioClient(baseUrl);
