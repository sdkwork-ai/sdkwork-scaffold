import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { AppErrorBoundary } from './appbase/AppErrorBoundary';
import { describeRuntime, readAppRuntimeEnvironment } from './appbase/runtime';
import './index.css';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Application root element #root is missing.');
}

const runtime = readAppRuntimeEnvironment();
if (import.meta.env.DEV) {
  console.info(`[sdkwork] ${describeRuntime(runtime)}`);
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
