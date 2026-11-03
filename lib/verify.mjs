import fs from 'node:fs';
import path from 'node:path';

import {
  TEMPLATE_GROUPS,
  WEB_SURFACES,
  resolveSurface,
} from '../scaffold.config.mjs';
import { applicationRootName, applicationRootPath } from './naming.mjs';
import { listTemplateFiles, renderTemplateText } from './template.mjs';
import {
  createSurfaceVariables,
  createVariables,
  SCAFFOLD_MARKER,
} from './generator.mjs';

const REQUIRED_ROOT_FILES = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CODEX.md',
  'GEMINI.md',
  '.gitignore',
  '.gitattributes',
  'package.json',
  'pnpm-workspace.yaml',
  'agent.app.config.json',
  'tsconfig.base.json',
  '.sdkwork/README.md',
  '.sdkwork/.gitignore',
  '.sdkwork/skills/README.md',
  '.sdkwork/plugins/README.md',
  'apps/README.md',
  'apis/README.md',
  'crates/README.md',
  'sdks/README.md',
  'jobs/README.md',
  'tools/README.md',
  'plugins/README.md',
  'examples/README.md',
  'etc/README.md',
  'etc/sdkwork.deployment.config.json',
  'etc/topology/standalone.development.env',
  'etc/topology/cloud.development.env',
  'deployments/README.md',
  'scripts/README.md',
  'tests/README.md',
  'docs/README.md',
  'docs/INDEX.yaml',
  'docs/product/prd/PRD.md',
  'docs/architecture/tech/TECH_ARCHITECTURE.md',
  'specs/README.md',
  'specs/component.spec.json',
  'assets/README.md',
  'assets/media/icons/icon-1024.png',
  'scripts/sdkwork-command.mjs',
  'tests/repository-contract.test.mjs',
];

const REQUIRED_APP_FILES = [
  'README.md',
  'AGENTS.md',
  'package.json',
  'index.html',
  'tsconfig.json',
  'vite.config.ts',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/vite-env.d.ts',
  'specs/README.md',
  'specs/component.spec.json',
  '.sdkwork/README.md',
  '.sdkwork/skills/README.md',
  '.sdkwork/plugins/README.md',
];

const REQUIRED_ROOT_SCRIPTS = [
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
];

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', '.sdkwork']);

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file, issues) {
  try {
    return JSON.parse(readText(file).replace(/^\uFEFF/u, ''));
  } catch (error) {
    issues.push(`${file}: invalid JSON (${error.message})`);
    return null;
  }
}

function walkFiles(root, options = {}) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (options.skipSdkwork && entry.name === '.sdkwork') continue;
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name) && !(entry.name === '.sdkwork' && !options.skipSdkwork)) {
          continue;
        }
        walk(path.join(current, entry.name));
      } else if (entry.isFile() && !entry.name.endsWith('.png') && !entry.name.endsWith('.jpg')) {
        files.push(path.join(current, entry.name));
      }
    }
  }
  walk(root);
  return files;
}

export function verifyGeneratedRepository(root, options) {
  const issues = [];
  const files = new Set();

  for (const relativePath of REQUIRED_ROOT_FILES) {
    const absolute = path.join(root, relativePath);
    if (!fs.existsSync(absolute)) issues.push(`missing required file: ${relativePath}`);
    files.add(relativePath);
  }

  for (const surfaceId of options.surfaces) {
    const appRoot = applicationRootPath(options.code, surfaceId);
    for (const relativePath of REQUIRED_APP_FILES) {
      const absolute = path.join(root, appRoot, relativePath);
      if (!fs.existsSync(absolute)) issues.push(`missing required app file: ${appRoot}/${relativePath}`);
      files.add(`${appRoot}/${relativePath}`);
    }
  }

  if (!fs.existsSync(path.join(root, SCAFFOLD_MARKER))) {
    issues.push(`missing scaffold marker: ${SCAFFOLD_MARKER}`);
  }

  const readme = path.join(root, 'README.md');
  if (fs.existsSync(readme) && !/^repository-kind:\s*application$/mu.test(readText(readme))) {
    issues.push('README.md must declare "repository-kind: application"');
  }

  const rootPackage = readJson(path.join(root, 'package.json'), issues);
  for (const script of REQUIRED_ROOT_SCRIPTS) {
    if (typeof rootPackage?.scripts?.[script] !== 'string') {
      issues.push(`package.json: missing root script "${script}"`);
    }
  }

  const manifest = readJson(path.join(root, 'agent.app.config.json'), issues);
  if (manifest?.app?.key !== `sdkwork-${options.code}`) {
    issues.push(`agent.app.config.json: app.key must be "sdkwork-${options.code}"`);
  }
  if (manifest?.app?.appType !== options.appType) {
    issues.push(`agent.app.config.json: app.appType must be "${options.appType}"`);
  }

  const marker = readJson(path.join(root, SCAFFOLD_MARKER), issues);
  if (marker?.generator !== 'sdkwork-scaffold') {
    issues.push(`${SCAFFOLD_MARKER}: generator must be "sdkwork-scaffold"`);
  }

  for (const surfaceId of options.surfaces) {
    const appPackagePath = path.join(root, applicationRootPath(options.code, surfaceId), 'package.json');
    const appPackage = readJson(appPackagePath, issues);
    if (appPackage?.name !== applicationRootName(options.code, surfaceId)) {
      issues.push(
        `${applicationRootPath(options.code, surfaceId)}/package.json: name must be "${applicationRootName(options.code, surfaceId)}"`,
      );
    }
  }

  for (const file of walkFiles(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (relative === SCAFFOLD_MARKER) continue;
    const text = readText(file);
    const unresolved = [...text.matchAll(/__[A-Z][A-Z0-9_]*__/gu)].map((match) => match[0]);
    if (unresolved.length > 0) {
      issues.push(`${relative}: unresolved template variable(s): ${[...new Set(unresolved)].join(', ')}`);
    }
    if (file.endsWith('.json')) readJson(file, issues);
  }

  return { ok: issues.length === 0, issues, checkedFiles: files.size };
}

export function selfCheck(scaffoldRoot) {
  const issues = [];
  const sampleOptions = {
    code: 'sample-app',
    target: path.join(scaffoldRoot, '.sample-target'),
    name: 'Sample App',
    owner: 'sdkwork-platform',
    domain: 'sample',
    description: 'Sample application.',
    appType: 'APP_REACT',
    siteUrl: 'https://sdkwork.com/apps/sdkwork-sample-app',
    surfaces: ['pc', 'h5'],
    specsDirectory: null,
  };
  const generatedAt = new Date().toISOString();
  const rootVariables = createVariables({
    options: sampleOptions,
    specsDirectory: null,
    generatedAt,
  });

  for (const group of TEMPLATE_GROUPS) {
    const groupDirectory = path.join(scaffoldRoot, 'templates', group.template);
    if (!fs.existsSync(groupDirectory)) {
      issues.push(`template group "${group.id}" is missing ${groupDirectory}`);
      continue;
    }
    for (const file of listTemplateFiles(groupDirectory)) {
      if (group.perSurface) {
        for (const surfaceId of Object.keys(WEB_SURFACES)) {
          const variables = createSurfaceVariables(
            sampleOptions,
            resolveSurface(surfaceId),
            rootVariables,
          );
          try {
            renderTemplateText(readText(path.join(groupDirectory, file)), variables, file);
          } catch (error) {
            issues.push(error.message);
          }
        }
      } else {
        try {
          renderTemplateText(readText(path.join(groupDirectory, file)), rootVariables, file);
        } catch (error) {
          issues.push(error.message);
        }
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
