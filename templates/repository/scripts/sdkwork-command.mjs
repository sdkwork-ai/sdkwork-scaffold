#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS_ROOT = path.join(ROOT, 'apps');
const SESSION_FILE = path.join(ROOT, '.sdkwork', 'tmp', 'dev-session.json');
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const PNPM_EXECPATH = process.env.npm_execpath;
const APP_NAME_PREFIX = `sdkwork-__APP_CODE__-`;

function fail(message) {
  console.error(`error: ${message}`);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, ''));
}

function parseArguments(argv) {
  const flags = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      positional.push(item);
      continue;
    }
    const [name, inline] = item.slice(2).split('=', 2);
    if (inline !== undefined) {
      flags[name] = inline;
    } else if (argv[index + 1] && !argv[index + 1].startsWith('--')) {
      flags[name] = argv[index + 1];
      index += 1;
    } else {
      flags[name] = true;
    }
  }
  return { command: positional[0] ?? 'check', flags };
}

function listApplications() {
  if (!fs.existsSync(APPS_ROOT)) return [];
  return fs.readdirSync(APPS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(APP_NAME_PREFIX))
    .map((entry) => {
      const directory = path.join(APPS_ROOT, entry.name);
      const packagePath = path.join(directory, 'package.json');
      if (!fs.existsSync(packagePath)) return null;
      const manifest = readJson(packagePath);
      return {
        directory,
        name: manifest.name,
        surface: manifest.sdkwork?.surface ?? entry.name.slice(APP_NAME_PREFIX.length),
        devPort: Number(manifest.sdkwork?.devPort ?? 4173),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function run(command, args, cwd, env = {}, shell = undefined) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: shell ?? (process.platform === 'win32' && command === PNPM),
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function pnpmInvocation(args) {
  if (PNPM_EXECPATH) {
    if (/\.(?:cjs|mjs|js)$/iu.test(PNPM_EXECPATH)) {
      return { command: process.execPath, args: [PNPM_EXECPATH, ...args], shell: false };
    }
    return { command: PNPM_EXECPATH, args, shell: false };
  }
  return { command: PNPM, args, shell: process.platform === 'win32' };
}

function runPnpm(args, cwd, env = {}) {
  const invocation = pnpmInvocation(args);
  return run(invocation.command, invocation.args, cwd, env, invocation.shell);
}

function runtimeEnvironment(flags, defaultEnvironment) {
  return {
    SDKWORK_DEPLOYMENT_PROFILE: String(flags['deployment-profile'] ?? 'standalone'),
    SDKWORK_ENVIRONMENT: String(flags.environment ?? defaultEnvironment),
  };
}

function withApps(callback) {
  const apps = listApplications();
  if (apps.length === 0) {
    fail('no application surfaces found under apps/.');
    return 1;
  }
  let status = 0;
  for (const app of apps) {
    const result = callback(app);
    if (result !== 0) status = result;
  }
  return status;
}

function typecheck(flags) {
  const env = runtimeEnvironment(flags, 'development');
  return withApps((app) => runPnpm(['exec', 'tsc', '--noEmit'], app.directory, env));
}

function build(flags) {
  const env = runtimeEnvironment(flags, 'prod');
  return withApps((app) => {
    const status = runPnpm(['exec', 'vite', 'build'], app.directory, env);
    if (status !== 0) return status;
    const output = path.join(
      app.directory,
      'dist',
      env.SDKWORK_DEPLOYMENT_PROFILE,
      env.SDKWORK_ENVIRONMENT,
      'index.html',
    );
    if (!fs.existsSync(output)) {
      fail(`build did not produce ${path.relative(ROOT, output)}`);
      return 1;
    }
    console.log(`built ${path.relative(ROOT, path.dirname(output))}`);
    return 0;
  });
}

function test(flags) {
  const env = runtimeEnvironment(flags, 'development');
  const status = run(process.execPath, ['--test', 'tests/*.test.mjs'], ROOT, env);
  return status;
}

function check(flags) {
  const typecheckStatus = typecheck(flags);
  if (typecheckStatus !== 0) return typecheckStatus;
  return test(flags);
}

function verify(flags) {
  const checkStatus = check(flags);
  if (checkStatus !== 0) return checkStatus;
  return build(flags);
}

function safeRemove(target, label) {
  const resolved = path.resolve(target);
  const relative = path.relative(ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`refusing to remove ${label} outside the repository: ${resolved}`);
    return false;
  }
  fs.rmSync(resolved, { recursive: true, force: true });
  return true;
}

function clean() {
  for (const app of listApplications()) {
    safeRemove(path.join(app.directory, 'dist'), `${app.name} build output`);
  }
  safeRemove(SESSION_FILE, 'development session registry');
  console.log('cleaned enumerated build output');
  return 0;
}

function writeSession(session) {
  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
  fs.writeFileSync(SESSION_FILE, `${JSON.stringify(session, null, 2)}\n`, 'utf8');
}

function readSession() {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    return readJson(SESSION_FILE);
  } catch {
    return null;
  }
}

function terminate(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Already exited.
    }
  }
}

