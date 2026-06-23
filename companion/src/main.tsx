import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

console.log('[renderer] startup', {
  href: window.location.href,
  electronAPI: Boolean(window.electronAPI),
});

window.addEventListener('error', (event) => {
  console.error('[renderer] uncaught error', event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[renderer] unhandled rejection', event.reason);
});

class RendererErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[renderer] React render failed', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="renderer-error">
          <h1>Nezuko could not start</h1>
          <pre>{this.state.error.message}</pre>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Renderer root element #root was not found');
}

console.log('[renderer] root element found', rootElement);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RendererErrorBoundary>
      <App />
    </RendererErrorBoundary>
  </React.StrictMode>
);

console.log('[renderer] root mount scheduled');
