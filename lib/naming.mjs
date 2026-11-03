export function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function upperSnake(value) {
  return value.replaceAll('-', '_').toUpperCase();
}

export function snakeCase(value) {
  return value.replaceAll('-', '_');
}

export function pascalCase(value) {
  return value
    .split(/[-_]/u)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

export function applicationRootName(code, architecture) {
  return `sdkwork-${code}-${architecture.suffix}`;
}

export function applicationRootPath(code, architecture) {
  return `apps/${applicationRootName(code, architecture)}`;
}

export function dartPackageName(code, architecture) {
  if (architecture.kind !== 'flutter') {
    throw new Error(`No Dart package name for architecture ${architecture.id}`);
  }
  return `sdkwork_${snakeCase(code)}_flutter_mobile`;
}

export function androidNamespace(code, suffix = '') {
  const base = `com.sdkwork.${snakeCase(code)}.android.mobile`;
  return suffix ? `${base}.${snakeCase(suffix)}` : base;
}

export function iosModuleName(code) {
  return `Sdkwork${pascalCase(code)}IosMobile`;
}

export function harmonyBundleName(code) {
  return `com.sdkwork.${snakeCase(code).replaceAll('_', '.')}.mobile`;
}

export function appIdentifier(code) {
  return `com.sdkwork.${code.replaceAll('-', '')}`;
}
