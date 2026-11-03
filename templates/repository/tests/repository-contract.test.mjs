import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_CODE = '__APP_CODE__';
const APP_TYPE = '__APP_TYPE__';
const EXPECTED_ARCHITECTURES = __ARCHITECTURE_LIST_JSON__;
const ARCHITECTURE_ROOTS = __ARCHITECTURE_ROOTS_JSON__;
const EXPECTED_COMPONENTS = __COMPONENT_LIST_JSON__;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/^\uFEFF/u, ''));
}

test('repository declares the SDKWork application identity', () => {
  const manifest = readJson('agent.app.config.json');
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.kind, 'agent.app');
  assert.equal(manifest.app.key, `sdkwork-${APP_CODE}`);
  assert.equal(manifest.app.appType, APP_TYPE);
  assert.deepEqual(manifest.metadata.scaffold.architectures, EXPECTED_ARCHITECTURES);
  assert.deepEqual(manifest.metadata.scaffold.components, EXPECTED_COMPONENTS);
  assert.equal(manifest.metadata.deploymentConfig, 'etc/sdkwork.deployment.config.json');
});

test('README declares an application repository', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.match(readme, /^repository-kind: application$/mu);
});

test('all generated architecture roots are registered pnpm workspace packages', () => {
  const workspace = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  assert.match(workspace, /apps\/\*/u);
  for (const architecture of ARCHITECTURE_ROOTS) {
    const appRoot = path.join(ROOT, architecture.root);
    const manifest = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
    assert.equal(manifest.name, architecture.packageName);
    assert.ok(fs.existsSync(path.join(appRoot, 'specs', 'component.spec.json')));
    assert.ok(fs.existsSync(path.join(appRoot, 'AGENTS.md')));
  }
});

test('component selection resolves into app-level configuration', () => {
  const selection = readJson('specs/components.selected.json');
  assert.deepEqual(selection.architectures, EXPECTED_ARCHITECTURES);
  assert.deepEqual(selection.components.map((component) => component.id), EXPECTED_COMPONENTS);
  for (const architecture of ARCHITECTURE_ROOTS) {
    for (const componentId of EXPECTED_COMPONENTS) {
      const configPath = path.join(ROOT, architecture.root, 'config', 'components', `${componentId}.json`);
      assert.ok(fs.existsSync(configPath), `missing ${configPath}`);
    }
  }
});

test('standard root command surface is complete', () => {
  const manifest = readJson('package.json');
  for (const script of [
    'dev',
    'dev:standalone',
    'dev:cloud',
    'stop',
    'build',
    'test',
    'check',
    'verify',
    'clean',
    'api:assembly:materialize',
    'api:assembly:validate',
  ]) {
    assert.equal(typeof manifest.scripts[script], 'string', `missing script ${script}`);
  }
  assert.equal(manifest.scripts.dev, 'pnpm dev:standalone');
});

test('Canon documentation exists', () => {
  for (const relativePath of [
    'docs/README.md',
    'docs/product/prd/PRD.md',
    'docs/architecture/tech/TECH_ARCHITECTURE.md',
    'docs/INDEX.yaml',
    'docs/components/README.md',
    'specs/component.spec.json',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, relativePath)), `missing ${relativePath}`);
  }
});
