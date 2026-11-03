import fs from 'node:fs';
import path from 'node:path';

import { COMPONENTS, resolveComponent } from '../components.config.mjs';
import { resolveArchitecture } from '../scaffold.config.mjs';

const LANGUAGE_BY_ARCHITECTURE = {
  pc: ['typescript'],
  h5: ['typescript'],
  pad: ['typescript'],
  'mini-program': ['typescript'],
  flutter: ['flutter', 'dart'],
  ios: ['swift'],
  android: ['kotlin', 'java'],
  harmony: ['arkts', 'typescript'],
};

const BASE_WORKSPACE_ENTRIES = [
  'sdkwork-sdk-commons/sdkwork-sdk-common-typescript',
  'sdkwork-utils/packages/sdkwork-utils-typescript',
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, ''));
}

function readPackageName(directory) {
  for (const manifestName of ['package.json', 'pubspec.yaml']) {
    const manifestPath = path.join(directory, manifestName);
    if (!fs.existsSync(manifestPath)) continue;
    if (manifestName === 'package.json') {
      try {
        return readJson(manifestPath).name;
      } catch {
        return undefined;
      }
    }
    const match = fs.readFileSync(manifestPath, 'utf8').match(/^name:\s*([^\s#]+)/mu);
    return match?.[1];
  }
  return undefined;
}

function discoverLanguageEntry(familyRoot, familyName, language) {
  const candidates = [`${familyName}-${language}`];
  if (language === 'dart') candidates.push(`${familyName}-flutter`);
  if (language === 'flutter') candidates.push(`${familyName}-dart`);
  for (const directoryName of candidates) {
    const directory = path.join(familyRoot, directoryName);
    if (!fs.existsSync(directory)) continue;
    const generated = path.join(directory, 'generated', 'server-openapi');
    const packagePath = fs.existsSync(path.join(generated, 'pubspec.yaml'))
      || fs.existsSync(path.join(generated, 'Package.swift'))
      || fs.existsSync(path.join(generated, 'build.gradle.kts'))
      ? path.join(directoryName, 'generated', 'server-openapi')
      : directoryName;
    const name = language === 'typescript'
      ? readPackageName(directory) ?? readPackageName(path.join(directory, 'generated', 'server-openapi'))
      : readPackageName(path.join(directory, 'generated', 'server-openapi')) ?? readPackageName(directory);
    return {
      language,
      workspace: directoryName,
      packagePath,
      name,
    };
  }
  return undefined;
}

function pickLanguage(manifest, architectureId) {
  const preferred = LANGUAGE_BY_ARCHITECTURE[architectureId] ?? [];
  const languages = Array.isArray(manifest?.languages) ? manifest.languages : [];
  for (const language of preferred) {
    const entry = languages.find((candidate) => candidate.language === language);
    if (entry) return entry;
  }
  const familyRoot = manifest?.__familyRoot;
  if (familyRoot) {
    for (const language of preferred) {
      const entry = discoverLanguageEntry(familyRoot, manifest.sdkFamily, language);
      if (entry) return entry;
    }
  }
  return undefined;
}

function packageNameForLanguage(manifest, language) {
  return language?.consumerPackageName
    ?? language?.name
    ?? (language?.language === 'typescript' ? manifest?.packageName : undefined)
    ?? undefined;
}

function workspacePathForLanguage(componentRoot, manifest, language) {
  const familyRoot = path.join(componentRoot, 'sdks', manifest.sdkFamily);
  if (language?.language !== 'typescript' && language?.packagePath) {
    return path.join(familyRoot, language.packagePath);
  }
  if (language?.workspace) {
    return path.join(familyRoot, language.workspace);
  }
  if (language?.packagePath) {
    return path.join(familyRoot, language.packagePath);
  }
  return undefined;
}

function sdkFacadeSource(absolutePath) {
  const sources = [];
  for (const relative of ['src/index.ts', 'generated/server-openapi/src/index.ts']) {
    const file = path.join(absolutePath, relative);
    if (fs.existsSync(file)) sources.push(fs.readFileSync(file, 'utf8'));
  }
  return sources.join('\n');
}

function discoverFactory(source) {
  const functionMatch = source.match(/export\s+(?:async\s+)?function\s+(create[A-Za-z0-9_]*Client)\s*\(/u);
  if (functionMatch) return functionMatch[1];
  const exportBlocks = source.match(/export\s*\{[^}]*\}/gu) ?? [];
  for (const block of exportBlocks) {
    const match = block.match(/\b(create[A-Za-z0-9_]*Client)\b/u);
    if (match) return match[1];
  }
  return undefined;
}

function sourceImports(source) {
  const imports = [];
  for (const match of source.matchAll(/from\s+['"](@sdkwork\/[^'"]+)['"]/gu)) {
    imports.push(match[1]);
  }
  return imports;
}

function missingSdkworkDependencies(absolutePath) {
  const packagePath = path.join(absolutePath, 'package.json');
  if (!fs.existsSync(packagePath)) return undefined;
  const manifest = readJson(packagePath);
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
  const sources = [];
  const sourceRoot = path.join(absolutePath, 'generated', 'server-openapi', 'src');
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.name.endsWith('.ts')) sources.push(fs.readFileSync(absolute, 'utf8'));
    }
  }
  walk(sourceRoot);
  const indexSource = path.join(absolutePath, 'src', 'index.ts');
  if (fs.existsSync(indexSource)) sources.push(fs.readFileSync(indexSource, 'utf8'));
  for (const source of sources) {
    for (const dependency of sourceImports(source)) {
      const root = dependency.split('/').slice(0, 2).join('/');
      if (!declared.has(root)) {
        return `SDK package does not declare ${root}, but its source imports it`;
      }
    }
  }
  return undefined;
}

