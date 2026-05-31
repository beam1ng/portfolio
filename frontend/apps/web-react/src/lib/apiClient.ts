import { createPortfolioClient } from '@portfolio/api-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env in frontend/apps/web-react.',
  );
}

/** Singleton API client bound to the configured base URL. */
export const api = createPortfolioClient(baseUrl);
