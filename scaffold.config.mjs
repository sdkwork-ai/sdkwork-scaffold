/**
 * SDKWork scaffold registry.
 *
 * A template group is copied once per invocation. A group that declares
 * `perSurface` is copied once for each selected web surface and receives
 * `SURFACE`, `SURFACE_TITLE`, and `SURFACE_PORT` variables.
 *
 * To add another architecture:
 *   1. add its descriptor to SURFACES;
 *   2. add a `perSurface` template group whose `template` directory exists;
 *   3. cover it in tests/scaffold.test.mjs.
 */
export const SCAFFOLD_VERSION = '1.0.0';

export const APP_TYPES = [
  'APP_REACT',
  'APP_VUE',
  'APP_HTML',
  'APP_FLUTTER',
  'APP_UNIAPP',
  'APP_UNITY',
  'APP_HARMONY',
  'SDK',
  'PPT',
  'VIDEO',
  'POSTER',
  'NONE',
];

export const WEB_SURFACES = {
  pc: {
    id: 'pc',
    title: 'PC',
    packageSuffix: 'pc',
    devPort: 4173,
    componentType: 'pc-app',
    architectureSpec: 'APP_PC_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_PC_REACT_UI_SPEC.md',
    description: 'Large-screen browser and desktop renderer.',
  },
  h5: {
    id: 'h5',
    title: 'H5',
    packageSuffix: 'h5',
    devPort: 4174,
    componentType: 'h5-app',
    architectureSpec: 'APP_H5_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_MOBILE_REACT_UI_SPEC.md',
    description: 'Phone-first mobile browser renderer.',
  },
};

export const DEFAULT_SURFACES = ['pc', 'h5'];

export const TEMPLATE_GROUPS = [
  {
    id: 'repository',
    template: 'repository',
    target: '.',
    description: 'Repository baseline, root layout, documentation, config, scripts, and tests.',
  },
  {
    id: 'web-app',
    template: 'web-app',
    target: 'apps/sdkwork-__APP_CODE__-__SURFACE__',
    perSurface: true,
    description: 'React/Vite web application surface shell.',
  },
];

export function resolveSurface(id) {
  const surface = WEB_SURFACES[id];
  if (!surface) {
    throw new Error(
      `Unknown surface "${id}". Supported surfaces: ${Object.keys(WEB_SURFACES).join(', ')}`,
    );
  }
  return surface;
}
