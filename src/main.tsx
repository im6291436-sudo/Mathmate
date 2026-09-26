import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Mathmate has new updates available.');
  },
  onOfflineReady() {
    console.log('Mathmate is ready for offline use.');
  },
});

// Flag that React has started mounting
if (typeof window !== 'undefined') {
  (window as unknown as { __MATHMATE_MOUNTED__: boolean }).__MATHMATE_MOUNTED__ = true;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

