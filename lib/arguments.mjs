import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import {
  APP_TYPES,
  ARCHITECTURES,
  DEFAULT_ARCHITECTURES,
  SCAFFOLD_VERSION,
  resolveArchitecture,
} from '../scaffold.config.mjs';
import {
  COMPONENTS,
  DEFAULT_COMPONENTS,
  resolveComponent,
} from '../components.config.mjs';

const CODE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const OWNER_PATTERN = /^[a-z0-9][a-z0-9._-]*$/u;

export const USAGE = `SDKWork project scaffold ${SCAFFOLD_VERSION}

Usage:
  node bin/sdkwork-scaffold.mjs --code <application-code> --target <directory> [options]
  node bin/sdkwork-scaffold.mjs --list
  node bin/sdkwork-scaffold.mjs --list-components
  node bin/sdkwork-scaffold.mjs --list-architectures

Required:
  --code <code>            Lower kebab-case application code, for example "recruitment".
  --target <directory>     Empty directory to initialize. Use --force to regenerate a scaffold-managed target.

Options:
  --name <display-name>    Human display name. Defaults to the title-cased code.
  --owner <team>           Owning team. Defaults to "sdkwork-platform".
  --domain <domain>        Domain name. Defaults to the application code.
  --description <text>     One-sentence application description.
  --architectures <csv>    Architectures to generate. Defaults to "${DEFAULT_ARCHITECTURES.join(',')}".
                           Supported: ${Object.keys(ARCHITECTURES).join(', ')}.
  --surfaces <csv>         Backward-compatible alias for --architectures.
  --components <csv|all|none>
                           Common components to integrate. Defaults to "${DEFAULT_COMPONENTS.join(',')}".
                           Supported: ${Object.keys(COMPONENTS).join(', ')}.
  --all-components         Integrate every registered component compatible with a selected architecture.
  --component-config <file>
                           JSON overrides for component enablement, permissions, and typed config.
  --component-mode <mode>  linked (default) or declared. linked adds real SDK dependencies for supported architectures.
  --app-type <type>        SDKWork app type. Defaults from the primary architecture. Supported: ${APP_TYPES.join(', ')}.
  --specs <directory>      sdkwork-specs checkout. Defaults to a sibling sdkwork-specs directory.
  --workspace <directory>  SDKWork sibling repository workspace. Defaults to the target parent.
  --site-url <url>         Public application website. Defaults to https://sdkwork.com/apps/sdkwork-<code>.
  --no-git                 Do not initialize a git repository on branch main.
  --no-install             Do not run pnpm install after generation.
  --dry-run                Print the generation plan without writing files.
  --force                  Regenerate a directory that already contains a scaffold marker.
  --verify                 Run the local generated-repository contract checks.
  --list                   Print the template registry and exit.
  --list-components        Print the component registry and exit.
  --list-architectures     Print the architecture registry and exit.
  --help                   Print this help.
`;

function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function normalizeList(value, label) {
  const requested = String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (requested.length === 0) {
    throw new Error(`${label} must list at least one value.`);
  }
  return [...new Set(requested)];
}

function normalizeArchitectures(values) {
  const raw = values.architectures ?? values.surfaces;
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return [...DEFAULT_ARCHITECTURES];
  }
  const requested = normalizeList(raw, '--architectures');
  if (requested.includes('all')) {
    return Object.keys(ARCHITECTURES);
  }
  for (const id of requested) resolveArchitecture(id);
  return requested;
}

function normalizeComponents(values) {
  if (values['all-components']) {
    return Object.keys(COMPONENTS);
  }
  if (values.components === undefined || values.components === null) {
    return [...DEFAULT_COMPONENTS];
  }
  const raw = String(values.components).trim().toLowerCase();
  if (raw === 'all') return Object.keys(COMPONENTS);
  if (raw === 'none') return [];
  const requested = normalizeList(raw, '--components');
  for (const id of requested) resolveComponent(id);
  return requested;
}

function readComponentConfig(file) {
  if (!file) return {};
  const resolved = path.resolve(file);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolved, 'utf8').replace(/^\uFEFF/u, ''));
  } catch (error) {
    throw new Error(`--component-config is not readable JSON: ${error.message}`);
  }
  const source = parsed?.components && typeof parsed.components === 'object'
    ? parsed.components
    : parsed;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('--component-config must be a JSON object keyed by component id.');
  }
  const normalized = {};
  for (const [id, value] of Object.entries(source)) {
    resolveComponent(id);
    if (value === false) {
      normalized[id] = { enabled: false };
      continue;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`--component-config.${id} must be an object or false.`);
    }
    normalized[id] = value;
  }
  return normalized;
}

