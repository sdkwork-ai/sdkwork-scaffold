import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  ARCHITECTURES,
  SCAFFOLD_VERSION,
  TEMPLATE_GROUPS,
  resolveArchitecture,
} from '../scaffold.config.mjs';
import { resolveComponents } from './components.mjs';
import { writeComponentIntegration } from './composition.mjs';
import { createScaffoldIcon } from './icon.mjs';
import {
  androidNamespace,
  applicationRootName,
  applicationRootPath,
  appIdentifier,
  dartPackageName,
  harmonyBundleName,
  iosModuleName,
  snakeCase,
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

function architectureTable(architectures) {
  return architectures.map((id) => {
    const architecture = resolveArchitecture(id);
    return `- \`${id}\` — ${architecture.title}: ${architecture.description}`;
  }).join('\n');
}

function architectureListJson(architectures) {
  return JSON.stringify(architectures);
}

export function createVariables({ options, specsDirectory, generatedAt, components }) {
  const primary = resolveArchitecture(options.architectures[0]);
  const publishPlatforms = [...new Set(options.architectures.flatMap((id) => resolveArchitecture(id).publishPlatforms))];
  const languages = [...new Set(options.architectures.flatMap((id) => {
    const architecture = resolveArchitecture(id);
    if (architecture.kind === 'web') return ['typescript', 'react'];
    if (architecture.kind === 'mini-program') return ['typescript'];
    if (architecture.kind === 'flutter') return ['dart'];
    if (architecture.kind === 'ios') return ['swift'];
    if (architecture.kind === 'android') return ['kotlin'];
    if (architecture.kind === 'harmony') return ['arkts'];
    return [];
  }))];
  const variables = {
    APP_CODE: options.code,
    APP_NAME: options.name,
    APP_OWNER: options.owner,
    APP_DOMAIN: options.domain,
    APP_DESCRIPTION: options.description,
    APP_TYPE: options.appType,
    APP_SITE_URL: options.siteUrl,
    APP_ROOT_PACKAGE: `sdkwork-${options.code}`,
    APP_IDENTIFIER: appIdentifier(options.code),
    APP_INITIALS: options.code
      .split('-')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join(''),
    APP_YEAR: String(new Date(generatedAt).getUTCFullYear()),
    GENERATED_AT: generatedAt,
    GENERATED_DATE: generatedAt.slice(0, 10),
    GENERATOR_VERSION: SCAFFOLD_VERSION,
    ARCHITECTURES: options.architectures.join(', '),
    ARCHITECTURES_CSV: options.architectures.join(','),
    ARCHITECTURE_COUNT: String(options.architectures.length),
    ARCHITECTURE_LIST_JSON: architectureListJson(options.architectures),
    ARCHITECTURE_TABLE: architectureTable(options.architectures),
    PRIMARY_ARCHITECTURE: primary.id,
    RUNTIME_FAMILY: primary.runtime.family,
    RUNTIME_FRAMEWORK: primary.runtime.framework,
    DEFAULT_PLATFORM: primary.runtime.defaultPlatform,
    DEFAULT_ARCHITECTURE: primary.runtime.defaultArchitecture,
    PUBLISH_PLATFORMS_JSON: JSON.stringify(publishPlatforms),
    INSTALL_PLATFORMS_JSON: JSON.stringify(publishPlatforms),
    COMPONENT_COUNT: String(components.length),
    COMPONENT_IDS: components.map((component) => component.id).join(', '),
    COMPONENT_IDS_CSV: components.map((component) => component.id).join(','),
    COMPONENT_LIST_JSON: JSON.stringify(components.map((component) => component.id)),
    APP_LANGUAGES_JSON: JSON.stringify(languages),
    ARCHITECTURE_ROOTS_JSON: JSON.stringify(options.architectures.map((id) => {
      const architecture = resolveArchitecture(id);
      return {
        id,
        title: architecture.title,
        suffix: architecture.suffix,
        root: applicationRootPath(options.code, architecture),
        packageName: applicationRootName(options.code, architecture),
        kind: architecture.kind,
      };
    })),
    SPECS_REL: specsDirectory
      ? path.relative(options.target, specsDirectory).replaceAll('\\', '/') || '.'
      : '../sdkwork-specs',
    SPECS_AVAILABLE: specsDirectory ? 'true' : 'false',
    SPECS_TOOLS_REL: '',
  };
  variables.SPECS_TOOLS_REL = variables.SPECS_REL === '.'
    ? './tools'
    : `${variables.SPECS_REL}/tools`;
  return variables;
}

export function createArchitectureVariables(options, architecture, rootVariables) {
  const appRoot = applicationRootPath(options.code, architecture);
  const variables = {
    ...rootVariables,
    SURFACE: architecture.id,
    ARCH: architecture.id,
    ARCH_TITLE: architecture.title,
    ARCH_KIND: architecture.kind,
    ARCH_SUFFIX: architecture.suffix,
    SURFACE_TITLE: architecture.title,
    SURFACE_PORT: String(architecture.devPort ?? 0),
    SURFACE_COMPONENT_TYPE: architecture.componentType,
    SURFACE_ARCHITECTURE_SPEC: architecture.architectureSpec,
    SURFACE_UI_SPEC: architecture.uiSpec,
    APP_PACKAGE_NAME: applicationRootName(options.code, architecture),
    APP_ROOT_REL: appRoot,
    DART_PACKAGE_NAME: architecture.kind === 'flutter' ? dartPackageName(options.code, architecture) : '',
    ANDROID_NAMESPACE: androidNamespace(options.code),
    ANDROID_NAMESPACE_PATH: androidNamespace(options.code).replaceAll('.', '/'),
    IOS_MODULE_NAME: iosModuleName(options.code),
    HARMONY_BUNDLE_NAME: harmonyBundleName(options.code),
    FLUTTER_COMMON_REL: path
      .relative(
        path.join(options.target, appRoot),
        path.join(options.workspace, 'sdkwork-sdk-commons', 'sdkwork-sdk-common-flutter'),
      )
      .replaceAll('\\', '/'),
    SNAKE_APP_CODE: snakeCase(options.code),
    RUNTIME_FAMILY: architecture.runtime.family,
    RUNTIME_FRAMEWORK: architecture.runtime.framework,
    DEFAULT_PLATFORM: architecture.runtime.defaultPlatform,
    DEFAULT_ARCHITECTURE: architecture.runtime.defaultArchitecture,
    PUBLISH_PLATFORMS_JSON: JSON.stringify(architecture.publishPlatforms),
    INSTALL_PLATFORMS_JSON: JSON.stringify(architecture.publishPlatforms),
  };
  variables.SPECS_REL_FROM_APP = path
    .relative(path.join(options.target, appRoot), path.resolve(options.target, rootVariables.SPECS_REL))
    .replaceAll('\\', '/');
  variables.SPECS_REL_FROM_APP = variables.SPECS_REL_FROM_APP || '.';
  return variables;
}

export function planGeneration({ options, scaffoldRoot }) {
  const plan = [];
  for (const group of TEMPLATE_GROUPS) {
    const templateDirectory = path.join(scaffoldRoot, 'templates', group.template);
    if (!fs.existsSync(templateDirectory)) {
      throw new Error(`Template group "${group.id}" is missing directory ${templateDirectory}`);
    }
    if (group.architectures) {
      for (const architectureId of options.architectures) {
        if (!group.architectures.includes(architectureId)) continue;
        const architecture = resolveArchitecture(architectureId);
        plan.push({
          group: group.id,
          architecture: architectureId,
          templateDirectory,
          target: group.target.replaceAll('__APP_CODE__', options.code).replaceAll('__ARCH_SUFFIX__', architecture.suffix),
        });
      }
    } else {
      plan.push({
        group: group.id,
        architecture: null,
        templateDirectory,
        target: group.target,
      });
    }
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

export function writeScaffoldMarker(options, { generatedAt, components }) {
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
      architectures: options.architectures,
      surfaces: options.architectures,
      components: components.map((component) => component.id),
      componentMode: options.componentMode,
    },
  };
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
}

function run(command, args, cwd, shell = undefined, quiet = false) {
  try {
    execFileSync(command, args, {
      cwd,
      stdio: quiet ? 'ignore' : 'inherit',
      shell: shell ?? (process.platform === 'win32' && command === 'pnpm'),
    });
    return true;
  } catch {
    return false;
  }
}

export function initializeGit(target, quiet = false) {
  if (fs.existsSync(path.join(target, '.git'))) {
    return { initialized: false, reason: 'already a git repository' };
  }
  return {
    initialized: run('git', ['init', '-b', 'main'], target, undefined, quiet),
    reason: 'git init -b main',
  };
}

export function installDependencies(target, quiet = false) {
  const execpath = process.env.npm_execpath;
  const installed = execpath && /\.(?:cjs|mjs|js)$/iu.test(execpath)
    ? run(process.execPath, [execpath, 'install', '--no-frozen-lockfile'], target, false, quiet)
    : execpath
      ? run(execpath, ['install', '--no-frozen-lockfile'], target, false, quiet)
      : run('pnpm', ['install', '--no-frozen-lockfile'], target, undefined, quiet);
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
export function applySpecsAutomation({ target, specsDirectory, code, appType, architectures, quiet = false }) {
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
    ], target, undefined, quiet),
  });

  results.push({
    step: 'app-assets',
    ok: run('node', [
      path.join(specsTools, 'bootstrap-app-assets.mjs'),
      '--root', target,
      '--app-type', appType,
      '--force',
    ], target, undefined, quiet),
  });

  const agentsRoots = [
    target,
    ...architectures.map((id) => path.join(target, applicationRootPath(code, resolveArchitecture(id)))),
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
      const step = `${tool.replace('.mjs', '')}@${path.relative(target, root) || '.'}`;
      // The sync tools exit 1 after a successful update because their exit
      // status reports "outdated before this run", not "apply failed".
      // Re-run with --check so the recorded result describes the final state.
      run('node', [toolPath, '--root', root, '--apply'], target, undefined, quiet);
      results.push({
        step,
        ok: run('node', [toolPath, '--root', root, '--check'], target, undefined, quiet),
      });
    }
  }

  return { applied: true, results };
}

