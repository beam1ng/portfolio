// Dev orchestrator (Phase 5 will replace this with full Docker Compose).
// `pnpm start` -> bring up MSSQL, wait until healthy, then run API + web
// concurrently with prefixed output and clean Ctrl+C shutdown.
//
// No external deps — pure Node. Reads the root .env for the SA password and
// injects ConnectionStrings__Default into the API process, so it works even
// without a local appsettings.Development.json.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTAINER = 'portfolio-mssql';
const HEALTH_TIMEOUT_MS = 120_000;
const HEALTH_POLL_MS = 3_000;
const WEB_PORT = 5173;
const API_PORT = 5050;
const isWindows = process.platform === 'win32';

const color = { api: '\x1b[36m', web: '\x1b[35m', sys: '\x1b[32m', err: '\x1b[31m', dim: '\x1b[2m', reset: '\x1b[0m' };

function log(tag, msg, c = color.sys) {
  process.stdout.write(`${c}[${tag}]${color.reset} ${msg}\n`);
}

/** Minimal KEY=VALUE .env parser (ignores comments/blank lines, strips quotes). */
function loadEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, shell: true, encoding: 'utf8', ...opts });
}

function dockerHealth() {
  const r = run('docker', ['inspect', '--format', '{{.State.Health.Status}}', CONTAINER], { stdio: 'pipe' });
  return (r.stdout || '').trim();
}

async function waitForHealthy() {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = dockerHealth();
    if (status === 'healthy') return true;
    log('db', `waiting for MSSQL... (${status || 'starting'})`, color.dim);
    await new Promise((r) => setTimeout(r, HEALTH_POLL_MS));
  }
  return false;
}

/** Pipe a child's output line-by-line with a colored prefix. */
function pipe(child, tag, c) {
  for (const stream of [child.stdout, child.stderr]) {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) process.stdout.write(`${c}[${tag}]${color.reset} ${line}\n`);
    });
  }
}

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log('sys', 'shutting down API + web (MSSQL left running — `pnpm stop` to stop it)…');
  for (const child of children) {
    if (child.pid && !child.killed) {
      if (isWindows) run('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      else child.kill('SIGINT');
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  const env = loadEnv(resolve(ROOT, '.env'));
  const password = env.MSSQL_SA_PASSWORD;
  if (!password) {
    log('err', 'MSSQL_SA_PASSWORD missing. Copy .env.example to .env first.', color.err);
    process.exit(1);
  }
  const dbPort = env.MSSQL_PORT || '1433';
  const dbName = env.MSSQL_DB || 'PortfolioDb';

  log('sys', 'starting MSSQL (docker compose up -d mssql)…');
  const up = run('docker', ['compose', 'up', '-d', 'mssql'], { stdio: 'inherit' });
  if (up.status !== 0) {
    log('err', 'docker compose failed. Is Docker Desktop running?', color.err);
    process.exit(1);
  }

  if (!(await waitForHealthy())) {
    log('err', `MSSQL not healthy within ${HEALTH_TIMEOUT_MS / 1000}s.`, color.err);
    process.exit(1);
  }
  log('sys', 'MSSQL healthy [ok]');

  const connection =
    `Server=localhost,${dbPort};Database=${dbName};User Id=sa;Password=${password};TrustServerCertificate=True;`;

  log('sys', `starting API → http://localhost:${API_PORT}  (migrates + seeds on boot)`);
  const api = spawn('dotnet', ['run', '--project', 'backend/src/Portfolio.Api', '--launch-profile', 'http'], {
    cwd: ROOT,
    shell: true,
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'Development', ConnectionStrings__Default: connection },
  });
  children.push(api);
  pipe(api, 'api', color.api);

  log('sys', `starting web → http://localhost:${WEB_PORT}`);
  const web = spawn('pnpm', ['--filter', 'web-react', 'dev'], { cwd: ROOT, shell: true, env: process.env });
  children.push(web);
  pipe(web, 'web', color.web);

  setTimeout(() => {
    log('sys', `\n  > Portfolio:  http://localhost:${WEB_PORT}\n  > API:        http://localhost:${API_PORT}/api/v1\n  Press Ctrl+C to stop.\n`);
  }, 4_000);

  for (const child of children) {
    child.on('exit', (code) => {
      if (!shuttingDown) {
        log('err', `a process exited (code ${code}); stopping the rest.`, color.err);
        shutdown(code ?? 1);
      }
    });
  }
}

main().catch((e) => {
  log('err', String(e), color.err);
  shutdown(1);
});
