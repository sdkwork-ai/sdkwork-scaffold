import { createTokenManager } from '@sdkwork/sdk-common';

function normalized(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

export const runtimeBaseUrl = normalized(import.meta.env.VITE_SDKWORK_API_BASE_URL);

/**
 * One token manager is shared by every selected app SDK. Business code must use
 * this runtime instance instead of constructing a second session source.
 */
export const sessionTokenManager = createTokenManager();
