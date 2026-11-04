export interface AppRuntimeEnvironment {
  readonly appCode: string;
  readonly architecture: string;
  readonly profile: string;
  readonly environment: string;
  readonly apiBaseUrl: string | null;
}

function normalized(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function readAppRuntimeEnvironment(
  env: ImportMetaEnv = import.meta.env,
): AppRuntimeEnvironment {
  const apiBaseUrl = normalized(env.VITE_SDKWORK_API_BASE_URL);
  return {
    appCode: 'sdkwork-__APP_CODE__',
    architecture: '__SURFACE__',
    profile: normalized(env.VITE_SDKWORK_DEPLOYMENT_PROFILE) || normalized(env.MODE) || 'standalone',
    environment: normalized(env.VITE_SDKWORK_ENVIRONMENT) || normalized(env.MODE) || 'development',
    apiBaseUrl: apiBaseUrl.length > 0 ? apiBaseUrl : null,
  };
}

export function describeRuntime(env: AppRuntimeEnvironment): string {
  return [
    env.appCode,
    env.architecture,
    env.profile,
    env.environment,
    env.apiBaseUrl ? 'api-configured' : 'api-unconfigured',
  ].join(' · ');
}
