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
import { ARCHITECTURES } from '../scaffold.config.mjs';
import { COMPONENTS } from '../components.config.mjs';

const SCAFFOLD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKSPACE = path.dirname(SCAFFOLD_ROOT);

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
    architectures: ['pc', 'h5'],
    surfaces: ['pc', 'h5'],
    components: [{ id: 'iam' }, { id: 'appbase' }],
    componentMode: 'linked',
    workspace: WORKSPACE,
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
    '--architectures', 'pc,mini-program',
    '--components', 'iam,order',
    '--no-git',
    '--no-install',
  ]);
  assert.equal(options.code, 'sample-app');
  assert.equal(options.name, 'Sample App');
  assert.equal(options.owner, 'sdkwork-labs');
  assert.deepEqual(options.architectures, ['pc', 'mini-program']);
  assert.deepEqual(options.components.map((component) => component.id), ['iam', 'order']);
  assert.equal(options.appType, 'APP_REACT');
  assert.equal(options.initGit, false);
  assert.equal(options.install, false);
});

test('parseScaffoldArguments supports surfaces alias and component config', () => {
  const configPath = path.join(makeTempDirectory(), 'components.json');
  fs.writeFileSync(configPath, JSON.stringify({
    components: {
      rtc: { enabled: true, config: { region: 'cn' } },
      iam: { enabled: false },
    },
  }));
  const options = parseScaffoldArguments([
    '--code', 'sample-app',
    '--target', path.join(os.tmpdir(), 'sample-target-2'),
    '--surfaces', 'flutter',
    '--components', 'iam,rtc',
    '--component-config', configPath,
    '--no-git',
    '--no-install',
  ]);
  assert.deepEqual(options.architectures, ['flutter']);
  assert.equal(options.appType, 'APP_FLUTTER');
  assert.deepEqual(options.components.map((component) => component.id), ['rtc']);
});

test('parseScaffoldArguments rejects invalid architectures and components', () => {
  assert.throws(
    () => parseScaffoldArguments(['--code', 'Sample_App', '--target', 'out']),
    /lower kebab-case/u,
  );
  assert.throws(
    () => parseScaffoldArguments(['--code', 'sample-app', '--target', 'out', '--architectures', 'pc,desktop']),
    /Unknown architecture/u,
  );
  assert.throws(
    () => parseScaffoldArguments(['--code', 'sample-app', '--target', 'out', '--components', 'nope']),
    /Unknown component/u,
  );
});

test('template registry self-check renders every template for every architecture', () => {
  const result = selfCheck(SCAFFOLD_ROOT);
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
});

test('generator creates a verified repository with PC/H5 and linked components', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const options = makeOptions(target);
  const result = generate(options);
  assert.ok(result.written.length > 60);
  assert.ok(fs.existsSync(path.join(target, SCAFFOLD_MARKER)));
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-pc', 'src', 'App.tsx')));
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-h5', 'src', 'App.tsx')));
  assert.ok(fs.existsSync(path.join(target, 'docs', 'components', 'README.md')));
  assert.ok(fs.existsSync(path.join(target, 'specs', 'components.selected.json')));

  const clients = fs.readFileSync(path.join(target, 'apps', 'sdkwork-sample-app-pc', 'src', 'composition', 'sdkClients.ts'), 'utf8');
  assert.match(clients, /@sdkwork\/iam-app-sdk/u);
  assert.match(clients, /createIntegratedSdkClients/u);

  const verification = verifyGeneratedRepository(target, options);
  assert.deepEqual(verification.issues, []);
  assert.equal(verification.ok, true);

  const manifest = JSON.parse(fs.readFileSync(path.join(target, 'agent.app.config.json'), 'utf8'));
  assert.equal(manifest.app.key, 'sdkwork-sample-app');
  assert.deepEqual(manifest.metadata.scaffold.architectures, ['pc', 'h5']);
  assert.deepEqual(manifest.metadata.scaffold.components, ['iam', 'appbase']);
});

test('every registered architecture can be generated independently', (t) => {
  for (const architectureId of Object.keys(ARCHITECTURES)) {
    const target = makeTempDirectory();
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    const options = makeOptions(target, {
      architectures: [architectureId],
      surfaces: [architectureId],
      appType: architectureId === 'flutter'
        ? 'APP_FLUTTER'
        : architectureId === 'harmony'
          ? 'APP_HARMONY'
          : architectureId === 'mini-program'
            ? 'APP_UNIAPP'
            : 'APP_REACT',
    });
    generate(options);
    const verification = verifyGeneratedRepository(target, options);
    assert.deepEqual(verification.issues, [], `${architectureId}: ${verification.issues.join('; ')}`);
    assert.equal(verification.ok, true, architectureId);
  }
});

test('generator honors a web architecture subset and component config', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const options = makeOptions(target, {
    architectures: ['pc'],
    surfaces: ['pc'],
    components: [{ id: 'iam' }, { id: 'order', config: { currency: 'USD' } }],
  });
  generate(options);
  assert.ok(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-pc')));
  assert.equal(fs.existsSync(path.join(target, 'apps', 'sdkwork-sample-app-h5')), false);

  const config = JSON.parse(fs.readFileSync(path.join(target, 'config', 'components', 'order.json'), 'utf8'));
  assert.equal(config.config.currency, 'USD');
  assert.equal(verifyGeneratedRepository(target, options).ok, true);
});

test('all registered components can be scaffolded on one web root', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const options = makeOptions(target, {
    architectures: ['pc'],
    surfaces: ['pc'],
    components: Object.keys(COMPONENTS).map((id) => ({ id })),
  });
  generate(options);
  const selection = JSON.parse(fs.readFileSync(path.join(target, 'specs', 'components.selected.json'), 'utf8'));
  assert.equal(selection.components.length, Object.keys(COMPONENTS).length);
  assert.ok(selection.components.some((component) => component.id === 'iam'));
  assert.ok(selection.components.some((component) => component.id === 'order'));
  assert.equal(verifyGeneratedRepository(target, options).ok, true);
});

test('unsupported component language is recorded instead of generated as linked code', (t) => {
  const target = makeTempDirectory();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const options = makeOptions(target, {
    architectures: ['ios'],
    surfaces: ['ios'],
    appType: 'APP_REACT',
    components: [{ id: 'order' }],
  });
  generate(options);
  const selection = JSON.parse(fs.readFileSync(path.join(target, 'specs', 'components.selected.json'), 'utf8'));
  assert.equal(selection.components[0].architectures.ios.supported, false);
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
  generate(makeOptions(target, { architectures: ['h5'], surfaces: ['h5'] }));

  const offenders = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      if (/\.(?:png|jpe?g)$/iu.test(entry.name)) continue;
      const text = fs.readFileSync(absolute, 'utf8');
      if (/__[A-Z][A-Z0-9_]*__/u.test(text)) offenders.push(absolute);
    }
  }
  walk(target);
  assert.deepEqual(offenders, []);
});
