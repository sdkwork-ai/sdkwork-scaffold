import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { parseScaffoldArguments } from '../lib/arguments.mjs';
import {
  generateProject,
  SCAFFOLD_MARKER,
} from '../lib/generator.mjs';
import { selfCheck, verifyGeneratedRepository } from '../lib/verify.mjs';

const SCAFFOLD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function makeTempDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sdkwork-scaffold-test-'));
}

function makeOptions(target, overrides = {}) {
  return {
    code: 'sample-app',
    target,
    name: 'Sample App',
    owner: 'sdkwork-platform',
    domain: 'sample',
    description: 'Sample application for scaffold tests.',
    appType: 'APP_REACT',
    surfaces: ['pc', 'h5'],
    siteUrl: 'https://sdkwork.com/apps/sdkwork-sample-app',
    specs: undefined,
    initGit: false,
    install: false,
    dryRun: false,
    force: false,
    verify: true,
    ...overrides,
  };
}

function generate(options) {
  return generateProject({
    options,
    scaffoldRoot: SCAFFOLD_ROOT,
    specsDirectory: null,
  });
}

test('parseScaffoldArguments validates and normalizes a complete invocation', () => {
  const options = parseScaffoldArguments([
    '--code', 'sample-app',
    '--target', path.join(os.tmpdir(), 'sample-target'),
    '--name', 'Sample App',
    '--owner', 'sdkwork-labs',
    '--surfaces', 'pc',
    '--no-git',
    '--no-install',
  ]);
  assert.equal(options.code, 'sample-app');
  assert.equal(options.name, 'Sample App');
  assert.equal(options.owner, 'sdkwork-labs');
  assert.deepEqual(options.surfaces, ['pc']);
  assert.equal(options.initGit, false);
  assert.equal(options.install, false);
});

test('parseScaffoldArguments rejects invalid codes and empty surface lists', () => {
  assert.throws(
    () => parseScaffoldArguments(['--code', 'Sample_App', '--target', 'out']),
    /lower kebab-case/u,
  );
  assert.throws(
    () => parseScaffoldArguments(['--code', 'sample-app', '--target', 'out', '--surfaces', 'pc,desktop']),
    /Unknown surface/u,
  );
  assert.throws(
    () => parseScaffoldArguments(['--code', 'sample-app', '--target', 'out', '--surfaces', ',']),
    /at least one surface/u,
  );
});

test('template registry self-check renders every template for every surface', () => {
  const result = selfCheck(SCAFFOLD_ROOT);
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
});

test('generator creates a verified repository with PC and H5 surfaces', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const result = generate(makeOptions(target));
  assert.ok(result.written.length > 30);
  assert.ok(fs.existsSync(path.join(target, SCAFFOLD_MARKER)));
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-pc', 'src', 'App.tsx')));
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-h5', 'src', 'App.tsx')));
  assert.ok(fs.existsSync(path.join(target, 'docs', 'product', 'prd', 'PRD.md')));

  const verification = verifyGeneratedRepository(target, makeOptions(target));
  assert.deepEqual(verification.issues, []);
  assert.equal(verification.ok, true);

  const manifest = JSON.parse(fs.readFileSync(path.join(target, 'agent.app.config.json'), 'utf8'));
  assert.equal(manifest.app.key, 'sdkwork-sample-app');
  assert.deepEqual(manifest.metadata.scaffold.surfaces, ['pc', 'h5']);
  const iconPath = path.join(target, 'assets', 'media', 'icons', 'icon-1024.png');
  assert.equal(manifest.media.icons.primary.fileSizeBytes, fs.statSync(iconPath).size);
});

test('generator honors a surface subset', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const options = makeOptions(target, { surfaces: ['pc'] });
  generate(options);
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-pc')));
  assert.equal(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-h5')), false);

  const manifest = JSON.parse(fs.readFileSync(path.join(target, 'agent.app.config.json'), 'utf8'));
  assert.deepEqual(manifest.metadata.scaffold.surfaces, ['pc']);
  assert.equal(verifyGeneratedRepository(target, options).ok, true);
});

test('generator refuses an arbitrary non-empty directory', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  fs.writeFileSync(path.join(target, 'keep.txt'), 'do not overwrite\n', 'utf8');

  assert.throws(
    () => generate(makeOptions(target)),
    /Target is not empty/u,
  );
  assert.equal(fs.readFileSync(path.join(target, 'keep.txt'), 'utf8'), 'do not overwrite\n');
});

test('--force requires a scaffold marker and regenerates a managed target', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  fs.writeFileSync(path.join(target, 'keep.txt'), 'unmanaged\n', 'utf8');

  assert.throws(
    () => generate(makeOptions(target, { force: true })),
    /Refusing --force/u,
  );

  const managed = makeTempDirectory();
  t.after(() => fs.rmSync(managed, { recursive: true, force: true }));
  generate(makeOptions(managed));
  const regenerated = generate(makeOptions(managed, { force: true }));
  assert.ok(regenerated.written.length > 0);
  assert.equal(verifyGeneratedRepository(managed, makeOptions(managed)).ok, true);
});

test('generated content contains no unresolved template tokens', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  generate(makeOptions(target, { surfaces: ['h5'] }));

  const offenders = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      const text = fs.readFileSync(absolute, 'utf8');
      if (/__[A-Z][A-Z0-9_]*__/u.test(text)) offenders.push(absolute);
    }
  }
  walk(target);
  assert.deepEqual(offenders, []);
});
