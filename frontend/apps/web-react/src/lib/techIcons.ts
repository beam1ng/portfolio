// Client-side name → devicon (jsDelivr CDN) lookup. Used where the entity has
// no stored iconUrl (e.g. skills), so no schema/migration is needed.
const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';

const ICONS: Readonly<Record<string, string>> = {
  'c#': 'csharp/csharp-original',
  csharp: 'csharp/csharp-original',
  typescript: 'typescript/typescript-original',
  javascript: 'javascript/javascript-original',
  python: 'python/python-original',
  sql: 'microsoftsqlserver/microsoftsqlserver-plain',
  'ms sql server': 'microsoftsqlserver/microsoftsqlserver-plain',
  'asp.net core': 'dotnetcore/dotnetcore-original',
  '.net': 'dotnetcore/dotnetcore-original',
  'entity framework core': 'dotnetcore/dotnetcore-original',
  react: 'react/react-original',
  vue: 'vuejs/vuejs-original',
  'vue 3': 'vuejs/vuejs-original',
  docker: 'docker/docker-original',
  redis: 'redis/redis-original',
  unity: 'unity/unity-original',
  bun: 'bun/bun-original',
};

/** Returns a CDN SVG URL for a known technology/skill name, or null. */
export function iconForName(name: string): string | null {
  const slug = ICONS[name.trim().toLowerCase()];
  return slug ? `${BASE}${slug}.svg` : null;
}
