import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const deploymentProfile = process.env.SDKWORK_DEPLOYMENT_PROFILE ?? 'standalone';
const environment = process.env.SDKWORK_ENVIRONMENT ?? 'prod';
const port = Number(process.env.SDKWORK_DEV_PORT ?? '__SURFACE_PORT__');

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SDKWORK_DEPLOYMENT_PROFILE': JSON.stringify(deploymentProfile),
    'import.meta.env.VITE_SDKWORK_ENVIRONMENT': JSON.stringify(environment),
  },
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port,
    strictPort: true,
  },
  build: {
    outDir: `dist/${deploymentProfile}/${environment}`,
    emptyOutDir: true,
    sourcemap: true,
  },
});
