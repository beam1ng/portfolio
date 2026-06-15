/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** 'true' for the static (no-API) build. */
  readonly VITE_STATIC?: string;
  /** Override the static content URL (defaults to /content.json). */
  readonly VITE_CONTENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
