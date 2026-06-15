/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server on 5173. `/api` is proxied to the backend so the auth cookie is
// same-origin (SameSite=Lax, no Secure-on-http issues). Prod serves both from
// one host (Phase 5), so the frontend always talks to a relative `/api`.
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const API_TARGET = env?.VITE_API_PROXY_TARGET ?? 'http://localhost:5050';

// `vite build --mode static` produces the no-API build (reads content.json).
export default defineConfig(({ mode }) => ({
  define: mode === 'static' ? { 'import.meta.env.VITE_STATIC': '"true"' } : {},
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}));
