import { createIntegratedSdkClients } from './sdkClients';
import { runtimeBaseUrl, sessionTokenManager } from './sessionRuntime';

export { runtimeBaseUrl, sessionTokenManager };

export const sdkClients = runtimeBaseUrl.length > 0
  ? createIntegratedSdkClients({
      baseUrl: runtimeBaseUrl,
      tokenManager: sessionTokenManager,
    })
  : null;
