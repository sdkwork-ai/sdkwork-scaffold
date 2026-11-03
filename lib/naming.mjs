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

export function applicationRootName(code, surface) {
  return `sdkwork-${code}-${surface}`;
}

export function applicationRootPath(code, surface) {
  return `apps/${applicationRootName(code, surface)}`;
}
