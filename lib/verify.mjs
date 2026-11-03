import fs from 'node:fs';
import path from 'node:path';

import {
  ARCHITECTURES,
  TEMPLATE_GROUPS,
  resolveArchitecture,
} from '../scaffold.config.mjs';
import {
  androidNamespace,
  applicationRootName,
  applicationRootPath,
} from './naming.mjs';
import { listTemplateFiles, renderTemplateText } from './template.mjs';
import {
  createArchitectureVariables,
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
  'specs/components.selected.json',
  'assets/README.md',
  'assets/media/icons/icon-1024.png',
  'scripts/sdkwork-command.mjs',
  'tests/repository-contract.test.mjs',
  'docs/components/README.md',
];

const COMMON_APP_FILES = [
  'README.md',
  'AGENTS.md',
  'package.json',
  'specs/README.md',
  'specs/component.spec.json',
  'specs/integration.plan.json',
  '.sdkwork/README.md',
  '.sdkwork/skills/README.md',
  '.sdkwork/plugins/README.md',
  'config/components',
];

const APP_FILES_BY_KIND = {
  web: [
    'index.html',
    'tsconfig.json',
    'vite.config.ts',
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/vite-env.d.ts',
    'src/composition/components.ts',
    'src/composition/sdkClients.ts',
  ],
  'mini-program': [
    'project.config.json',
    'tsconfig.json',
    'src/app.json',
    'src/app.ts',
    'src/pages/index/index.ts',
    'src/pages/index/index.wxml',
    'src/composition/components.ts',
    'src/composition/architectures.ts',
  ],
  flutter: [
    'pubspec.yaml',
    'analysis_options.yaml',
    'lib/main.dart',
    'lib/app.dart',
    'lib/theme/app_theme.dart',
    'lib/composition/component_registry.dart',
    'lib/composition/architecture_registry.dart',
    'test/widget_test.dart',
  ],
  ios: [
    'Package.swift',
    'App/App.swift',
    'App/ContentView.swift',
    'App/Bootstrap/ComponentRegistry.swift',
    'App/Bootstrap/ArchitectureRegistry.swift',
  ],
  android: [
    'settings.gradle.kts',
    'build.gradle.kts',
    'app/build.gradle.kts',
    'app/src/main/AndroidManifest.xml',
    'app/src/main/kotlin/__ANDROID_NAMESPACE__/MainActivity.kt',
    'app/src/main/kotlin/__ANDROID_NAMESPACE__/bootstrap/ComponentRegistry.kt',
    'app/src/main/kotlin/__ANDROID_NAMESPACE__/bootstrap/ArchitectureRegistry.kt',
  ],
  harmony: [
    'oh-package.json5',
    'build-profile.json5',
    'entry/src/main/module.json5',
    'entry/src/main/ets/pages/Index.ets',
    'entry/src/main/ets/composition/ComponentRegistry.ets',
    'entry/src/main/ets/composition/ArchitectureRegistry.ets',
  ],
};

const MOBILE_TABBAR_MARKERS = {
  h5: ['src/App.tsx', 'scaffold-bottom-tabs'],
  'mini-program': ['src/pages/index/index.wxml', 'tabbar'],
  flutter: ['lib/app.dart', 'NavigationBar'],
  ios: ['App/ContentView.swift', 'TabView'],
  android: ['app/src/main/kotlin/__ANDROID_NAMESPACE__/MainActivity.kt', 'NavigationBar'],
  harmony: ['entry/src/main/ets/pages/Index.ets', 'Tabs('],
};

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

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist']);

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

function walkFiles(root) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        walk(path.join(current, entry.name));
      } else if (entry.isFile() && !/\.(?:png|jpe?g|webp|ico)$/iu.test(entry.name)) {
        files.push(path.join(current, entry.name));
      }
    }
  }
  walk(root);
  return files;
}

function expectedAndroidFiles(code) {
  const namespacePath = androidNamespace(code).replaceAll('.', '/');
  return APP_FILES_BY_KIND.android.map((file) => (
    file.includes('__ANDROID_NAMESPACE__')
      ? file.replace('__ANDROID_NAMESPACE__', namespacePath)
      : file
  ));
}

