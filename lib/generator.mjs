import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  SCAFFOLD_VERSION,
  TEMPLATE_GROUPS,
  resolveSurface,
} from '../scaffold.config.mjs';
import { createScaffoldIcon } from './icon.mjs';
import {
  applicationRootName,
  applicationRootPath,
  upperSnake,
} from './naming.mjs';
import { copyTemplateGroup } from './template.mjs';

const IGNORED_EXISTING_ENTRIES = new Set(['.git', '.DS_Store']);
const SCAFFOLD_MARKER = '.sdkwork/scaffold.json';

export function findSpecsDirectory({ explicit, target, scaffoldRoot }) {
  const candidates = [
    explicit,
    path.resolve(path.dirname(target), 'sdkwork-specs'),
    path.resolve(scaffoldRoot, '..', 'sdkwork-specs'),
    path.resolve(target, '..', 'sdkwork-specs'),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export function createVariables({ options, specsDirectory, generatedAt }) {
  const surfaceTable = options.surfaces.map((id) => {
    const surface = resolveSurface(id);
    return `- [${applicationRootName(options.code, id)}](apps/${applicationRootName(options.code, id)}/) — ${surface.title}: ${surface.description}`;
  }).join('\n');
  const variables = {
    APP_CODE: options.code,
    APP_NAME: options.name,
    APP_OWNER: options.owner,
    APP_DOMAIN: options.domain,
    APP_DESCRIPTION: options.description,
    APP_TYPE: options.appType,
    APP_SITE_URL: options.siteUrl,
    APP_ROOT_PACKAGE: `sdkwork-${options.code}`,
    APP_IDENTIFIER: `com.sdkwork.${options.code.replaceAll('-', '')}`,
    APP_INITIALS: options.code
      .split('-')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join(''),
    APP_YEAR: String(new Date(generatedAt).getUTCFullYear()),
    GENERATED_AT: generatedAt,
    GENERATED_DATE: generatedAt.slice(0, 10),
    GENERATOR_VERSION: SCAFFOLD_VERSION,
    SELECTED_SURFACES: options.surfaces.join(', '),
    SELECTED_SURFACES_CSV: options.surfaces.join(','),
    SURFACE_LIST_JSON: JSON.stringify(options.surfaces),
    APP_SURFACE_TABLE: surfaceTable,
    APP_SURFACE_COUNT: String(options.surfaces.length),
    SPECS_REL: specsDirectory
      ? path.relative(options.target, specsDirectory).replaceAll('\\', '/') || '.'
      : '../sdkwork-specs',
    SPECS_AVAILABLE: specsDirectory ? 'true' : 'false',
  };
  variables.SPECS_TOOLS_REL = variables.SPECS_REL === '.'
    ? './tools'
    : `${variables.SPECS_REL}/tools`;

  for (const id of options.surfaces) {
    const surface = resolveSurface(id);
    const upper = upperSnake(id);
    variables[`SURFACE_${upper}`] = id;
  }
  return variables;
}

export function createSurfaceVariables(options, surface, rootVariables) {
  const variables = {
    ...rootVariables,
    SURFACE: surface.id,
    SURFACE_TITLE: surface.title,
    SURFACE_UPPER: upperSnake(surface.id),
    SURFACE_PORT: String(surface.devPort),
    SURFACE_COMPONENT_TYPE: surface.componentType,
    SURFACE_ARCHITECTURE_SPEC: surface.architectureSpec,
    SURFACE_UI_SPEC: surface.uiSpec,
    APP_PACKAGE_NAME: applicationRootName(options.code, surface.id),
    APP_ROOT_REL: applicationRootPath(options.code, surface.id),
  };
  variables.SPECS_REL_FROM_APP = path
    .relative(path.join(options.target, variables.APP_ROOT_REL), path.resolve(
      options.target,
      rootVariables.SPECS_REL,
    ))
    .replaceAll('\\', '/');
  return variables;
}

export function planGeneration({ options, scaffoldRoot, specsDirectory }) {
  const plan = [];
  for (const group of TEMPLATE_GROUPS) {
    const templateDirectory = path.join(scaffoldRoot, 'templates', group.template);
    if (!fs.existsSync(templateDirectory)) {
      throw new Error(`Template group "${group.id}" is missing directory ${templateDirectory}`);
    }
    if (group.perSurface) {
      for (const surfaceId of options.surfaces) {
        const surface = resolveSurface(surfaceId);
        const target = group.target
          .replaceAll('__APP_CODE__', options.code)
          .replaceAll('__SURFACE__', surface.id);
        plan.push({
          group: group.id,
          surface: surface.id,
          templateDirectory,
          target,
        });
      }
    } else {
      plan.push({
        group: group.id,
        surface: null,
        templateDirectory,
        target: group.target,
      });
    }
  }
  if (!specsDirectory) {
    plan.push({
      group: 'warning',
      warning: `sdkwork-specs was not found. Generated scripts keep the path "${'../sdkwork-specs'}"; pass --specs to pin it.`,
    });
  }
  return plan;
}

export function targetHasContent(target) {
  if (!fs.existsSync(target)) return false;
  if (!fs.statSync(target).isDirectory()) {
    throw new Error(`Target exists and is not a directory: ${target}`);
  }
  return fs.readdirSync(target).some((entry) => !IGNORED_EXISTING_ENTRIES.has(entry));
}

export function hasScaffoldMarker(target) {
  return fs.existsSync(path.join(target, SCAFFOLD_MARKER));
}

export function assertWritableTarget(options) {
  if (!targetHasContent(options.target)) return;
  if (!options.force) {
    throw new Error(
      `Target is not empty: ${options.target}. Choose an empty directory or pass --force for a scaffold-managed directory.`,
    );
  }
  if (!hasScaffoldMarker(options.target)) {
    throw new Error(
      `Refusing --force on an unrecognized directory: ${options.target}. The ${SCAFFOLD_MARKER} marker is required.`,
    );
  }
}

export function writeScaffoldIcon(target) {
  const iconPath = path.join(target, 'assets', 'media', 'icons', 'icon-1024.png');
  fs.mkdirSync(path.dirname(iconPath), { recursive: true });
  fs.writeFileSync(iconPath, createScaffoldIcon());
  return iconPath;
}

export function patchManifestIconSize(target, iconPath) {
  const manifestPath = path.join(target, 'agent.app.config.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/u, ''));
  const primary = manifest?.media?.icons?.primary;
  if (!primary || typeof primary !== 'object') return false;
  primary.fileSizeBytes = fs.statSync(iconPath).size;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return true;
}

export function writeScaffoldMarker(options, { generatedAt }) {
  const markerPath = path.join(options.target, SCAFFOLD_MARKER);
  const marker = {
    schemaVersion: 1,
    kind: 'sdkwork.scaffold.instance',
    generator: 'sdkwork-scaffold',
    generatorVersion: SCAFFOLD_VERSION,
    generatedAt,
    application: {
      code: options.code,
      name: options.name,
      owner: options.owner,
      domain: options.domain,
      appType: options.appType,
      surfaces: options.surfaces,
    },
  };
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
}

function run(command, args, cwd, shell = undefined) {
  try {
    execFileSync(command, args, {
      cwd,
      stdio: 'inherit',
      shell: shell ?? (process.platform === 'win32' && command === 'pnpm'),
    });
    return true;
  } catch {
    return false;
  }
}

export function initializeGit(target) {
  if (fs.existsSync(path.join(target, '.git'))) {
    return { initialized: false, reason: 'already a git repository' };
  }
  return {
    initialized: run('git', ['init', '-b', 'main'], target),
    reason: 'git init -b main',
  };
}

export function installDependencies(target) {
  const execpath = process.env.npm_execpath;
  const installed = execpath && /\.(?:cjs|mjs|js)$/iu.test(execpath)
    ? run(process.execPath, [execpath, 'install', '--no-frozen-lockfile'], target, false)
    : execpath
      ? run(execpath, ['install', '--no-frozen-lockfile'], target, false)
      : run('pnpm', ['install', '--no-frozen-lockfile'], target);
  return {
    installed,
    command: 'pnpm install --no-frozen-lockfile',
  };
}

/**
 * Run the canonical sdkwork-specs bootstraps that are safe for a fresh
 * repository. They are optional when sdkwork-specs is absent so the scaffold
 * still works as a standalone generator.
 */
export function applySpecsAutomation({ target, specsDirectory, code, appType, surfaces }) {
  if (!specsDirectory) return { applied: false, reason: 'sdkwork-specs not found' };
  const specsTools = path.join(specsDirectory, 'tools');
  const results = [];

  results.push({
    step: 'repository-docs',
    ok: run('node', [
      path.join(specsTools, 'bootstrap-repository-docs.mjs'),
      '--root', target,
      '--application-code', code,
      '--owner', 'sdkwork-platform',
    ], target),
  });

  results.push({
    step: 'app-assets',
    ok: run('node', [
      path.join(specsTools, 'bootstrap-app-assets.mjs'),
      '--root', target,
      '--app-type', appType,
    ], target),
  });

  const agentsRoots = [
    target,
    ...surfaces.map((surface) => path.join(target, applicationRootPath(code, surface))),
  ];
  const syncTools = [
    'sync-agent-main-branch-standard.mjs',
    'sync-agent-destructive-operation-standard.mjs',
    'sync-agent-rollback-restriction-standard.mjs',
    'sync-agent-naming-standard.mjs',
    'sync-agent-sdk-generation-standard.mjs',
  ];
  for (const root of agentsRoots) {
    for (const tool of syncTools) {
      const toolPath = path.join(specsTools, tool);
      if (!fs.existsSync(toolPath)) continue;
      results.push({
        step: `${tool.replace('.mjs', '')}@${path.relative(target, root) || '.'}`,
        ok: run('node', [toolPath, '--root', root, '--apply'], target),
      });
    }
  }

  return { applied: true, results };
}

export function generateProject({ options, scaffoldRoot, specsDirectory }) {
  const generatedAt = new Date().toISOString();
  const rootVariables = createVariables({ options, specsDirectory, generatedAt });
  const plan = planGeneration({ options, scaffoldRoot, specsDirectory });
  const operations = plan.filter((entry) => entry.group !== 'warning');

  assertWritableTarget(options);
  fs.mkdirSync(options.target, { recursive: true });

  const written = [];
  for (const operation of operations) {
    const surface = operation.surface ? resolveSurface(operation.surface) : null;
    const variables = surface
      ? createSurfaceVariables(options, surface, rootVariables)
      : rootVariables;
    const targetDirectory = path.join(options.target, operation.target);
    const result = copyTemplateGroup({
      templateDirectory: operation.templateDirectory,
      targetDirectory,
      targetRoot: options.target,
      variables,
      files: [],
    });
    written.push(...result.written);
  }

  writeScaffoldMarker(options, { generatedAt });
  const iconPath = writeScaffoldIcon(options.target);
  patchManifestIconSize(options.target, iconPath);
  written.push(path.relative(options.target, iconPath).replaceAll('\\', '/'));

  const post = {};
  post.specsAutomation = applySpecsAutomation({
    target: options.target,
    specsDirectory,
    code: options.code,
    appType: options.appType,
    surfaces: options.surfaces,
  });
  if (options.initGit) post.git = initializeGit(options.target);
  if (options.install) post.install = installDependencies(options.target);

  return {
    target: options.target,
    generatedAt,
    plan,
    variables: rootVariables,
    written: [...new Set(written)].sort(),
    post,
  };
}

export { SCAFFOLD_MARKER };
