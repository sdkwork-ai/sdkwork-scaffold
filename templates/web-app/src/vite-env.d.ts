/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SDKWORK_DEPLOYMENT_PROFILE?: string;
  readonly VITE_SDKWORK_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