export function verifyGeneratedRepository(root, options) {
  const issues = [];
  const files = new Set();

  for (const relativePath of REQUIRED_ROOT_FILES) {
    const absolute = path.join(root, relativePath);
    if (!fs.existsSync(absolute)) issues.push(`missing required file: ${relativePath}`);
    files.add(relativePath);
  }

  for (const architectureId of options.architectures) {
    const architecture = resolveArchitecture(architectureId);
    const appRoot = applicationRootPath(options.code, architecture);
    const expectedFiles = [
      ...COMMON_APP_FILES,
      ...(architecture.kind === 'android' ? expectedAndroidFiles(options.code) : APP_FILES_BY_KIND[architecture.kind] ?? []),
    ];
    for (const relativePath of expectedFiles) {
      const absolute = path.join(root, appRoot, relativePath);
      if (relativePath === 'config/components') {
        if (!fs.existsSync(absolute)) issues.push(`missing required app directory: ${appRoot}/${relativePath}`);
        continue;
      }
      if (!fs.existsSync(absolute)) issues.push(`missing required app file: ${appRoot}/${relativePath}`);
      files.add(`${appRoot}/${relativePath}`);
    }

    const tabbarMarker = MOBILE_TABBAR_MARKERS[architectureId];
    if (tabbarMarker) {
      const [relativePath, marker] = tabbarMarker;
      const absolute = path.join(
        root,
        appRoot,
        relativePath.replace('__ANDROID_NAMESPACE__', androidNamespace(options.code).replaceAll('.', '/')),
      );
      if (fs.existsSync(absolute) && !readText(absolute).includes(marker)) {
        issues.push(`${appRoot}/${relativePath}: missing mobile bottom tabbar marker "${marker}"`);
      }
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
  if (JSON.stringify(manifest?.metadata?.scaffold?.architectures) !== JSON.stringify(options.architectures)) {
    issues.push('agent.app.config.json: metadata.scaffold.architectures must match the generated architectures');
  }
  if (JSON.stringify(manifest?.metadata?.scaffold?.components) !== JSON.stringify(options.components.map((component) => component.id))) {
    issues.push('agent.app.config.json: metadata.scaffold.components must match the selected components');
  }

  const marker = readJson(path.join(root, SCAFFOLD_MARKER), issues);
  if (marker?.generator !== 'sdkwork-scaffold') {
    issues.push(`${SCAFFOLD_MARKER}: generator must be "sdkwork-scaffold"`);
  }

  for (const architectureId of options.architectures) {
    const architecture = resolveArchitecture(architectureId);
    const appPackagePath = path.join(root, applicationRootPath(options.code, architecture), 'package.json');
    const appPackage = readJson(appPackagePath, issues);
    if (appPackage?.name !== applicationRootName(options.code, architecture)) {
      issues.push(
        `${applicationRootPath(options.code, architecture)}/package.json: name must be "${applicationRootName(options.code, architecture)}"`,
      );
    }
  }

  for (const component of options.components) {
    for (const architectureId of options.architectures) {
      const architecture = resolveArchitecture(architectureId);
      const file = path.join(root, applicationRootPath(options.code, architecture), 'config/components', `${component.id}.json`);
      if (!fs.existsSync(file)) {
        issues.push(`missing component config: ${path.relative(root, file).replaceAll('\\', '/')}`);
      }
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
    architectures: Object.keys(ARCHITECTURES),
    components: [],
    componentMode: 'linked',
    workspace: path.dirname(scaffoldRoot),
    specsDirectory: null,
  };
  const generatedAt = new Date().toISOString();
  const placeholderComponents = [{
    id: 'sample',
    title: 'Sample',
    category: 'foundation',
    repo: 'sdkwork-sample',
    kind: 'sdk',
    sdkFamily: 'sdkwork-sample-app-sdk',
    permissionModuleId: 'sample',
    description: 'Sample component.',
    permissions: [],
    selectedConfig: {},
    architectures: {},
  }];
  const rootVariables = createVariables({
    options: sampleOptions,
    specsDirectory: null,
    generatedAt,
    components: placeholderComponents,
  });

  for (const group of TEMPLATE_GROUPS) {
    const groupDirectory = path.join(scaffoldRoot, 'templates', group.template);
    if (!fs.existsSync(groupDirectory)) {
      issues.push(`template group "${group.id}" is missing ${groupDirectory}`);
      continue;
    }
    for (const file of listTemplateFiles(groupDirectory)) {
      if (group.architectures) {
        for (const architectureId of group.architectures) {
          const variables = createArchitectureVariables(
            sampleOptions,
            resolveArchitecture(architectureId),
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