function languagePackageProblem(language, absolutePath) {
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return `SDK package path does not exist: ${absolutePath ?? '<unknown>'}`;
  }
  if (language.language === 'flutter' || language.language === 'dart') {
    if (!fs.existsSync(path.join(absolutePath, 'pubspec.yaml'))) {
      return 'Flutter SDK package is missing pubspec.yaml';
    }
  }
  if (language.language === 'typescript') {
    const missingDependency = missingSdkworkDependencies(absolutePath);
    if (missingDependency) return missingDependency;
    const source = sdkFacadeSource(absolutePath);
    if (source) {
      const distEntry = path.join(absolutePath, 'generated', 'server-openapi', 'dist', 'index.js');
      if (/generated\/server-openapi\/dist/iu.test(source) && !fs.existsSync(distEntry)) {
        return 'generated TypeScript transport dist is missing; build the dependency SDK before linking';
      }
      if (!discoverFactory(source)) {
        return 'SDK facade has no create*Client export';
      }
    }
  }
  return undefined;
}

function credentialModeForSurface(surface) {
  if (surface === 'open') return 'protected-open-api-flexible';
  if (surface === 'backend') return 'authenticated-backend-api';
  if (surface === 'internal') return 'internal-api';
  return 'authenticated-app-api';
}

function normalizeOverride(override = {}) {
  return {
    enabled: override.enabled !== false,
    permissions: Array.isArray(override.permissions) ? override.permissions : [],
    config: override.config && typeof override.config === 'object' ? override.config : {},
    settings: override.settings && typeof override.settings === 'object' ? override.settings : {},
  };
}

export function resolveComponents({
  workspace,
  target,
  selectedComponents,
  architectures,
  mode,
}) {
  const resolved = [];
  const issues = [];

  for (const selection of selectedComponents) {
    const definition = resolveComponent(selection.id);
    const override = normalizeOverride(selection);
    const entry = {
      ...definition,
      ...override,
      selectedConfig: { ...definition.defaultConfig, ...override.config },
      architectures: {},
      available: true,
      issues: [],
    };

    if (definition.kind !== 'runtime') {
      const componentRoot = path.join(workspace, definition.repo);
      const familyRoot = path.join(componentRoot, 'sdks', definition.sdkFamily);
      const manifestPath = path.join(familyRoot, 'sdk-manifest.json');
      if (!fs.existsSync(manifestPath)) {
        entry.available = false;
        entry.issues.push(
          `SDK family ${definition.sdkFamily} is missing at ${manifestPath}`,
        );
        issues.push(`${definition.id}: ${entry.issues[0]}`);
      } else {
        const manifest = readJson(manifestPath);
        manifest.__familyRoot = familyRoot;
        entry.sdkManifest = manifest;
        entry.familyRoot = familyRoot;
        entry.apiSurface = manifest.discoverySurface?.sdkTarget ?? definition.apiSurface ?? 'app';
        entry.apiPrefix = manifest.discoverySurface?.apiPrefix ?? '/app/v3/api';
        entry.apiAuthority = manifest.apiAuthority;
        entry.credentialMode = definition.credentialMode
          ?? credentialModeForSurface(entry.apiSurface);
      }
    }

    for (const architectureId of architectures) {
      const architecture = resolveArchitecture(architectureId);
      if (definition.kind === 'runtime') {
        const packages = definition.runtimePackages?.[architectureId] ?? [];
        entry.architectures[architectureId] = packages.length > 0
          ? {
            supported: true,
            mode: 'runtime',
            packages,
            sdkPackage: null,
            sdkPath: null,
          }
          : {
            supported: false,
            mode: 'runtime-unavailable',
            packages: [],
            sdkPackage: null,
            sdkPath: null,
            reason: `No runtime package is declared for ${architectureId}`,
          };
        continue;
      }
      if (!entry.available) {
        entry.architectures[architectureId] = {
          supported: false,
          mode: 'unavailable',
          reason: entry.issues[0],
        };
        continue;
      }
      const language = pickLanguage(entry.sdkManifest, architectureId);
      if (!language) {
        entry.architectures[architectureId] = {
          supported: false,
          mode: 'unsupported-language',
          reason: `${definition.sdkFamily} has no ${LANGUAGE_BY_ARCHITECTURE[architectureId].join('/')} output`,
        };
        continue;
      }
      const absolutePath = workspacePathForLanguage(
        path.join(workspace, definition.repo),
        entry.sdkManifest,
        language,
      );
      let packageName = packageNameForLanguage(entry.sdkManifest, language);
      let factory;
      if (language.language === 'typescript' && absolutePath) {
        const rootPackageJson = path.join(absolutePath, 'package.json');
        if (fs.existsSync(rootPackageJson)) {
          try {
            packageName = readJson(rootPackageJson).name ?? packageName;
          } catch {
            // Keep the manifest-provided package name when the package manifest is unreadable.
          }
        }
        factory = discoverFactory(sdkFacadeSource(absolutePath));
      }
      const packageProblem = languagePackageProblem(language, absolutePath);
      const relativePath = absolutePath
        ? path.relative(workspace, absolutePath).replaceAll('\\', '/')
        : undefined;
      if (packageProblem) {
        entry.architectures[architectureId] = {
          supported: false,
          mode: 'declared',
          language: language.language,
          packageName,
          sdkPackage: packageName,
          factory,
          sdkPath: absolutePath,
          sdkPathRelative: relativePath,
          sdkPathFromTarget: absolutePath
            ? path.relative(target, absolutePath).replaceAll('\\', '/')
            : undefined,
          reason: packageProblem,
        };
        continue;
      }
      entry.architectures[architectureId] = {
        supported: true,
        mode: mode === 'declared' ? 'declared' : 'linked',
        language: language.language,
        packageName,
        sdkPackage: packageName,
        factory,
        sdkPath: absolutePath,
        sdkPathRelative: relativePath,
        sdkPathFromTarget: absolutePath
          ? path.relative(target, absolutePath).replaceAll('\\', '/')
          : undefined,
        apiSurface: entry.apiSurface,
        credentialMode: entry.credentialMode,
        apiAuthority: entry.apiAuthority,
      };
    }

    resolved.push(entry);
  }

  return { components: resolved, issues };
}