export function generateProject({ options, scaffoldRoot, specsDirectory }) {
  const generatedAt = new Date().toISOString();
  const resolved = resolveComponents({
    workspace: options.workspace,
    target: options.target,
    selectedComponents: options.components,
    architectures: options.architectures,
    mode: options.componentMode,
  });
  if (resolved.issues.length > 0) {
    throw new Error(`Component resolution failed:\n- ${resolved.issues.join('\n- ')}`);
  }

  const rootVariables = createVariables({
    options,
    specsDirectory,
    generatedAt,
    components: resolved.components,
  });
  const plan = planGeneration({ options, scaffoldRoot });

  assertWritableTarget(options);
  fs.mkdirSync(options.target, { recursive: true });

  const written = [];
  for (const operation of plan) {
    const architecture = operation.architecture
      ? resolveArchitecture(operation.architecture)
      : null;
    const variables = architecture
      ? createArchitectureVariables(options, architecture, rootVariables)
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

  written.push(...writeComponentIntegration({
    target: options.target,
    options,
    components: resolved.components,
    architectures: options.architectures,
    generatedAt,
  }));

  writeScaffoldMarker(options, { generatedAt, components: resolved.components });
  const iconPath = writeScaffoldIcon(options.target);
  patchManifestIconSize(options.target, iconPath);
  written.push(path.relative(options.target, iconPath).replaceAll('\\', '/'));

  const post = {};
  post.specsAutomation = applySpecsAutomation({
    target: options.target,
    specsDirectory,
    code: options.code,
    appType: options.appType,
    architectures: options.architectures,
    quiet: Boolean(options.quiet),
  });
  if (options.initGit) post.git = initializeGit(options.target, Boolean(options.quiet));
  if (options.install) post.install = installDependencies(options.target, Boolean(options.quiet));

  return {
    target: options.target,
    generatedAt,
    plan,
    variables: rootVariables,
    components: resolved.components,
    written: [...new Set(written)].sort(),
    post,
  };
}

export { ARCHITECTURES, SCAFFOLD_MARKER };
