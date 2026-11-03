import path from 'node:path';
import { parseArgs } from 'node:util';

import {
  APP_TYPES,
  DEFAULT_SURFACES,
  SCAFFOLD_VERSION,
  WEB_SURFACES,
  resolveSurface,
} from '../scaffold.config.mjs';

const CODE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const OWNER_PATTERN = /^[a-z0-9][a-z0-9._-]*$/u;

export const USAGE = `SDKWork project scaffold ${SCAFFOLD_VERSION}

Usage:
  node bin/sdkwork-scaffold.mjs --code <application-code> --target <directory> [options]
  node bin/sdkwork-scaffold.mjs --list

Required:
  --code <code>            Lower kebab-case application code, for example "recruitment".
  --target <directory>     Empty directory to initialize. Use --force to regenerate a scaffold-managed target.

Options:
  --name <display-name>    Human display name. Defaults to the title-cased code.
  --owner <team>           Owning team. Defaults to "sdkwork-platform".
  --domain <domain>        Domain name. Defaults to the application code.
  --description <text>     One-sentence application description.
  --app-type <type>        SDKWork app type. Defaults to APP_REACT. Supported: ${APP_TYPES.join(', ')}.
  --surfaces <csv>         Web surfaces to generate. Defaults to "${DEFAULT_SURFACES.join(',')}". Supported: ${Object.keys(WEB_SURFACES).join(', ')}.
  --specs <directory>      sdkwork-specs checkout. Defaults to a sibling sdkwork-specs directory.
  --site-url <url>         Public application website. Defaults to https://sdkwork.com/apps/sdkwork-<code>.
  --no-git                 Do not initialize a git repository on branch main.
  --no-install             Do not run pnpm install after generation.
  --dry-run                Print the generation plan without writing files.
  --force                  Regenerate a directory that already contains a scaffold marker.
  --verify                 Run the local generated-repository contract checks.
  --list                   Print the template registry and exit.
  --help                   Print this help.
`;

function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function normalizeSurfaces(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return [...DEFAULT_SURFACES];
  }
  const requested = String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (requested.length === 0) {
    throw new Error('--surfaces must list at least one surface.');
  }
  const unique = [...new Set(requested)];
  for (const id of unique) resolveSurface(id);
  return unique;
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
      surfaces: { type: 'string' },
      specs: { type: 'string' },
      'site-url': { type: 'string' },
      'no-git': { type: 'boolean', default: false },
      'no-install': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
      verify: { type: 'boolean', default: true },
      list: { type: 'boolean', default: false },
      'self-check': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || values.list || values['self-check']) {
    return {
      help: values.help,
      list: values.list,
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

  const owner = String(values.owner ?? 'sdkwork-platform').trim();
  if (!OWNER_PATTERN.test(owner)) {
    throw new Error('--owner must be a lower-case team identifier such as "sdkwork-platform".');
  }

  const appType = String(values['app-type'] ?? 'APP_REACT').trim().toUpperCase();
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
    target: path.resolve(target),
    name,
    owner,
    domain,
    description,
    appType,
    surfaces: normalizeSurfaces(values.surfaces),
    specs: values.specs ? path.resolve(values.specs) : undefined,
    siteUrl: parsedSiteUrl.toString().replace(/\/$/u, ''),
    initGit: !values['no-git'],
    install: !values['no-install'],
    dryRun: values['dry-run'],
    force: values.force,
    verify: values.verify,
  };
}

export { CODE_PATTERN };