function stop() {
  const session = readSession();
  if (!session) {
    console.log('no development session registered');
    return 0;
  }
  for (const child of session.children ?? []) terminate(child.pid);
  safeRemove(SESSION_FILE, 'development session registry');
  console.log(`stopped ${(session.children ?? []).length} development process(es)`);
  return 0;
}

function dev(flags) {
  const apps = listApplications();
  if (apps.length === 0) {
    fail('no application surfaces found under apps/.');
    return 1;
  }
  const existing = readSession();
  if (existing) {
    const running = (existing.children ?? []).filter((child) => {
      try {
        process.kill(child.pid, 0);
        return true;
      } catch {
        return false;
      }
    });
    if (running.length > 0) {
      fail('a development session is already running; run "pnpm stop" first.');
      return 1;
    }
    safeRemove(SESSION_FILE, 'stale development session registry');
  }

  const env = runtimeEnvironment(flags, 'development');
  const children = [];
  writeSession({ startedAt: new Date().toISOString(), children });

  for (const app of apps) {
    const invocation = pnpmInvocation([
      'exec', 'vite', '--host', '127.0.0.1', '--port', String(app.devPort), '--strictPort',
    ]);
    const child = spawn(invocation.command, invocation.args, {
      cwd: app.directory,
      stdio: 'inherit',
      env: { ...process.env, ...env },
      detached: process.platform !== 'win32',
      shell: invocation.shell,
    });
    children.push({ pid: child.pid, name: app.name, surface: app.surface, port: app.devPort });
    child.on('error', (error) => {
      console.error(`[${app.name}] failed to start: ${error.message}`);
    });
  }
  writeSession({ startedAt: new Date().toISOString(), children });
  console.log(`development surfaces: ${children.map((child) => `${child.surface}:${child.port}`).join(', ')}`);

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    for (const child of children) terminate(child.pid);
    safeRemove(SESSION_FILE, 'development session registry');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  return 0;
}

async function main() {
  const { command, flags } = parseArguments(process.argv.slice(2));
  switch (command) {
    case 'dev':
      process.exitCode = dev(flags);
      return;
    case 'stop':
      process.exitCode = stop();
      return;
    case 'build':
      process.exitCode = build(flags);
      return;
    case 'typecheck':
      process.exitCode = typecheck(flags);
      return;
    case 'test':
      process.exitCode = test(flags);
      return;
    case 'check':
      process.exitCode = check(flags);
      return;
    case 'verify':
      process.exitCode = verify(flags);
      return;
    case 'clean':
      process.exitCode = clean();
      return;
    case 'help':
    case '--help':
      console.log('Usage: node scripts/sdkwork-command.mjs <dev|stop|build|typecheck|test|check|verify|clean> [--deployment-profile <standalone|cloud>] [--environment <name>]');
      return;
    default:
      fail(`unknown command "${command}"`);
  }
}

await main();

// Keep the process alive while Vite children use inherited stdio; their exit
// handlers are registered above. The event loop drains when the last child
// exits and the dev session is cleaned by the signal handler or stop command.