export function collectWebSdkWorkspaceEntries({ workspace, target, resolvedComponents, architectures }) {
  const entries = new Set(
    BASE_WORKSPACE_ENTRIES.map((entry) => path.relative(target, path.join(workspace, entry)).replaceAll('\\', '/')),
  );
  for (const component of resolvedComponents) {
    for (const architectureId of architectures) {
      const architecture = resolveArchitecture(architectureId);
      if (architecture.kind !== 'web' && architecture.kind !== 'mini-program') continue;
      const integration = component.architectures[architectureId];
      if (!integration?.supported || integration.mode !== 'linked') continue;
      if (integration.language !== 'typescript' || !integration.sdkPathFromTarget) continue;
      entries.add(integration.sdkPathFromTarget);
    }
  }
  return [...entries].sort();
}

export function componentSummary(components) {
  return components.map((component) => ({
    id: component.id,
    title: component.title,
    category: component.category,
    repo: component.repo,
    kind: component.kind ?? 'sdk',
    sdkFamily: component.sdkFamily ?? null,
    permissionModuleId: component.permissionModuleId,
    config: component.selectedConfig,
    permissions: component.permissions,
    architectures: Object.fromEntries(
      Object.entries(component.architectures).map(([id, entry]) => [id, {
        supported: entry.supported,
        mode: entry.mode,
        language: entry.language ?? null,
        packageName: entry.packageName ?? null,
        sdkPath: entry.sdkPathFromTarget ?? entry.sdkPathRelative ?? null,
        reason: entry.reason ?? null,
      }]),
    ),
  }));
}

export function componentOptionsForArchitecture({ components, architectureId }) {
  return components
    .map((component) => ({
      component,
      integration: component.architectures[architectureId],
    }))
    .filter(({ integration }) => integration?.supported);
}

export function componentCompatibilityReport({ workspace, resolved }) {
  const report = [];
  for (const component of resolved.components) {
    for (const [architectureId, integration] of Object.entries(component.architectures)) {
      report.push({
        component: component.id,
        architecture: architectureId,
        supported: integration.supported,
        mode: integration.mode,
        language: integration.language ?? null,
        packageName: integration.packageName ?? null,
        sdkPath: integration.sdkPathRelative ?? null,
        reason: integration.reason ?? null,
      });
    }
  }
  return report;
}

export function componentCatalogForList(workspace) {
  return Object.values(COMPONENTS).map((component) => {
    const row = {
      id: component.id,
      title: component.title,
      category: component.category,
      repo: component.repo,
      kind: component.kind ?? 'sdk',
      sdkFamily: component.sdkFamily ?? null,
      defaultEnabled: Boolean(component.defaultEnabled),
      available: true,
      languages: [],
    };
    if (component.kind !== 'runtime') {
      const manifestPath = path.join(workspace, component.repo, 'sdks', component.sdkFamily, 'sdk-manifest.json');
      row.available = fs.existsSync(manifestPath);
      if (row.available) {
        const manifest = readJson(manifestPath);
        row.languages = (manifest.languages ?? []).map((language) => language.language);
      }
    } else {
      row.languages = Object.keys(component.runtimePackages ?? {});
    }
    return row;
  });
}
