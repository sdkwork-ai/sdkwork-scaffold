import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_CODE = '__APP_CODE__';
const APP_TYPE = '__APP_TYPE__';
const EXPECTED_SURFACES = __SURFACE_LIST_JSON__;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/^\uFEFF/u, ''));
}

test('repository declares the SDKWork application identity', () => {
  const manifest = readJson('agent.app.config.json');
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.kind, 'agent.app');
  assert.equal(manifest.app.key, `sdkwork-${APP_CODE}`);
  assert.equal(manifest.app.appType, APP_TYPE);
  assert.equal(manifest.metadata.deploymentConfig, 'etc/sdkwork.deployment.config.json');
});

test('README declares an application repository', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.match(readme, /^repository-kind: application$/mu);
});

test('all generated web surfaces are registered pnpm workspace packages', () => {
  const workspace = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  assert.match(workspace, /apps\/\*/u);
  for (const surface of EXPECTED_SURFACES) {
    const appRoot = path.join(ROOT, 'apps', `sdkwork-${APP_CODE}-${surface}`);
    const manifest = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
    assert.equal(manifest.name, `sdkwork-${APP_CODE}-${surface}`);
    assert.ok(fs.existsSync(path.join(appRoot, 'src', 'App.tsx')));
    assert.ok(fs.existsSync(path.join(appRoot, 'specs', 'component.spec.json')));
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
    'specs/component.spec.json',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, relativePath)), `missing ${relativePath}`);
  }
});
