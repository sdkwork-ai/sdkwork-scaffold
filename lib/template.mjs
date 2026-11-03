import fs from 'node:fs';
import path from 'node:path';

const TOKEN_PATTERN = /__([A-Z][A-Z0-9_]*)__/gu;

export function listTemplateFiles(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Template directory does not exist: ${directory}`);
  }
  const files = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Template groups must not contain symbolic links: ${absolute}`);
      }
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      if (!entry.isFile()) {
        throw new Error(`Unsupported template entry: ${absolute}`);
      }
      files.push(path.relative(directory, absolute));
    }
  }

  walk(directory);
  return files;
}

export function renderTemplateText(template, variables, label = '<template>') {
  const rendered = template.replace(TOKEN_PATTERN, (_match, token) => {
    if (!Object.prototype.hasOwnProperty.call(variables, token)) {
      throw new Error(`Unknown template variable __${token}__ in ${label}`);
    }
    return String(variables[token]);
  });

  const unresolved = [...rendered.matchAll(TOKEN_PATTERN)]
    .map((match) => `__${match[1]}__`)
    .filter((token, index, all) => all.indexOf(token) === index);
  if (unresolved.length > 0) {
    throw new Error(`Unresolved template variables in ${label}: ${unresolved.join(', ')}`);
  }
  return rendered;
}

export function renderTemplatePath(relativePath, variables) {
  const segments = relativePath.split(/[\\/]/u);
  for (const segment of segments) {
    if (segment === '..' || segment === '') {
      throw new Error(`Template path must be relative and may not contain empty segments: ${relativePath}`);
    }
  }
  return renderTemplateText(relativePath.replaceAll('\\', '/'), variables, relativePath);
}

export function copyTemplateGroup({
  templateDirectory,
  targetDirectory,
  variables,
  targetRoot,
  files,
}) {
  const written = [];
  const sourceFiles = listTemplateFiles(templateDirectory);
  for (const sourceRelative of sourceFiles) {
    const renderedRelative = renderTemplatePath(sourceRelative, variables);
    const destination = path.resolve(targetDirectory, renderedRelative);
    const resolvedRoot = path.resolve(targetRoot);
    const relative = path.relative(resolvedRoot, destination);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Template path escapes the target root: ${renderedRelative}`);
    }

    const source = path.join(templateDirectory, sourceRelative);
    const content = fs.readFileSync(source, 'utf8');
    const rendered = renderTemplateText(content, variables, renderedRelative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, rendered, 'utf8');
    written.push(relative.replaceAll('\\', '/'));
  }
  return { written, files };
}
