import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@portfolio/api-client';

const STALE_TIME_MS = 5 * 60 * 1000;
const MAX_RETRIES = 2;

/**
 * Don't retry 4xx (client) errors — they won't succeed on repeat.
 * Retry transient network/5xx failures a couple of times.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  });
}
