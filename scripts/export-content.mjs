// Exports the live portfolio content to a static JSON bundle for the
// no-API ("static") deployment. Run with the backend reachable:
//
//   pnpm start            # (or docker compose up) so the site is live
//   node scripts/export-content.mjs        # uses http://localhost:5173/api/v1 (web origin)
//   API_BASE=http://localhost:5050/api/v1 node scripts/export-content.mjs   # direct to dev API
//
// Writes frontend/apps/web-react/public/content.json — commit it; the static
// build and CI deploy ship exactly what's committed.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'frontend/apps/web-react/public/content.json');
// The web origin proxies /api in both `pnpm start` (Vite) and docker (nginx),
// so it works regardless of which port the API itself listens on.
const API_BASE = (process.env.API_BASE ?? 'http://localhost:5173/api/v1').replace(/\/$/, '');

/** Fetches an endpoint and unwraps the { success, data } envelope. */
async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  }
  const envelope = await res.json();
  if (!envelope.success || envelope.data == null) {
    throw new Error(`GET ${path} → unsuccessful envelope: ${envelope.error ?? 'no data'}`);
  }
  return envelope.data;
}

async function main() {
  console.log(`Exporting content from ${API_BASE} …`);

  const [profile, summaries, skills, technologies, experience, education] = await Promise.all([
    get('/profile'),
    get('/projects'),
    get('/skills'),
    get('/technologies'),
    get('/experience'),
    get('/education'),
  ]);

  // The list endpoint returns summaries; fetch each project's full detail
  // (description, dates, per-technology notes) in listing order.
  const projects = [];
  for (const summary of summaries) {
    projects.push(await get(`/projects/${encodeURIComponent(summary.slug)}`));
  }

  const content = { profile, projects, skills, technologies, experience, education };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(content, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${OUT.replace(ROOT + '\\', '').replace(ROOT + '/', '')} — ` +
      `${projects.length} projects, ${skills.length} skill groups, ${technologies.length} technologies, ` +
      `${experience.length} experience, ${education.length} education.`,
  );
}

main().catch((err) => {
  console.error(`\nExport failed: ${err.message}`);
  console.error('Is the API running? Try `pnpm start` first.');
  process.exit(1);
});