function normalizeComponentsWithConfig(values) {
  const selected = normalizeComponents(values);
  const overrides = readComponentConfig(values['component-config']);
  const result = new Map(selected.map((id) => [id, { ...overrides[id] }]));

  for (const [id, override] of Object.entries(overrides)) {
    if (override.enabled === false) {
      result.delete(id);
      continue;
    }
    if (!result.has(id)) {
      result.set(id, { ...override });
    }
  }

  return [...result.entries()].map(([id, override]) => ({ id, ...override }));
}

function defaultAppType(architectures) {
  const primary = architectures[0];
  if (primary === 'flutter') return 'APP_FLUTTER';
  if (primary === 'harmony') return 'APP_HARMONY';
  if (primary === 'mini-program') return 'APP_UNIAPP';
  return 'APP_REACT';
}

export function parseScaffoldArguments(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      code: { type: 'string' },
      target: { type: 'string' },
      name: { type: 'string' },
      owner: { type: 'string' },
      domain: { type: 'string' },
      description: { type: 'string' },
      'app-type': { type: 'string' },
      architectures: { type: 'string' },
      surfaces: { type: 'string' },
      components: { type: 'string' },
      'all-components': { type: 'boolean', default: false },
      'component-config': { type: 'string' },
      'component-mode': { type: 'string', default: 'linked' },
      specs: { type: 'string' },
      workspace: { type: 'string' },
      'site-url': { type: 'string' },
      'no-git': { type: 'boolean', default: false },
      'no-install': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      verify: { type: 'boolean', default: true },
      list: { type: 'boolean', default: false },
      'list-components': { type: 'boolean', default: false },
      'list-architectures': { type: 'boolean', default: false },
      'self-check': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  if (
    values.help
    || values.list
    || values['list-components']
    || values['list-architectures']
    || values['self-check']
  ) {
    return {
      help: values.help,
      list: values.list,
      listComponents: values['list-components'],
      listArchitectures: values['list-architectures'],
      selfCheck: values['self-check'],
    };
  }

  const code = String(values.code ?? '').trim();
  if (!CODE_PATTERN.test(code)) {
    throw new Error('--code is required and must be lower kebab-case, for example "recruitment".');
  }

  const target = String(values.target ?? '').trim();
  if (!target) {
    throw new Error('--target is required.');
  }
  const resolvedTarget = path.resolve(target);

  const owner = String(values.owner ?? 'sdkwork-platform').trim();
  if (!OWNER_PATTERN.test(owner)) {
    throw new Error('--owner must be a lower-case team identifier such as "sdkwork-platform".');
  }

  const architectures = normalizeArchitectures(values);
  for (const id of architectures) {
    const architecture = resolveArchitecture(id);
    if (!['web', 'mini-program', 'flutter', 'ios', 'android', 'harmony'].includes(architecture.kind)) {
      throw new Error(`Architecture "${id}" is registered without a template kind.`);
    }
  }

  const componentMode = String(values['component-mode'] ?? 'linked').trim().toLowerCase();
  if (!['linked', 'declared'].includes(componentMode)) {
    throw new Error('--component-mode must be "linked" or "declared".');
  }

  const explicitAppType = values['app-type']
    ? String(values['app-type']).trim().toUpperCase()
    : undefined;
  const appType = explicitAppType ?? defaultAppType(architectures);
  if (!APP_TYPES.includes(appType)) {
    throw new Error(`--app-type must be one of: ${APP_TYPES.join(', ')}`);
  }

  const siteUrl = String(values['site-url'] ?? `https://sdkwork.com/apps/sdkwork-${code}`).trim();
  let parsedSiteUrl;
  try {
    parsedSiteUrl = new URL(siteUrl);
  } catch {
    throw new Error('--site-url must be an absolute HTTP(S) URL.');
  }
  if (!['http:', 'https:'].includes(parsedSiteUrl.protocol)) {
    throw new Error('--site-url must use http or https.');
  }

  const domain = String(values.domain ?? code).trim();
  if (!CODE_PATTERN.test(domain)) {
    throw new Error('--domain must be lower kebab-case.');
  }

  const name = String(values.name ?? titleCase(code)).trim();
  if (name.length === 0 || name.length > 120) {
    throw new Error('--name must be between 1 and 120 characters.');
  }

  const description = String(
    values.description ?? `${name} application initialized from the SDKWork scaffold.`,
  ).trim();

  return {
    code,
    target: resolvedTarget,
    name,
    owner,
    domain,
    description,
    appType,
    architectures,
    surfaces: architectures,
    components: normalizeComponentsWithConfig(values),
    componentMode,
    specs: values.specs ? path.resolve(values.specs) : undefined,
    workspace: values.workspace ? path.resolve(values.workspace) : path.dirname(resolvedTarget),
    siteUrl: parsedSiteUrl.toString().replace(/\/$/u, ''),
    initGit: !values['no-git'],
    install: !values['no-install'],
    dryRun: values['dry-run'],
    force: values.force,
    verify: values.verify,
  };
}

export { CODE_PATTERN };
