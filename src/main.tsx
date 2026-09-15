// Safe window.fetch getter/setter guard for iframe environments
try {
  if (typeof window !== 'undefined') {
    const targets: any[] = [window];
    let curr: any = window;
    while (curr && curr !== Object.prototype) {
      try {
        const proto = Object.getPrototypeOf(curr);
        if (proto && proto !== Object.prototype && targets.indexOf(proto) === -1) {
          targets.push(proto);
        }
        curr = proto;
      } catch {
        break;
      }
    }
    if (typeof Window !== 'undefined' && Window.prototype && targets.indexOf(Window.prototype) === -1) {
      targets.push(Window.prototype);
    }

    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    let activeFetch = originalFetch;

    for (const target of targets) {
      if (!target) continue;
      try {
        const descriptor = Object.getOwnPropertyDescriptor(target, 'fetch');
        if (descriptor && (!descriptor.writable || !descriptor.set)) {
          Object.defineProperty(target, 'fetch', {
            get: () => activeFetch,
            set: (fn) => { activeFetch = fn; },
            configurable: true,
            enumerable: true
          });
        }
      } catch {
        // continue
      }
    }

    try {
      Object.defineProperty(window, 'fetch', {
        get: () => activeFetch,
        set: (fn) => { activeFetch = fn; },
        configurable: true,
        enumerable: true
      });
    } catch {
      // continue
    }
  }
} catch {
  // Silent fallback
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AuthGate } from './components/AuthGate';
import App from './App.tsx';
import {VerifyPage} from './verify/VerifyPage.tsx';
import './index.css';

const isVerifyRoute = window.location.pathname.startsWith('/verify/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isVerifyRoute ? <VerifyPage /> : <AuthGate><App /></AuthGate>}
  </StrictMode>,
);

