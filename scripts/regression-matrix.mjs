#!/usr/bin/env node

/**
 * Generate every architecture in isolation, run the toolchain checks that are
 * available on this machine, and write a machine-readable regression report.
 *
 * This script intentionally keeps the checks below the full repository gate
 * suite: it proves that the scaffold itself can produce a usable root per
 * architecture. Generated projects still own their `pnpm check`/`verify`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { ARCHITECTURES, resolveArchitecture } from '../scaffold.config.mjs';
import { parseScaffoldArguments } from '../lib/arguments.mjs';
import { findSpecsDirectory, generateProject } from '../lib/generator.mjs';
import { applicationRootName } from '../lib/naming.mjs';
import { verifyGeneratedRepository } from '../lib/verify.mjs';

const SCAFFOLD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_COMPONENTS = 'iam,appbase,rtc,im,agents,order';

const options = parseArgs({
  args: process.argv.slice(2),
  options: {
    workspace: { type: 'string' },
    root: { type: 'string' },
    architectures: { type: 'string' },
    components: { type: 'string', default: DEFAULT_COMPONENTS },
    preset: { type: 'string' },
    specs: { type: 'string' },
    keep: { type: 'boolean', default: false },
    'keep-failures': { type: 'boolean', default: true },
    json: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: false,
}).values;

if (options.help) {
  console.log([
    'Usage: node scripts/regression-matrix.mjs [options]',
    '',
    '  --workspace <dir>   SDKWork sibling workspace (default: scaffold parent)',
    '  --root <dir>        Matrix working root (default: <workspace>/_scratch/scaffold-matrix-<timestamp>)',
    '  --architectures <csv|all>  Architectures to test (default: all)',
    `  --components <csv|all|none> Components to integrate (default: ${DEFAULT_COMPONENTS})`,
    '  --preset <csv>      Component presets to add',
    '  --specs <dir>       sdkwork-specs checkout',
    '  --keep              Keep every generated project',
    '  --no-keep-failures  Remove failed projects too',
    '  --json <file>       Report path (default: .sdkwork/tmp/scaffold-regression-matrix.json)',
  ].join('\n'));
  process.exit(0);
}

const workspace = path.resolve(options.workspace ?? path.dirname(SCAFFOLD_ROOT));
const stamp = new Date().toISOString().replace(/[:.]/gu, '-');
const matrixRoot = path.resolve(options.root ?? path.join(workspace, '_scratch', `scaffold-matrix-${stamp}`));
const architectures = options.architectures && options.architectures !== 'all'
  ? options.architectures.split(',').map((item) => item.trim()).filter(Boolean)
  : Object.keys(ARCHITECTURES);
const reportPath = path.resolve(options.json ?? path.join(SCAFFOLD_ROOT, '.sdkwork', 'tmp', 'scaffold-regression-matrix.json'));

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  return !result.error && result.status === 0;
}

function run(command, args, cwd, timeout = 600_000) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    shell: process.platform === 'win32',
    maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return {
    command: [command, ...args].join(' '),
    ok: !result.error && result.status === 0,
    code: result.status ?? 1,
    durationMs: Date.now() - started,
    outputTail: output.split(/\r?\n/u).slice(-12).join('\n'),
  };
}

function runStep(name, command, args, cwd) {
  console.log(`  - ${name}: ${command} ${args.join(' ')}`);
  const result = run(command, args, cwd);
  if (!result.ok) console.log(`    failed (${result.code})\n${result.outputTail}`);
  return { name, ...result };
}

function toolchainKind(architecture) {
  return resolveArchitecture(architecture).kind;
}

function appChecks(architecture, target, optionsForProject) {
  const appName = applicationRootName(optionsForProject.code, resolveArchitecture(architecture));
  const appRoot = path.join(target, 'apps', appName);
  const kind = toolchainKind(architecture);
  const steps = [];

  if (kind === 'web' || kind === 'mini-program') {
    steps.push(runStep('pnpm-install', 'pnpm', ['install', '--no-frozen-lockfile'], target));
    steps.push(runStep('typecheck', 'pnpm', ['--dir', `apps/${appName}`, 'exec', 'tsc', '--noEmit'], target));
    if (kind === 'web') {
      steps.push(runStep('build', 'pnpm', ['--dir', `apps/${appName}`, 'exec', 'vite', 'build'], target));
    }
  } else if (kind === 'flutter') {
    if (!commandExists('flutter')) {
      steps.push({
        name: 'flutter-analyze',
        command: 'flutter analyze',
        ok: true,
        code: 0,
        durationMs: 0,
        outputTail: 'skipped: flutter is not installed',
        skipped: true,
      });
    } else {
      steps.push(runStep('flutter-pub-get', 'flutter', ['pub', 'get'], appRoot));
      steps.push(runStep('flutter-analyze', 'flutter', ['analyze'], appRoot));
      steps.push(runStep('flutter-test', 'flutter', ['test'], appRoot));
    }
  } else if (['ios', 'android', 'harmony'].includes(kind)) {
    steps.push({
      name: 'native-toolchain',
      command: `${kind} static integration plan`,
      ok: true,
      code: 0,
      durationMs: 0,
      outputTail: 'static-only: native compiler is not available in this environment',
      skipped: true,
    });
  }

  return steps;
}

function cleanup(target, preserve) {
  if (preserve) return;
  if (!target.startsWith(matrixRoot + path.sep)) {
    throw new Error(`Refusing to remove a path outside the matrix root: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

fs.mkdirSync(matrixRoot, { recursive: true });
const report = {
  schemaVersion: 1,
  kind: 'sdkwork.scaffold.regression-matrix',
  generatedAt: new Date().toISOString(),
  workspace,
  matrixRoot,
  architectures,
  components: options.components,
  preset: options.preset ?? null,
  rows: [],
};

let failed = 0;

for (const architectureId of architectures) {
  console.log(`\n[${architectureId}]`);
  const target = path.join(matrixRoot, architectureId);
  const code = 'matrix';
  const cliArgs = [
    '--code', code,
    '--name', `${architectureId} matrix`,
    '--domain', 'matrix',
    '--architectures', architectureId,
    '--components', options.components,
    '--workspace', workspace,
    '--target', target,
    '--no-git',
    '--no-install',
  ];
  if (options.preset) cliArgs.push('--preset', options.preset);
  if (options.specs) cliArgs.push('--specs', options.specs);

  const projectOptions = parseScaffoldArguments(cliArgs);
  projectOptions.quiet = true;
  const specsDirectory = findSpecsDirectory({
    explicit: projectOptions.specs,
    target,
    scaffoldRoot: SCAFFOLD_ROOT,
  });

  const steps = [];
  let generated = false;
  try {
    const result = generateProject({
      options: projectOptions,
      scaffoldRoot: SCAFFOLD_ROOT,
      specsDirectory,
    });
    generated = true;
    const verification = verifyGeneratedRepository(target, projectOptions);
    steps.push({
      name: 'verify-generated',
      command: 'sdkwork-scaffold local verification',
      ok: verification.ok,
      code: verification.ok ? 0 : 1,
      durationMs: 0,
      outputTail: verification.issues.slice(0, 6).join('\n'),
    });
    steps.push(...appChecks(architectureId, target, projectOptions));
    steps.push({
      name: 'generated-files',
      command: 'summary',
      ok: true,
      code: 0,
      durationMs: 0,
      outputTail: `${result.written.length} files; ${result.components.length} components`,
    });
  } catch (error) {
    steps.push({
      name: 'generate',
      command: 'sdkwork-scaffold generateProject',
      ok: false,
      code: 1,
      durationMs: 0,
      outputTail: error.message,
    });
  }

  const rowFailed = steps.some((step) => !step.ok);
  const preserve = options.keep || (rowFailed && options['keep-failures']);
  cleanup(target, preserve);
  if (rowFailed) failed += 1;
  report.rows.push({
    architecture: architectureId,
    code,
    target,
    generated,
    preserved: preserve,
    status: rowFailed ? 'failed' : 'passed',
    steps,
  });
  console.log(`[${architectureId}] ${rowFailed ? 'FAILED' : 'passed'}${preserve ? ' (kept)' : ''}`);
}

report.summary = {
  total: report.rows.length,
  passed: report.rows.filter((row) => row.status === 'passed').length,
  failed,
  skippedNativeToolchains: report.rows.filter((row) => row.steps.some((step) => step.skipped)).length,
};
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('\nArchitecture matrix');
for (const row of report.rows) {
  const detail = row.steps.find((step) => step.skipped)?.outputTail ?? row.steps.at(-1)?.outputTail ?? '';
  console.log(`- ${row.architecture.padEnd(14)} ${row.status.padEnd(7)} ${detail.split('\n')[0]}`);
}
if (!options.keep && fs.existsSync(matrixRoot) && fs.readdirSync(matrixRoot).length === 0) {
  fs.rmdirSync(matrixRoot);
}

console.log(`\npassed ${report.summary.passed}/${report.summary.total}; report: ${reportPath}`);
if (failed > 0) process.exit(1);
